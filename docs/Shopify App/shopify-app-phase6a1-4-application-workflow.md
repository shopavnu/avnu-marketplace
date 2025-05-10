# Phase 6A-1.4: Multi-vendor Marketplace - Application Status Workflow

## Objectives

- Implement a state machine for vendor application processing
- Create workflow transitions with validation
- Develop admin interface for application review

## Timeline: Week 30

## Tasks & Implementation Details

### 1. Application Status State Machine

Create a state machine to manage application status transitions:

```typescript
// src/modules/vendors/services/application-workflow.service.ts

import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VendorApplication } from '../entities/vendor-application.entity';
import { Vendor, VendorStatus } from '../entities/vendor.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';

// Define allowed status transitions
type StatusTransition = {
  from: VendorStatus;
  to: VendorStatus[];
  requiresReason: boolean;
};

@Injectable()
export class ApplicationWorkflowService {
  private readonly logger = new Logger(ApplicationWorkflowService.name);
  
  // Define state machine transitions
  private readonly statusTransitions: StatusTransition[] = [
    { from: VendorStatus.PENDING, to: [VendorStatus.UNDER_REVIEW, VendorStatus.REJECTED], requiresReason: true },
    { from: VendorStatus.UNDER_REVIEW, to: [VendorStatus.APPROVED, VendorStatus.REJECTED], requiresReason: true },
    { from: VendorStatus.APPROVED, to: [VendorStatus.SUSPENDED], requiresReason: true },
    { from: VendorStatus.REJECTED, to: [VendorStatus.PENDING], requiresReason: false },
    { from: VendorStatus.SUSPENDED, to: [VendorStatus.APPROVED], requiresReason: false },
  ];

  constructor(
    @InjectRepository(VendorApplication)
    private readonly vendorApplicationRepository: Repository<VendorApplication>,
    @InjectRepository(Vendor)
    private readonly vendorRepository: Repository<Vendor>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * Change application status with workflow validation
   */
  async changeApplicationStatus(
    applicationId: string,
    newStatus: VendorStatus,
    data: {
      adminId: string;
      reason?: string;
      notes?: string;
    }
  ): Promise<VendorApplication> {
    // Get application
    const application = await this.vendorApplicationRepository.findOne({
      where: { id: applicationId }
    });

    if (!application) {
      throw new BadRequestException(`Application with ID ${applicationId} not found`);
    }

    // Get current status
    const currentStatus = application.status;

    // Validate status transition
    this.validateStatusTransition(currentStatus, newStatus, data.reason);

    // Record previous status for event emission
    const previousStatus = application.status;

    // Update application
    application.status = newStatus;
    
    // Add review information
    if (newStatus === VendorStatus.UNDER_REVIEW && !application.reviewStartedAt) {
      application.reviewStartedAt = new Date();
      application.reviewedBy = data.adminId;
    }
    
    if (
      (newStatus === VendorStatus.APPROVED || newStatus === VendorStatus.REJECTED) && 
      !application.reviewCompletedAt
    ) {
      application.reviewCompletedAt = new Date();
      application.reviewedBy = data.adminId;
    }
    
    // Add rejection reason if needed
    if (newStatus === VendorStatus.REJECTED) {
      application.rejectionReason = data.reason;
    }
    
    // Add admin notes
    if (data.notes) {
      application.adminNotes = application.adminNotes 
        ? `${application.adminNotes}\n\n${new Date().toISOString()} - ${data.notes}`
        : `${new Date().toISOString()} - ${data.notes}`;
    }

    // Save application
    const updatedApplication = await this.vendorApplicationRepository.save(application);

    // Update vendor status if applicable
    if (application.vendorId) {
      await this.updateVendorStatus(application.vendorId, newStatus);
    }

    // Emit status change event
    this.eventEmitter.emit('application.status.changed', {
      applicationId,
      previousStatus,
      newStatus,
      adminId: data.adminId,
      timestamp: new Date(),
    });

    return updatedApplication;
  }

  /**
   * Get application history
   */
  async getApplicationHistory(applicationId: string): Promise<any[]> {
    // In a real implementation, this would query an audit log table
    // For now, we'll return a sample history
    return [
      {
        timestamp: new Date(Date.now() - 86400000 * 2),
        status: VendorStatus.PENDING,
        actor: 'system',
        notes: 'Application submitted',
      },
      {
        timestamp: new Date(Date.now() - 86400000),
        status: VendorStatus.UNDER_REVIEW,
        actor: 'admin',
        notes: 'Application review started',
      },
    ];
  }

  /**
   * Update vendor status to match application status
   */
  private async updateVendorStatus(vendorId: string, status: VendorStatus): Promise<void> {
    // Only sync certain statuses to the vendor
    const syncableStatuses = [
      VendorStatus.APPROVED,
      VendorStatus.SUSPENDED,
    ];

    if (syncableStatuses.includes(status)) {
      await this.vendorRepository.update(vendorId, { status });
    }
  }

  /**
   * Validate status transition
   */
  private validateStatusTransition(
    currentStatus: VendorStatus,
    newStatus: VendorStatus,
    reason?: string
  ): void {
    // Find allowed transitions for current status
    const transition = this.statusTransitions.find(t => t.from === currentStatus);

    // If no transition found or new status not in allowed list
    if (!transition || !transition.to.includes(newStatus)) {
      throw new BadRequestException(
        `Cannot transition from ${currentStatus} to ${newStatus}`
      );
    }

    // Check if reason is required
    if (transition.requiresReason && !reason) {
      throw new BadRequestException(
        `A reason is required when changing status from ${currentStatus} to ${newStatus}`
      );
    }
  }
}
```

