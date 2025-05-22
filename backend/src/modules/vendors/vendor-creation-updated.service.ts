import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryRunner, Repository } from 'typeorm';

import { VendorAddress, AddressType } from './entities/vendor-address.entity';
import { VendorApplication } from './entities/vendor-application.entity';
import { VendorBankingDetails } from './entities/vendor-banking-details.entity';
import { VendorDocument } from './entities/vendor-document.entity';
import { Vendor, VendorStatus } from './entities/vendor.entity';
import { TransactionService } from '../../common/transaction/transaction.service';
import { VendorConfigService } from '../../config/vendor-config.service';
import { VendorEventBus } from '../../events/vendor-event-bus.service';

/**
 * Interface for banking details form data
 */
interface IBankingFormData {
  bankName: string;
  accountHolderName: string;
  accountNumber: string;
  routingNumber: string;
  [key: string]: unknown;
}

/**
 * Interface for address form data
 */
interface IAddressFormData {
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  [key: string]: unknown;
}

/**
 * Class to group vendor repositories together to reduce constructor parameters
 */
@Injectable()
export class VendorRepositoriesUpdated {
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
 * Now using centralized configuration service
 */
@Injectable()
export class VendorCreationService {
  private readonly _logger = new Logger(VendorCreationService.name);

  constructor(
    private readonly _repositories: VendorRepositoriesUpdated,
    private readonly _transactionService: TransactionService,
    private readonly _eventBus: VendorEventBus,
    private readonly _configService: VendorConfigService, // Centralized config service
  ) {}

  /**
   * Create a vendor record from an approved application
   * @param applicationId - ID of the approved application
   * @returns The created vendor entity
   */
  async createVendorFromApplication(applicationId: string): Promise<Vendor> {
    // Verify the application exists and is approved
    const application = await this._repositories.vendorApplication.findOne({
      where: { id: applicationId },
    });

    if (!application) {
      throw new NotFoundException(`Application with ID ${applicationId} not found`);
    }

    if (application.status !== VendorStatus.APPROVED) {
      throw new Error(`Cannot create vendor from application with status ${application.status}`);
    }

    // Check if vendor already created
    if (application.vendorId) {
      const existingVendor = await this._repositories.vendor.findOne({
        where: { id: application.vendorId },
      });

      if (existingVendor) {
        return existingVendor;
      }
    }

    // Create vendor within transaction
    return this._transactionService.executeInTransaction(async queryRunner => {
      // Create and save the main vendor entity
      const savedVendor = await this._createVendorEntity(application, queryRunner);

      // Create associated vendor records (banking, address, etc.)
      await this._createVendorAssociatedRecords(savedVendor, application, queryRunner);

      // Publish the vendor created event
      this._publishVendorCreatedEvent(savedVendor.id, application.id);

      return savedVendor;
    });
  }

  /**
   * Create and save the main vendor entity
   * @param application - The application data
   * @param queryRunner - Transaction query runner
   * @returns The saved vendor entity
   */
  private async _createVendorEntity(
    application: VendorApplication,
    queryRunner: QueryRunner,
  ): Promise<Vendor> {
    const formData = application.formData;

    // Create vendor
    const vendor = new Vendor();
    vendor.businessName = formData.businessName;
    vendor.businessEmail = formData.businessEmail;
    vendor.phone = formData.phone;
    vendor.businessType = formData.businessType;
    vendor.businessId = formData.businessId;
    vendor.productCategories = formData.productCategories;
    vendor.status = VendorStatus.APPROVED;

    // Set default commission rate using centralized config service
    vendor.commissionRate = this._configService.defaultCommissionRate;

    // Save vendor
    return await queryRunner.manager.save(vendor);
  }

  /**
   * Create and save associated vendor records
   * @param vendor - The main vendor entity
   * @param application - The application data
   * @param queryRunner - Transaction query runner
   */
  private async _createVendorAssociatedRecords(
    vendor: Vendor,
    application: VendorApplication,
    queryRunner: QueryRunner,
  ): Promise<void> {
    const formData = application.formData;

    // Create banking details
    await this._createBankingDetails(vendor.id, formData, queryRunner);

    // Create business address if provided
    if (formData.addressLine1) {
      await this._createBusinessAddress(vendor.id, formData, queryRunner);
    }

    // Link documents to the vendor
    await this._linkDocumentsToVendor(vendor.id, application, queryRunner);

    // Link vendor to application
    application.vendorId = vendor.id;
    await queryRunner.manager.save(application);
  }

  /**
   * Create and save banking details
   * @param vendorId - ID of the vendor
   * @param formData - Application form data containing banking details
   * @param queryRunner - Transaction query runner
   */
  private async _createBankingDetails(
    vendorId: string,
    formData: IBankingFormData,
    queryRunner: QueryRunner,
  ): Promise<void> {
    const bankingDetails = new VendorBankingDetails();
    bankingDetails.vendorId = vendorId;
    bankingDetails.bankName = formData.bankName;
    bankingDetails.accountHolderName = formData.accountHolderName;
    bankingDetails.accountNumber = formData.accountNumber;
    bankingDetails.routingNumber = formData.routingNumber;

    await queryRunner.manager.save(bankingDetails);
  }

  /**
   * Create and save business address
   * @param vendorId - ID of the vendor
   * @param formData - Application form data containing address information
   * @param queryRunner - Transaction query runner
   */
  private async _createBusinessAddress(
    vendorId: string,
    formData: IAddressFormData,
    queryRunner: QueryRunner,
  ): Promise<void> {
    const address = new VendorAddress();
    address.vendorId = vendorId;
    address.addressType = AddressType.BUSINESS;
    address.addressLine1 = formData.addressLine1;
    address.addressLine2 = formData.addressLine2 || ''; // Use empty string as fallback for undefined
    address.city = formData.city;
    address.state = formData.state;
    address.postalCode = formData.postalCode;
    address.country = formData.country;
    address.isDefault = true;

    await queryRunner.manager.save(address);
  }

  /**
   * Link documents to vendor
   * @param vendorId - ID of the vendor
   * @param application - The application data containing documents
   * @param queryRunner - Transaction query runner
   */
  private async _linkDocumentsToVendor(
    vendorId: string,
    application: VendorApplication,
    queryRunner: QueryRunner,
  ): Promise<void> {
    const documents = await this._repositories.vendorDocument.find({
      where: { application: { id: application.id } },
    });

    for (const document of documents) {
      document.vendorId = vendorId;
      await queryRunner.manager.save(document);
    }
  }

  /**
   * Publish vendor created event
   * @param vendorId - ID of the newly created vendor
   * @param applicationId - ID of the application that was used to create the vendor
   */
  private _publishVendorCreatedEvent(vendorId: string, applicationId: string): void {
    this._eventBus.publishVendorCreated({
      vendorId: vendorId,
      applicationId: applicationId,
      timestamp: new Date(),
    });
  }
}
