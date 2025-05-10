# Phase 6A-1.1: Multi-vendor Marketplace - Vendor Registration Form

## Objectives

- Create an intuitive vendor registration form
- Implement client and server-side validation
- Design a user-friendly registration flow

## Timeline: Week 29

## Tasks & Implementation Details

### 1. Vendor Registration Form Component

Create a React component for the vendor registration form:

```tsx
// src/client/components/vendors/VendorRegistrationForm.tsx

import React, { useState } from 'react';
import { Form, Input, Button, Select, Upload, Divider, Steps, message } from 'antd';
import { UploadOutlined, UserOutlined, BankOutlined, ShopOutlined } from '@ant-design/icons';
import { useHistory } from 'react-router-dom';
import { apiClient } from '../../services/api-client';

const { Step } = Steps;
const { Option } = Select;
const { TextArea } = Input;

export const VendorRegistrationForm: React.FC = () => {
  const [form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const history = useHistory();

  const steps = [
    {
      title: 'Business Information',
      content: (
        <>
          <Form.Item
            name="businessName"
            label="Business Name"
            rules={[{ required: true, message: 'Please enter your business name' }]}
          >
            <Input prefix={<ShopOutlined />} placeholder="Your Business Name" />
          </Form.Item>
          
          <Form.Item
            name="businessEmail"
            label="Business Email"
            rules={[
              { required: true, message: 'Please enter your business email' },
              { type: 'email', message: 'Please enter a valid email' }
            ]}
          >
            <Input placeholder="business@example.com" />
          </Form.Item>
          
          <Form.Item
            name="phone"
            label="Phone Number"
            rules={[{ required: true, message: 'Please enter your phone number' }]}
          >
            <Input placeholder="+1 (555) 123-4567" />
          </Form.Item>
          
          <Form.Item
            name="businessType"
            label="Business Type"
            rules={[{ required: true, message: 'Please select your business type' }]}
          >
            <Select placeholder="Select business type">
              <Option value="individual">Individual / Sole Proprietor</Option>
              <Option value="llc">Limited Liability Company (LLC)</Option>
              <Option value="corporation">Corporation</Option>
              <Option value="partnership">Partnership</Option>
              <Option value="other">Other</Option>
            </Select>
          </Form.Item>
        </>
      ),
    },
    {
      title: 'Product Information',
      content: (
        <>
          <Form.Item
            name="productCategories"
            label="Product Categories"
            rules={[{ required: true, message: 'Please select at least one category' }]}
          >
            <Select mode="multiple" placeholder="Select product categories">
              <Option value="clothing">Clothing & Apparel</Option>
              <Option value="home">Home & Kitchen</Option>
              <Option value="electronics">Electronics</Option>
              <Option value="beauty">Beauty & Personal Care</Option>
              <Option value="jewelry">Jewelry & Accessories</Option>
              <Option value="health">Health & Wellness</Option>
              <Option value="arts">Arts & Crafts</Option>
              <Option value="other">Other</Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            name="productDescription"
            label="Product Description"
            rules={[{ required: true, message: 'Please provide a description of your products' }]}
          >
            <TextArea
              placeholder="Describe the products you plan to sell"
              rows={4}
            />
          </Form.Item>
          
          <Form.Item
            name="estimatedProductCount"
            label="Estimated Number of Products"
            rules={[{ required: true, message: 'Please estimate your product count' }]}
          >
            <Select placeholder="Select estimated product count">
              <Option value="1-10">1-10 products</Option>
              <Option value="11-50">11-50 products</Option>
              <Option value="51-100">51-100 products</Option>
              <Option value="101-500">101-500 products</Option>
              <Option value="500+">500+ products</Option>
            </Select>
          </Form.Item>
        </>
      ),
    },
    {
      title: 'Payment Information',
      content: (
        <>
          <Form.Item
            name="bankName"
            label="Bank Name"
            rules={[{ required: true, message: 'Please enter your bank name' }]}
          >
            <Input prefix={<BankOutlined />} placeholder="Bank Name" />
          </Form.Item>
          
          <Form.Item
            name="accountHolderName"
            label="Account Holder Name"
            rules={[{ required: true, message: 'Please enter the account holder name' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="Account Holder Name" />
          </Form.Item>
          
          <Form.Item
            name="accountNumber"
            label="Account Number"
            rules={[{ required: true, message: 'Please enter your account number' }]}
          >
            <Input placeholder="Account Number" />
          </Form.Item>
          
          <Form.Item
            name="routingNumber"
            label="Routing Number"
            rules={[{ required: true, message: 'Please enter your routing number' }]}
          >
            <Input placeholder="Routing Number" />
          </Form.Item>
        </>
      ),
    },
    {
      title: 'Verification Documents',
      content: (
        <>
          <Form.Item
            name="businessId"
            label="Business ID / Tax ID"
            rules={[{ required: true, message: 'Please enter your business ID or tax ID' }]}
          >
            <Input placeholder="Business ID / Tax ID Number" />
          </Form.Item>
          
          <Form.Item
            name="businessLicense"
            label="Business License"
            rules={[{ required: true, message: 'Please upload your business license' }]}
          >
            <Upload name="businessLicense" listType="picture" maxCount={1}>
              <Button icon={<UploadOutlined />}>Upload Business License</Button>
            </Upload>
          </Form.Item>
          
          <Form.Item
            name="identityDocument"
            label="Identity Document"
            rules={[{ required: true, message: 'Please upload your identity document' }]}
          >
            <Upload name="identityDocument" listType="picture" maxCount={1}>
              <Button icon={<UploadOutlined />}>Upload Identity Document</Button>
            </Upload>
          </Form.Item>
          
          <Form.Item
            name="termsAgreement"
            valuePropName="checked"
            rules={[
              {
                validator: (_, value) =>
                  value ? Promise.resolve() : Promise.reject(new Error('You must agree to the terms')),
              },
            ]}
          >
            <Checkbox>
              I agree to the <a href="/terms">Terms of Service</a> and <a href="/vendor-agreement">Vendor Agreement</a>
            </Checkbox>
          </Form.Item>
        </>
      ),
    },
  ];

  const next = async () => {
    try {
      // Validate fields in current step
      await form.validateFields(
        steps[currentStep].fields || []
      );
      
      // Proceed to next step
      setCurrentStep(currentStep + 1);
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const prev = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      
      // Validate all form fields
      const values = await form.validateFields();
      
      // Format the data for the API
      const formData = new FormData();
      
      // Append all form values
      Object.keys(values).forEach(key => {
        if (key === 'businessLicense' || key === 'identityDocument') {
          if (values[key] && values[key].fileList && values[key].fileList.length > 0) {
            formData.append(key, values[key].fileList[0].originFileObj);
          }
        } else if (Array.isArray(values[key])) {
          formData.append(key, JSON.stringify(values[key]));
        } else {
          formData.append(key, values[key]);
        }
      });
      
      // Submit the registration
      const response = await apiClient.post('/vendors/register', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      // Display success message
      message.success('Registration submitted successfully! We will review your application and contact you shortly.');
      
      // Redirect to confirmation page
      history.push(`/vendor/application/${response.data.applicationId}`);
    } catch (error) {
      console.error('Submission failed:', error);
      message.error('Registration failed. Please check the form and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="vendor-registration">
      <h1>Become a Vendor</h1>
      <p className="description">
        Complete the following form to apply as a vendor on our marketplace.
        Our team will review your application within 2-3 business days.
      </p>
      
      <Steps current={currentStep} style={{ marginBottom: 20 }}>
        {steps.map(step => (
          <Step key={step.title} title={step.title} />
        ))}
      </Steps>
      
      <Form
        form={form}
        layout="vertical"
        className="registration-form"
        initialValues={{ termsAgreement: false }}
      >
        <div className="steps-content">{steps[currentStep].content}</div>
        
        <div className="steps-action">
          {currentStep > 0 && (
            <Button style={{ margin: '0 8px' }} onClick={prev}>
              Previous
            </Button>
          )}
          
          {currentStep < steps.length - 1 && (
            <Button type="primary" onClick={next}>
              Next
            </Button>
          )}
          
          {currentStep === steps.length - 1 && (
            <Button type="primary" loading={loading} onClick={handleSubmit}>
              Submit Application
            </Button>
          )}
        </div>
      </Form>
    </div>
  );
};
```