### 2. Application Status Event Listeners

Create event listeners to handle application status changes:

```typescript
// src/modules/vendors/listeners/application-status.listener.ts

import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VendorApplication } from '../entities/vendor-application.entity';
import { VendorStatus } from '../entities/vendor.entity';
import { EmailService } from '../../common/services/email.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ApplicationStatusListener {
  private readonly logger = new Logger(ApplicationStatusListener.name);

  constructor(
    @InjectRepository(VendorApplication)
    private readonly vendorApplicationRepository: Repository<VendorApplication>,
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
  ) {}

  @OnEvent('application.status.changed')
  async handleStatusChangeEvent(payload: {
    applicationId: string;
    previousStatus: VendorStatus;
    newStatus: VendorStatus;
    adminId: string;
    timestamp: Date;
  }) {
    try {
      this.logger.log(`Application ${payload.applicationId} status changed from ${payload.previousStatus} to ${payload.newStatus}`);

      // Log status change to audit log (implementation would go here)
      
      // Send notification email based on new status
      await this.sendStatusNotification(payload.applicationId, payload.newStatus);
      
      // Update application notification flag
      await this.vendorApplicationRepository.update(
        payload.applicationId,
        { isNotificationSent: true }
      );
    } catch (error) {
      this.logger.error(`Error handling status change event: ${error.message}`, error.stack);
    }
  }

  /**
   * Send notification email based on status
   */
  private async sendStatusNotification(
    applicationId: string,
    status: VendorStatus
  ): Promise<void> {
    try {
      // Get application details
      const application = await this.vendorApplicationRepository.findOne({
        where: { id: applicationId }
      });

      if (!application) {
        throw new Error(`Application ${applicationId} not found`);
      }

      const formData = application.formData;
      const email = formData.businessEmail;
      const businessName = formData.businessName;
      const appUrl = this.configService.get<string>('APP_URL');
      
      let subject, content;
      
      switch (status) {
        case VendorStatus.UNDER_REVIEW:
          subject = 'Your Vendor Application is Under Review';
          content = `
            <h1>Application Under Review</h1>
            <p>Dear ${businessName},</p>
            <p>Your vendor application is now being reviewed by our team. This process typically takes 1-2 business days.</p>
            <p>We'll notify you as soon as the review is complete.</p>
            <p>Application ID: ${applicationId}</p>
            <p>Best regards,</p>
            <p>The Marketplace Team</p>
          `;
          break;
          
        case VendorStatus.APPROVED:
          subject = 'Vendor Application Approved!';
          content = `
            <h1>Application Approved</h1>
            <p>Dear ${businessName},</p>
            <p>Congratulations! Your application to become a vendor on our marketplace has been approved.</p>
            <p>You can now log in to your vendor dashboard to start listing products and managing your store.</p>
            <p><a href="${appUrl}/vendor/login">Login to Vendor Dashboard</a></p>
            <p>Application ID: ${applicationId}</p>
            <p>Best regards,</p>
            <p>The Marketplace Team</p>
          `;
          break;
          
        case VendorStatus.REJECTED:
          subject = 'Update on Your Vendor Application';
          content = `
            <h1>Application Status Update</h1>
            <p>Dear ${businessName},</p>
            <p>Thank you for your interest in becoming a vendor on our marketplace.</p>
            <p>After careful review, we are unable to approve your application at this time.</p>
            ${application.rejectionReason ? `<p><strong>Reason:</strong> ${application.rejectionReason}</p>` : ''}
            <p>You may reapply after addressing the issues mentioned above.</p>
            <p>Application ID: ${applicationId}</p>
            <p>Best regards,</p>
            <p>The Marketplace Team</p>
          `;
          break;
          
        case VendorStatus.SUSPENDED:
          subject = 'Important: Your Vendor Account Has Been Suspended';
          content = `
            <h1>Account Suspended</h1>
            <p>Dear ${businessName},</p>
            <p>Your vendor account has been temporarily suspended.</p>
            ${application.rejectionReason ? `<p><strong>Reason:</strong> ${application.rejectionReason}</p>` : ''}
            <p>Please contact our support team for more information and steps to restore your account.</p>
            <p>Application ID: ${applicationId}</p>
            <p>Best regards,</p>
            <p>The Marketplace Team</p>
          `;
          break;
          
        default:
          // No notification for other status changes
          return;
      }
      
      // Send email
      await this.emailService.sendEmail({
        to: email,
        subject,
        html: content,
      });
    } catch (error) {
      this.logger.error(`Error sending status notification: ${error.message}`, error.stack);
    }
  }
}
```

