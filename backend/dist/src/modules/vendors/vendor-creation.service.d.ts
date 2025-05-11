import { Repository } from 'typeorm';
import { VendorAddress } from './entities/vendor-address.entity';
import { VendorApplication } from './entities/vendor-application.entity';
import { VendorBankingDetails } from './entities/vendor-banking-details.entity';
import { VendorDocument } from './entities/vendor-document.entity';
import { Vendor } from './entities/vendor.entity';
import { TransactionService } from '../../common/transaction.service';
import { VendorEventBus } from '../../events/vendor-event-bus.service';
export declare class VendorRepositories {
  readonly vendor: Repository<Vendor>;
  readonly vendorApplication: Repository<VendorApplication>;
  readonly vendorDocument: Repository<VendorDocument>;
  readonly vendorBankingDetails: Repository<VendorBankingDetails>;
  readonly vendorAddress: Repository<VendorAddress>;
  constructor(
    vendor: Repository<Vendor>,
    vendorApplication: Repository<VendorApplication>,
    vendorDocument: Repository<VendorDocument>,
    vendorBankingDetails: Repository<VendorBankingDetails>,
    vendorAddress: Repository<VendorAddress>,
  );
}
export declare class VendorCreationService {
  private readonly _repositories;
  private readonly _transactionService;
  private readonly _eventBus;
  private readonly _logger;
  constructor(
    _repositories: VendorRepositories,
    _transactionService: TransactionService,
    _eventBus: VendorEventBus,
  );
  createVendorFromApplication(applicationId: string): Promise<Vendor>;
  private _validateAndFetchApplication;
  private _checkForExistingVendor;
  private _createVendorEntity;
  private _createBankingDetails;
  private _createAddressIfProvided;
  private _linkDocumentsToVendor;
  private _updateApplicationWithVendorId;
  private _getDefaultCommissionRate;
}