### 2. Registration Form Styles

Add styles for the vendor registration form:

```css
/* src/client/styles/vendor-registration.css */

.vendor-registration {
  max-width: 800px;
  margin: 0 auto;
  padding: 24px;
}

.vendor-registration h1 {
  font-size: 28px;
  margin-bottom: 16px;
}

.vendor-registration .description {
  margin-bottom: 24px;
  color: #666;
}

.registration-form {
  background: #fff;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.steps-content {
  margin-top: 16px;
  padding: 20px;
  background: #fafafa;
  border-radius: 6px;
  min-height: 300px;
}

.steps-action {
  margin-top: 24px;
  display: flex;
  justify-content: flex-end;
}

.ant-upload-list {
  margin-bottom: 16px;
}
```

### 3. Registration Success Component

Create a component to display after successful registration:

```tsx
// src/client/components/vendors/VendorApplicationSubmitted.tsx

import React, { useEffect, useState } from 'react';
import { Result, Button, Spin, Card } from 'antd';
import { useParams, useHistory } from 'react-router-dom';
import { apiClient } from '../../services/api-client';

interface ApplicationStatus {
  id: string;
  status: 'pending' | 'under_review' | 'approved' | 'rejected';
  submittedAt: string;
  estimatedReviewTime: string;
}

export const VendorApplicationSubmitted: React.FC = () => {
  const { applicationId } = useParams<{ applicationId: string }>();
  const [application, setApplication] = useState<ApplicationStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const history = useHistory();

  useEffect(() => {
    const fetchApplicationStatus = async () => {
      try {
        const response = await apiClient.get(`/vendors/applications/${applicationId}`);
        setApplication(response.data);
      } catch (error) {
        console.error('Error fetching application status:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchApplicationStatus();
  }, [applicationId]);

  if (loading) {
    return <Spin size="large" />;
  }

  if (!application) {
    return (
      <Result
        status="error"
        title="Application Not Found"
        subTitle="The application you are looking for does not exist."
        extra={
          <Button type="primary" onClick={() => history.push('/')}>
            Back Home
          </Button>
        }
      />
    );
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: 24 }}>
      <Result
        status="success"
        title="Application Submitted Successfully!"
        subTitle={`Your application ID is: ${application.id}`}
        extra={[
          <Button type="primary" key="home" onClick={() => history.push('/')}>
            Back Home
          </Button>,
          <Button key="check" onClick={() => history.push('/vendor/status')}>
            Check Application Status
          </Button>,
        ]}
      />
      
      <Card title="Application Details" style={{ marginTop: 24 }}>
        <p><strong>Status:</strong> {application.status.replace('_', ' ').toUpperCase()}</p>
        <p><strong>Submitted:</strong> {new Date(application.submittedAt).toLocaleString()}</p>
        <p><strong>Estimated Review Time:</strong> {application.estimatedReviewTime}</p>
        <p>
          We will notify you via email once your application has been reviewed.
          You can also check the status of your application at any time.
        </p>
      </Card>
    </div>
  );
};
```

