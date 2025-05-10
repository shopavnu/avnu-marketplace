import { Repository } from 'typeorm';
import { VendorApplication } from './entities/vendor-application.entity';
import { VendorStatus } from './entities/vendor.entity';
import { TransactionService } from '../../common/transaction.service';
import { VendorEventBus } from '../../events/vendor-event-bus.service';
export declare class ApplicationReviewService {
    private readonly _vendorApplicationRepository;
    private readonly _transactionService;
    private readonly _eventBus;
    private readonly _logger;
    constructor(_vendorApplicationRepository: Repository<VendorApplication>, _transactionService: TransactionService, _eventBus: VendorEventBus);
    startApplicationReview(applicationId: string, adminId: string): Promise<VendorApplication>;
    getApplicationById(applicationId: string): Promise<VendorApplication>;
    updateApplicationStatus(applicationId: string, newStatus: VendorStatus, data: {
        adminId: string;
        reason?: string;
        notes?: string;
    }): Promise<VendorApplication>;
    getApplicationHistory(applicationId: string): Promise<Array<{
        timestamp: Date;
        status: VendorStatus;
        actor: string;
        notes: string;
    }>>;
}