### 3. Application Status Audit Log Entity

Create an entity to track application status changes:

```typescript
// src/modules/vendors/entities/application-status-log.entity.ts

import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { VendorApplication } from './vendor-application.entity';
import { VendorStatus } from './vendor.entity';

@Entity('vendor_application_status_logs')
export class ApplicationStatusLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  applicationId: string;

  @ManyToOne(() => VendorApplication)
  @JoinColumn({ name: 'application_id' })
  application: VendorApplication;

  @Column({
    type: 'enum',
    enum: VendorStatus,
  })
  previousStatus: VendorStatus;

  @Column({
    type: 'enum',
    enum: VendorStatus,
  })
  newStatus: VendorStatus;

  @Column({ nullable: true })
  reason: string;

  @Column({ nullable: true })
  notes: string;

  @Column({ nullable: true })
  actorId: string;

  @Column({ nullable: true })
  actorType: 'admin' | 'system' | 'vendor';

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
```

### 4. Application Status Audit Service

Create a service to log application status changes:

```typescript
// src/modules/vendors/services/application-audit.service.ts

import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OnEvent } from '@nestjs/event-emitter';
import { ApplicationStatusLog } from '../entities/application-status-log.entity';
import { VendorStatus } from '../entities/vendor.entity';

@Injectable()
export class ApplicationAuditService {
  private readonly logger = new Logger(ApplicationAuditService.name);

  constructor(
    @InjectRepository(ApplicationStatusLog)
    private readonly statusLogRepository: Repository<ApplicationStatusLog>,
  ) {}

  /**
   * Log application status change
   */
  async logStatusChange(
    applicationId: string,
    previousStatus: VendorStatus,
    newStatus: VendorStatus,
    actorId: string,
    actorType: 'admin' | 'system' | 'vendor',
    reason?: string,
    notes?: string,
  ): Promise<ApplicationStatusLog> {
    try {
      const log = this.statusLogRepository.create({
        applicationId,
        previousStatus,
        newStatus,
        reason,
        notes,
        actorId,
        actorType,
      });

      return this.statusLogRepository.save(log);
    } catch (error) {
      this.logger.error(`Error logging status change: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Event listener for application status changes
   */
  @OnEvent('application.status.changed')
  async handleStatusChangeEvent(payload: {
    applicationId: string;
    previousStatus: VendorStatus;
    newStatus: VendorStatus;
    adminId: string;
    reason?: string;
    notes?: string;
    timestamp: Date;
  }) {
    await this.logStatusChange(
      payload.applicationId,
      payload.previousStatus,
      payload.newStatus,
      payload.adminId,
      'admin',
      payload.reason,
      payload.notes,
    );
  }

  /**
   * Get status history for an application
   */
  async getStatusHistory(applicationId: string): Promise<ApplicationStatusLog[]> {
    return this.statusLogRepository.find({
      where: { applicationId },
      order: { createdAt: 'DESC' },
    });
  }
}
```

### 5. Admin Application Review Component

Create a React component for admin application review:

```tsx
// src/client/components/admin/ApplicationReviewForm.tsx

import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Radio, Card, Tabs, Timeline, Divider, message, Spin, Alert } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined, FileTextOutlined } from '@ant-design/icons';
import { useParams } from 'react-router-dom';
import { apiClient } from '../../services/api-client';

const { TabPane } = Tabs;
const { TextArea } = Input;