### 4. API Endpoint for Vendor Registration

Implement the backend endpoint for vendor registration:

```typescript
// src/modules/vendors/controllers/vendor-registration.controller.ts

import { 
  Controller, 
  Post, 
  Body, 
  UploadedFiles,
  UseInterceptors,
  BadRequestException,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { VendorRegistrationService } from '../services/vendor-registration.service';
import { VendorRegistrationDto } from '../dto/vendor-registration.dto';
import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { extname } from 'path';

@Controller('vendors')
export class VendorRegistrationController {
  constructor(
    private readonly vendorRegistrationService: VendorRegistrationService,
  ) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'businessLicense', maxCount: 1 },
        { name: 'identityDocument', maxCount: 1 },
      ],
      {
        storage: diskStorage({
          destination: './uploads/vendor-documents',
          filename: (req, file, cb) => {
            const uniqueFileName = `${uuidv4()}${extname(file.originalname)}`;
            cb(null, uniqueFileName);
          },
        }),
        limits: {
          fileSize: 5 * 1024 * 1024, // 5MB limit
        },
        fileFilter: (req, file, cb) => {
          if (!file.originalname.match(/\.(jpg|jpeg|png|pdf)$/)) {
            return cb(new BadRequestException('Only image and PDF files are allowed'), false);
          }
          cb(null, true);
        },
      },
    ),
  )
  async registerVendor(
    @Body() registrationData: VendorRegistrationDto,
    @UploadedFiles() files: { 
      businessLicense?: Express.Multer.File[],
      identityDocument?: Express.Multer.File[] 
    },
  ) {
    try {
      // Extract file paths
      const businessLicensePath = files.businessLicense?.[0]?.path;
      const identityDocumentPath = files.identityDocument?.[0]?.path;
      
      // Create vendor application
      const application = await this.vendorRegistrationService.createVendorApplication({
        ...registrationData,
        businessLicensePath,
        identityDocumentPath,
      });
      
      return {
        success: true,
        message: 'Vendor application submitted successfully',
        applicationId: application.id,
      };
    } catch (error) {
      throw new BadRequestException(`Registration failed: ${error.message}`);
    }
  }
}
```

