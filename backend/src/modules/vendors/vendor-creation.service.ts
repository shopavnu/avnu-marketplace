import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';

/**
 * Interface for application form data
 */
interface IVendorFormData {
  businessName: string;
  businessEmail: string;
  phone: string;
  businessType: string;
  businessId: string;
  productCategories: string[];
  productDescription?: string;
  bankName: string;
  accountHolderName: string;
  accountNumber: string;
  routingNumber: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  [key: string]: unknown;
}

import { AddressType, VendorAddress } from './entities/vendor-address.entity';
import { VendorApplication } from './entities/vendor-application.entity';
import { VendorBankingDetails } from './entities/vendor-banking-details.entity';
import { VendorDocument } from './entities/vendor-document.entity';
import { Vendor, VendorStatus } from './entities/vendor.entity';
import { TransactionService } from '../../common/transaction.service';
import { VendorEventBus } from '../../events/vendor-event-bus.service';

/**
 * Repository helper service to reduce constructor injection
 */
@Injectable()
export class VendorRepositories {
  constructor(
    @InjectRepository(Vendor)
    public readonly vendor: Repository<Vendor>,
    @InjectRepository(VendorApplication)
    public readonly vendorApplication: Repository<VendorApplication>,
    @InjectRepository(VendorDocument)
    public readonly vendorDocument: Repository<VendorDocument>,
    @InjectRepository(VendorBankingDetails)
    public readonly vendorBankingDetails: Repository<VendorBankingDetails>,
    @InjectRepository(VendorAddress)
    public readonly vendorAddress: Repository<VendorAddress>,
  ) {}
}

/**
 * Service responsible for creating vendor accounts from approved applications
 * Focused solely on the vendor creation process
 */
@Injectable()
export class VendorCreationService {
  private readonly _logger = new Logger(VendorCreationService.name);

  constructor(
    private readonly _repositories: VendorRepositories,
    private readonly _transactionService: TransactionService,
    private readonly _eventBus: VendorEventBus,
  ) {}

  /**
   * Create a vendor record from an approved application
   */
  async createVendorFromApplication(applicationId: string): Promise<Vendor> {
    const application = await this._validateAndFetchApplication(applicationId);

    // Check if vendor already created
    const existingVendor = await this._checkForExistingVendor(application);
    if (existingVendor) {
      return existingVendor;
    }

    // Create vendor within transaction
    return this._transactionService.executeInTransaction(async entityManager => {
      const savedVendor = await this._createVendorEntity(entityManager, application);
      await this._createBankingDetails(entityManager, savedVendor, application.formData);
      await this._createAddressIfProvided(entityManager, savedVendor, application.formData);
      await this._linkDocumentsToVendor(entityManager, savedVendor.id, application.id);
      await this._updateApplicationWithVendorId(entityManager, application, savedVendor.id);

      // Publish vendor created event
      this._eventBus.publishVendorCreated({
        vendorId: savedVendor.id,
        applicationId: application.id,
        timestamp: new Date(),
      });

      return savedVendor;
    });
  }

  /**
   * Validate that the application exists and is approved
   */
  private async _validateAndFetchApplication(applicationId: string): Promise<VendorApplication> {
    const application = await this._repositories.vendorApplication.findOne({
      where: { id: applicationId },
    });

    if (!application) {
      throw new NotFoundException(`Application with ID ${applicationId} not found`);
    }

    if (application.status !== VendorStatus.APPROVED) {
      throw new Error(`Cannot create vendor from application with status ${application.status}`);
    }

    return application;
  }

  /**
   * Check if a vendor already exists for this application
   */
  private async _checkForExistingVendor(application: VendorApplication): Promise<Vendor | null> {
    if (application.vendorId) {
      const existingVendor = await this._repositories.vendor.findOne({
        where: { id: application.vendorId },
      });

      if (existingVendor) {
        return existingVendor;
      }
    }

    return null;
  }

  /**
   * Create the vendor entity from application data
   */
  private async _createVendorEntity(
    entityManager: EntityManager,
    application: VendorApplication,
  ): Promise<Vendor> {
    const formData = application.formData;

    const vendor = new Vendor();
    vendor.businessName = formData.businessName;
    vendor.businessEmail = formData.businessEmail;
    vendor.phone = formData.phone;
    vendor.businessType = formData.businessType;
    vendor.businessId = formData.businessId;
    vendor.productCategories = formData.productCategories;
    vendor.status = VendorStatus.APPROVED;

    // Set default commission rate based on business type
    vendor.commissionRate = this._getDefaultCommissionRate(formData.businessType);

    return entityManager.save(vendor);
  }

  /**
   * Create banking details for the vendor
   */
  private async _createBankingDetails(
    entityManager: EntityManager,
    vendor: Vendor,
    formData: IVendorFormData,
  ): Promise<void> {
    const bankingDetails = new VendorBankingDetails();
    bankingDetails.vendorId = vendor.id;
    bankingDetails.bankName = formData.bankName;
    bankingDetails.accountHolderName = formData.accountHolderName;
    bankingDetails.accountNumber = formData.accountNumber;
    bankingDetails.routingNumber = formData.routingNumber;

    await entityManager.save(bankingDetails);
  }

  /**
   * Create an address for the vendor if address data is provided
   */
  private async _createAddressIfProvided(
    entityManager: EntityManager,
    vendor: Vendor,
    formData: IVendorFormData,
  ): Promise<void> {
    if (formData.addressLine1) {
      const address = new VendorAddress();
      address.vendorId = vendor.id;
      address.addressType = AddressType.BUSINESS;
      address.addressLine1 = formData.addressLine1 || '';
      address.addressLine2 = formData.addressLine2 || '';
      address.city = formData.city || '';
      address.state = formData.state || '';
      address.postalCode = formData.postalCode || '';
      address.country = formData.country || '';
      address.isDefault = true;

      await entityManager.save(address);
    }
  }

  /**
   * Link documents from the application to the vendor
   */
  private async _linkDocumentsToVendor(
    entityManager: EntityManager,
    vendorId: string,
    applicationId: string,
  ): Promise<void> {
    const documents = await this._repositories.vendorDocument.find({
      where: { application: { id: applicationId } },
    });

    for (const document of documents) {
      document.vendorId = vendorId;
      await entityManager.save(document);
    }
  }

  /**
   * Update application with vendor ID
   */
  private async _updateApplicationWithVendorId(
    entityManager: EntityManager,
    application: VendorApplication,
    vendorId: string,
  ): Promise<void> {
    application.vendorId = vendorId;
    await entityManager.save(application);
  }

  /**
   * Get default commission rate based on business type
   */
  private _getDefaultCommissionRate(businessType: string): number {
    switch (businessType) {
      case 'individual':
        return 15.0;
      case 'llc':
      case 'corporation':
        return 12.5;
      case 'partnership':
        return 13.5;
      default:
        return 15.0;
    }
  }
}