interface ApplicationReviewFormProps {
  onComplete?: () => void;
}

export const ApplicationReviewForm: React.FC<ApplicationReviewFormProps> = ({ onComplete }) => {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [application, setApplication] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [form] = Form.useForm();

  // Fetch application data
  useEffect(() => {
    const fetchApplication = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get(`/admin/vendor-applications/${id}`);
        setApplication(response.data);
        
        // Also fetch history
        const historyResponse = await apiClient.get(`/admin/vendor-applications/${id}/history`);
        setHistory(historyResponse.data);
      } catch (error) {
        console.error('Error fetching application:', error);
        message.error('Failed to load application data');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchApplication();
    }
  }, [id]);

  // Start review process
  const handleStartReview = async () => {
    try {
      setSubmitting(true);
      await apiClient.post(`/admin/vendor-applications/${id}/review`);
      message.success('Application review started');
      
      // Refresh application data
      const response = await apiClient.get(`/admin/vendor-applications/${id}`);
      setApplication(response.data);
    } catch (error) {
      console.error('Error starting review:', error);
      message.error('Failed to start review process');
    } finally {
      setSubmitting(false);
    }
  };

  // Submit review
  const handleSubmitReview = async (values: any) => {
    try {
      setSubmitting(true);
      await apiClient.patch(`/admin/vendor-applications/${id}/status`, {
        status: values.status,
        adminNotes: values.adminNotes,
        rejectionReason: values.rejectionReason,
      });
      
      message.success('Application review submitted successfully');
      
      if (onComplete) {
        onComplete();
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      message.error('Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <Spin size="large" />;
  }

  if (!application) {
    return <Alert message="Application not found" type="error" />;
  }

  const { status, formData, documents } = application;

  return (
    <div className="application-review">
      <Card 
        title={`Application Review: ${formData.businessName}`}
        extra={`Status: ${status.toUpperCase()}`}
      >
        <Tabs defaultActiveKey="details">
          <TabPane tab="Business Details" key="details">
            <div className="business-details">
              <div className="field-group">
                <h3>Business Information</h3>
                <p><strong>Business Name:</strong> {formData.businessName}</p>
                <p><strong>Business Email:</strong> {formData.businessEmail}</p>
                <p><strong>Phone:</strong> {formData.phone}</p>
                <p><strong>Business Type:</strong> {formData.businessType}</p>
                <p><strong>Business ID / Tax ID:</strong> {formData.businessId}</p>
              </div>
              
              <div className="field-group">
                <h3>Product Information</h3>
                <p><strong>Product Categories:</strong> {formData.productCategories.join(', ')}</p>
                <p><strong>Estimated Product Count:</strong> {formData.estimatedProductCount}</p>
                <p><strong>Product Description:</strong> {formData.productDescription}</p>
              </div>
              
              <div className="field-group">
                <h3>Banking Information</h3>
                <p><strong>Bank Name:</strong> {formData.bankName}</p>
                <p><strong>Account Holder:</strong> {formData.accountHolderName}</p>
                <p><strong>Account Number:</strong> {formData.accountNumber}</p>
                <p><strong>Routing Number:</strong> {formData.routingNumber}</p>
              </div>
            </div>
          </TabPane>
          
          <TabPane tab="Documents" key="documents">
            <div className="documents-list">
              {documents.map((doc: any) => (
                <Card 
                  key={doc.id} 
                  title={doc.name}
                  size="small"
                  className="document-card"
                  style={{ marginBottom: 16 }}
                  extra={
                    <a href={`/api/vendor-documents/${doc.id}/download`} target="_blank" rel="noopener noreferrer">
                      Download
                    </a>
                  }
                >
                  <p><strong>Type:</strong> {doc.documentType}</p>
                  <p><strong>Status:</strong> {doc.status}</p>
                  <p><strong>Uploaded:</strong> {new Date(doc.createdAt).toLocaleString()}</p>
                  
                  {doc.status === 'pending' && (
                    <div className="document-actions">
                      <Button 
                        type="primary" 
                        size="small"
                        onClick={() => {
                          // Handle document verification
                        }}
                      >
                        Verify
                      </Button>
                      <Button 
                        danger 
                        size="small"
                        onClick={() => {
                          // Handle document rejection
                        }}
                      >
                        Reject
                      </Button>
                    </div>
                  )}
                </Card>
              ))}
              
              {documents.length === 0 && (
                <Alert message="No documents found" type="info" />
              )}
            </div>
          </TabPane>
          
          <TabPane tab="History" key="history">
            <Timeline mode="left">
              {history.map((entry: any, index: number) => (
                <Timeline.Item 
                  key={index}
                  label={new Date(entry.timestamp).toLocaleString()}
                  color={getStatusColor(entry.status)}
                  dot={getStatusIcon(entry.status)}
                >
                  <p><strong>Status:</strong> {entry.status.toUpperCase()}</p>
                  <p><strong>By:</strong> {entry.actor}</p>
                  {entry.notes && <p><strong>Notes:</strong> {entry.notes}</p>}
                </Timeline.Item>
              ))}
            </Timeline>
          </TabPane>
        </Tabs>
        
        <Divider />
        
        {status === 'pending' && (
          <div className="review-actions">
            <Button 
              type="primary" 
              onClick={handleStartReview}
              loading={submitting}
            >
              Start Review Process
            </Button>
          </div>
        )}
        
        {status === 'under_review' && (
          <div className="review-form">
            <h3>Submit Review</h3>
            
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmitReview}
              initialValues={{ status: 'approved' }}
            >
              <Form.Item
                name="status"
                label="Decision"
                rules={[{ required: true, message: 'Please select a decision' }]}
              >
                <Radio.Group>
                  <Radio.Button value="approved">Approve</Radio.Button>
                  <Radio.Button value="rejected">Reject</Radio.Button>
                </Radio.Group>
              </Form.Item>
              
              <Form.Item
                name="adminNotes"
                label="Admin Notes (Internal)"
              >
                <TextArea rows={3} placeholder="Internal notes for admin reference" />
              </Form.Item>
              
              <Form.Item
                name="rejectionReason"
                label="Rejection Reason (Will be sent to vendor)"
                rules={[{ 
                  required: form.getFieldValue('status') === 'rejected', 
                  message: 'Please provide a reason for rejection' 
                }]}
                dependencies={['status']}
              >
                <TextArea 
                  rows={3} 
                  placeholder="Provide a clear reason for rejection" 
                  disabled={form.getFieldValue('status') === 'approved'}
                />
              </Form.Item>
              
              <Form.Item>
                <Button type="primary" htmlType="submit" loading={submitting}>
                  Submit Review
                </Button>
              </Form.Item>
            </Form>
          </div>
        )}
      </Card>
    </div>
  );
};

// Helper functions for timeline
const getStatusColor = (status: string) => {
  switch (status) {
    case 'approved': return 'green';
    case 'rejected': return 'red';
    case 'under_review': return 'blue';
    default: return 'gray';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'approved': return <CheckCircleOutlined />;
    case 'rejected': return <CloseCircleOutlined />;
    case 'under_review': return <ClockCircleOutlined />;
    default: return <FileTextOutlined />;
  }
};
```

### 6. Application Review Styles

Add styles for the application review component:

```css
/* src/client/styles/application-review.css */

.application-review {
  max-width: 900px;
  margin: 0 auto;
}

.application-review .business-details {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.application-review .field-group {
  margin-bottom: 20px;
}

.application-review .field-group h3 {
  margin-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
  padding-bottom: 8px;
}

.application-review .field-group p {
  margin-bottom: 8px;
}

.application-review .document-card {
  border-left: 3px solid #1890ff;
}

.application-review .document-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 12px;
}

.application-review .review-form {
  max-width: 600px;
  margin: 0 auto;
}

@media (max-width: 768px) {
  .application-review .business-details {
    grid-template-columns: 1fr;
  }
}
```

## Dependencies & Prerequisites

- NestJS Event Emitter for event-driven architecture
- TypeORM for database persistence
- React and Ant Design for admin interface

## State Machine Flow

1. **Pending State**:
   - Initial state for new applications
   - Can transition to: Under Review, Rejected

2. **Under Review State**:
   - Active review by admin
   - Can transition to: Approved, Rejected

3. **Approved State**:
   - Vendor application accepted
   - Can transition to: Suspended

4. **Rejected State**:
   - Vendor application declined
   - Can transition to: Pending (reapplication)

5. **Suspended State**:
   - Vendor temporarily disabled
   - Can transition to: Approved

## Testing Guidelines

1. **State Machine Testing:**
   - Test valid state transitions
   - Test invalid state transitions
   - Test required fields for transitions

2. **Event System Testing:**
   - Test event emission on status changes
   - Test email notifications
   - Test audit logging

3. **UI Testing:**
   - Test admin review interface
   - Test document verification process
   - Test review submission with different decisions

## Next Phase

Continue to [Phase 6A-1.5: Document Verification System](./shopify-app-phase6a1-5-document-verification.md) to implement the document verification functionality.