### 5. Data Transfer Object for Validation

Create a DTO for vendor registration validation:

```typescript
// src/modules/vendors/dto/vendor-registration.dto.ts

import { IsNotEmpty, IsEmail, IsString, IsArray, IsEnum, IsBoolean } from 'class-validator';

export enum BusinessType {
  INDIVIDUAL = 'individual',
  LLC = 'llc',
  CORPORATION = 'corporation',
  PARTNERSHIP = 'partnership',
  OTHER = 'other',
}

export class VendorRegistrationDto {
  @IsNotEmpty()
  @IsString()
  businessName: string;

  @IsNotEmpty()
  @IsEmail()
  businessEmail: string;

  @IsNotEmpty()
  @IsString()
  phone: string;

  @IsNotEmpty()
  @IsEnum(BusinessType)
  businessType: BusinessType;

  @IsNotEmpty()
  @IsArray()
  productCategories: string[];

  @IsNotEmpty()
  @IsString()
  productDescription: string;

  @IsNotEmpty()
  @IsString()
  estimatedProductCount: string;

  @IsNotEmpty()
  @IsString()
  bankName: string;

  @IsNotEmpty()
  @IsString()
  accountHolderName: string;

  @IsNotEmpty()
  @IsString()
  accountNumber: string;

  @IsNotEmpty()
  @IsString()
  routingNumber: string;

  @IsNotEmpty()
  @IsString()
  businessId: string;

  @IsNotEmpty()
  @IsBoolean()
  termsAgreement: boolean;
}
```

## Dependencies & Prerequisites

- Ant Design for UI components
- NestJS for backend implementation
- Multer for file upload handling
- React Router for navigation

## Testing Guidelines

1. **Form Validation Testing:**
   - Test required fields validation
   - Test email format validation
   - Test file upload size and type restrictions

2. **User Flow Testing:**
   - Test multi-step navigation
   - Test form state persistence between steps
   - Test success and error handling

3. **API Testing:**
   - Test successful form submission
   - Test file upload functionality
   - Test error handling for invalid submissions

## Next Phase

Continue to [Phase 6A-1.2: Vendor Entity Models](./shopify-app-phase6a1-2-vendor-entity-models.md) to implement the database models for storing vendor information.
