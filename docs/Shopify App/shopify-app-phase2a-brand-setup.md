# Phase 2A: Onboarding UI - Brand Setup

## Objectives

- Create the first step of the merchant onboarding wizard
- Implement brand information collection (logo, location, about)
- Set up file upload and storage for brand assets
- Save brand information to the merchant's record

## Timeline: Weeks 3-4 (First part of Phase 2)

## Tasks & Implementation Details

### 1. Create Remix Route for Brand Setup

```typescript
// app/routes/app.onboarding.brand.tsx

import { json, redirect } from "@remix-run/node";
import { useActionData, useLoaderData, useSubmit } from "@remix-run/react";
import { useState } from "react";
import {
  Page,
  Layout,
  LegacyCard,
  FormLayout,
  TextField,
  DropZone,
  Banner,
  Text,
  Button,
  LegacyStack,
  Thumbnail,
  Tag,
  Box,
  Checkbox,
} from "@shopify/polaris";
import { authenticate } from "../shopify.server";

// Loader to fetch existing data if available
export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  
  try {
    // Fetch existing brand data from Avnu backend
    const response = await fetch(
      `${process.env.AVNU_API_URL}/api/integrations/shopify/merchant/${session.shop}/brand`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.accessToken}`
        }
      }
    );
    
    if (response.ok) {
      const brandData = await response.json();
      return json({
        shop: session.shop,
        brandData,
        errors: null
      });
    }
    
    return json({
      shop: session.shop,
      brandData: null,
      errors: null
    });
  } catch (error) {
    console.error('Error fetching brand data', error);
    return json({
      shop: session.shop,
      brandData: null,
      errors: ['Failed to load existing brand data']
    });
  }
};

// Action to save brand information
export const action = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const formData = await request.formData();
  
  // Process form data
  const about = formData.get('about');
  const location = formData.get('location');
  const causes = formData.getAll('causes');
  
  // Get file data
  const logoFile = formData.get('logo');
  const heroFile = formData.get('heroImage');
  
  try {
    // 1. Upload logo and hero image if provided
    let logoUrl = formData.get('existingLogoUrl') || null;
    let heroUrl = formData.get('existingHeroUrl') || null;
    
    if (logoFile && logoFile.size > 0) {
      logoUrl = await uploadFile(session, logoFile, 'logo');
    }
    
    if (heroFile && heroFile.size > 0) {
      heroUrl = await uploadFile(session, heroFile, 'hero');
    }
    
    // 2. Save brand data to Avnu backend
    const response = await fetch(
      `${process.env.AVNU_API_URL}/api/integrations/shopify/merchant/${session.shop}/brand`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.accessToken}`
        },
        body: JSON.stringify({
          about,
          location,
          causes: Array.from(causes),
          logoUrl,
          heroUrl
        })
      }
    );
    
    if (!response.ok) {
      const errorData = await response.json();
      return json({
        success: false,
        errors: errorData.errors || ['Failed to save brand information']
      });
    }
    
    // Redirect to next step (shipping settings)
    return redirect('/app/onboarding/shipping');
  } catch (error) {
    console.error('Error saving brand information', error);
    return json({
      success: false,
      errors: ['An unexpected error occurred']
    });
  }
};

// Helper function for file uploads
async function uploadFile(session, file, type) {
  // 1. Get a presigned upload URL from Avnu backend
  const getUploadUrlResponse = await fetch(
    `${process.env.AVNU_API_URL}/api/integrations/shopify/files/upload-url?type=${type}`,
    {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${session.accessToken}`
      }
    }
  );
  
  const { uploadUrl, fileUrl } = await getUploadUrlResponse.json();
  
  // 2. Upload file directly to the storage service
  await fetch(uploadUrl, {
    method: 'PUT',
    body: file,
    headers: {
      'Content-Type': file.type
    }
  });
  
  return fileUrl;
}

// Component for brand setup form
export default function BrandSetup() {
  const { shop, brandData, errors: loaderErrors } = useLoaderData();
  const actionData = useActionData();
  const submit = useSubmit();
  
  const [logo, setLogo] = useState(null);
  const [heroImage, setHeroImage] = useState(null);
  const [about, setAbout] = useState(brandData?.about || '');
  const [location, setLocation] = useState(brandData?.location || '');
  const [selectedCauses, setSelectedCauses] = useState(brandData?.causes || []);
  
  // Available cause options
  const causes = [
    { label: 'Black-owned', value: 'black_owned' },
    { label: 'Woman-owned', value: 'woman_owned' },
    { label: 'Sustainable', value: 'sustainable' },
    { label: 'Vegan', value: 'vegan' },
    { label: 'Ethical Manufacturing', value: 'ethical_manufacturing' },
    { label: 'Made in USA', value: 'made_in_usa' },
    { label: 'Handmade', value: 'handmade' },
    { label: 'Organic', value: 'organic' }
  ];
  
  const handleSubmit = (event) => {
    event.preventDefault();
    
    const formData = new FormData();
    formData.append('about', about);
    formData.append('location', location);
    
    // Add selected causes
    selectedCauses.forEach(cause => {
      formData.append('causes', cause);
    });
    
    // Add files if selected
    if (logo) {
      formData.append('logo', logo);
    } else if (brandData?.logoUrl) {
      formData.append('existingLogoUrl', brandData.logoUrl);
    }
    
    if (heroImage) {
      formData.append('heroImage', heroImage);
    } else if (brandData?.heroUrl) {
      formData.append('existingHeroUrl', brandData.heroUrl);
    }
    
    submit(formData, { method: 'post', encType: 'multipart/form-data' });
  };
  
  // Handle logo file uploads
  const handleLogoDropZone = useCallback(
    (_dropFiles, acceptedFiles, _rejectedFiles) => {
      setLogo(acceptedFiles[0]);
    },
    [setLogo],
  );
  
  // Handle hero image uploads
  const handleHeroDropZone = useCallback(
    (_dropFiles, acceptedFiles, _rejectedFiles) => {
      setHeroImage(acceptedFiles[0]);
    },
    [setHeroImage],
  );
  
  // Toggle cause selection
  const toggleCause = (cause) => {
    setSelectedCauses(prev => 
      prev.includes(cause)
        ? prev.filter(c => c !== cause)
        : [...prev, cause]
    );
  };
  
  // Display errors if any
  const errors = loaderErrors || (actionData?.errors || []);
  
  return (
    <Page
      title="Tell us about your brand"
      subtitle="This information will appear on your brand page in the Avnu marketplace"
      backAction={{ url: "/app" }}
    >
      <Layout>
        {errors.length > 0 && (
          <Layout.Section>
            <Banner status="critical">
              <p>There were errors with your submission:</p>
              <ul>
                {errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </Banner>
          </Layout.Section>
        )}
        
        <Layout.Section>
          <form onSubmit={handleSubmit}>
            <LegacyCard sectioned>
              <FormLayout>
                <Text variant="headingMd">Brand Basics</Text>
                
                <TextField
                  label="Location"
                  placeholder="City, State"
                  value={location}
                  onChange={setLocation}
                  helpText="Where is your brand primarily based?"
                  autoComplete="off"
                />
                
                <TextField
                  label="About Your Brand"
                  placeholder="Tell shoppers what makes your brand unique..."
                  value={about}
                  onChange={setAbout}
                  multiline={4}
                  helpText="This will appear on your brand page in the Avnu marketplace"
                  autoComplete="off"
                />
                
                <Text variant="headingMd">Brand Logo</Text>
                <Text variant="bodyMd" color="subdued">
                  Upload a high-quality logo that will represent your brand on Avnu
                </Text>
                
                <DropZone
                  accept="image/*"
                  type="image"
                  onDrop={handleLogoDropZone}
                >
                  {logo ? (
                    <Thumbnail
                      size="large"
                      alt="Brand logo preview"
                      source={
                        window.URL.createObjectURL(logo)
                      }
                    />
                  ) : brandData?.logoUrl ? (
                    <div>
                      <Text>Current logo:</Text>
                      <Thumbnail
                        size="large"
                        alt="Current brand logo"
                        source={brandData.logoUrl}
                      />
                    </div>
                  ) : (
                    <DropZone.FileUpload actionHint="or drop files to upload" />
                  )}
                </DropZone>
                
                <Text variant="headingMd">Hero Image</Text>
                <Text variant="bodyMd" color="subdued">
                  Upload a high-quality banner image for your brand page (recommended size: 1200x400px)
                </Text>
                
                <DropZone
                  accept="image/*"
                  type="image"
                  onDrop={handleHeroDropZone}
                >
                  {heroImage ? (
                    <Thumbnail
                      size="large"
                      alt="Hero image preview"
                      source={
                        window.URL.createObjectURL(heroImage)
                      }
                    />
                  ) : brandData?.heroUrl ? (
                    <div>
                      <Text>Current hero image:</Text>
                      <Thumbnail
                        size="large"
                        alt="Current hero image"
                        source={brandData.heroUrl}
                      />
                    </div>
                  ) : (
                    <DropZone.FileUpload actionHint="or drop files to upload" />
                  )}
                </DropZone>
                
                <Text variant="headingMd">Brand Causes (Optional)</Text>
                <Text variant="bodyMd" color="subdued">
                  Select any causes or initiatives that apply to your brand
                </Text>
                
                <Box paddingBlock="4">
                  <LegacyStack spacing="tight" wrap>
                    {causes.map(({ label, value }) => (
                      <Checkbox
                        key={value}
                        label={label}
                        checked={selectedCauses.includes(value)}
                        onChange={() => toggleCause(value)}
                      />
                    ))}
                  </LegacyStack>
                </Box>
                
                <Button submit primary size="large">
                  Continue to Shipping Settings
                </Button>
              </FormLayout>
            </LegacyCard>
          </form>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
```

### 2. Backend API for Brand Information

Create an endpoint in the NestJS backend to handle brand information:

```typescript
// src/modules/integrations/shopify-app/controllers/shopify-merchant.controller.ts

import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ShopifyAuthGuard } from '../guards/shopify-auth.guard';
import { ShopifyMerchantService } from '../services/shopify-merchant.service';

@Controller('api/integrations/shopify/merchant')
@UseGuards(ShopifyAuthGuard)
export class ShopifyMerchantController {
  constructor(private readonly merchantService: ShopifyMerchantService) {}

  @Get(':shop/brand')
  async getBrandInformation(@Param('shop') shop: string) {
    return this.merchantService.getBrandInformation(shop);
  }

  @Post(':shop/brand')
  async saveBrandInformation(
    @Param('shop') shop: string,
    @Body() brandData: {
      about: string;
      location: string;
      causes: string[];
      logoUrl: string;
      heroUrl: string;
    }
  ) {
    return this.merchantService.saveBrandInformation(shop, brandData);
  }
}
```

### 3. Create Merchant Service

Implement a service to manage merchant information:

```typescript
// src/modules/integrations/shopify-app/services/shopify-merchant.service.ts

import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MerchantPlatformConnection } from '../../../entities/merchant-platform-connection.entity';

@Injectable()
export class ShopifyMerchantService {
  private readonly logger = new Logger(ShopifyMerchantService.name);

  constructor(
    @InjectRepository(MerchantPlatformConnection)
    private readonly merchantPlatformConnectionRepository: Repository<MerchantPlatformConnection>,
  ) {}

  async getBrandInformation(shop: string) {
    const connection = await this.merchantPlatformConnectionRepository.findOne({
      where: { platformStoreName: shop, platformType: 'SHOPIFY' }
    });
    
    if (!connection) {
      throw new NotFoundException(`No merchant found for shop ${shop}`);
    }
    
    return connection.brandInformation || {};
  }

  async saveBrandInformation(
    shop: string,
    brandData: {
      about: string;
      location: string;
      causes: string[];
      logoUrl: string;
      heroUrl: string;
    }
  ) {
    const connection = await this.merchantPlatformConnectionRepository.findOne({
      where: { platformStoreName: shop, platformType: 'SHOPIFY' }
    });
    
    if (!connection) {
      throw new NotFoundException(`No merchant found for shop ${shop}`);
    }
    
    // Update brand information
    connection.brandInformation = brandData;
    
    // Update onboarding step
    connection.onboardingStep = 'shipping';
    
    await this.merchantPlatformConnectionRepository.save(connection);
    
    return { success: true };
  }
}
```

### 4. File Upload Service

Implement a service to handle file uploads:

```typescript
// src/modules/integrations/shopify-app/controllers/shopify-file.controller.ts

import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ShopifyAuthGuard } from '../guards/shopify-auth.guard';
import { ShopifyFileService } from '../services/shopify-file.service';

@Controller('api/integrations/shopify/files')
@UseGuards(ShopifyAuthGuard)
export class ShopifyFileController {
  constructor(private readonly fileService: ShopifyFileService) {}

  @Get('upload-url')
  async getUploadUrl(@Query('type') type: string) {
    return this.fileService.getPresignedUploadUrl(type);
  }
}
```

Create the file service:

```typescript
// src/modules/integrations/shopify-app/services/shopify-file.service.ts

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import * as AWS from 'aws-sdk';

@Injectable()
export class ShopifyFileService {
  private readonly logger = new Logger(ShopifyFileService.name);
  private readonly s3: AWS.S3;

  constructor(private readonly configService: ConfigService) {
    // Initialize S3 client
    this.s3 = new AWS.S3({
      accessKeyId: this.configService.get<string>('aws.accessKeyId'),
      secretAccessKey: this.configService.get<string>('aws.secretAccessKey'),
      region: this.configService.get<string>('aws.region'),
    });
  }

  async getPresignedUploadUrl(type: string) {
    // Generate a unique filename
    const fileKey = `shopify/${type}/${uuidv4()}`;
    const bucketName = this.configService.get<string>('aws.s3Bucket');
    
    // Generate a presigned URL for direct upload
    const uploadUrl = this.s3.getSignedUrl('putObject', {
      Bucket: bucketName,
      Key: fileKey,
      Expires: 300, // URL expires in 5 minutes
      ContentType: 'application/octet-stream',
    });
    
    // Generate the public URL for the file
    const fileUrl = `https://${bucketName}.s3.amazonaws.com/${fileKey}`;
    
    return {
      uploadUrl,
      fileUrl,
    };
  }
}
```

### 5. Update ShopifyAuthGuard

Create a guard to verify requests from the embedded app:

```typescript
// src/modules/integrations/shopify-app/guards/shopify-auth.guard.ts

import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac } from 'crypto';

@Injectable()
export class ShopifyAuthGuard implements CanActivate {
  constructor(private configService: ConfigService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authorization = request.headers.authorization;
    
    if (!authorization || !authorization.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid authorization token');
    }
    
    const token = authorization.substring(7); // Remove "Bearer " prefix
    
    // Verify the token
    try {
      // In a real implementation, you would verify the JWT token
      // For now, this is a simplified example
      // In production, use Shopify's JWT verification
      
      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
```

### 6. Update Module Configuration

Add the new components to the Shopify module:

```typescript
// src/modules/integrations/shopify-app/shopify.module.ts

import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { ConfigModule } from '@nestjs/config';
import { MerchantPlatformConnection } from '../../entities/merchant-platform-connection.entity';
import { ShopifyAuthService } from './services/shopify-auth.service';
import { ShopifyClientService } from './services/shopify-client.service';
import { ShopifyMerchantService } from './services/shopify-merchant.service';
import { ShopifyFileService } from './services/shopify-file.service';
import { ShopifyAuthController } from './controllers/shopify-auth.controller';
import { ShopifyWebhookController } from './controllers/shopify-webhook.controller';
import { ShopifyMerchantController } from './controllers/shopify-merchant.controller';
import { ShopifyFileController } from './controllers/shopify-file.controller';
import { ShopifyWebhookMiddleware } from './middleware/shopify-webhook.middleware';

@Module({
  imports: [
    TypeOrmModule.forFeature([MerchantPlatformConnection]),
    BullModule.registerQueue({
      name: 'shopify-sync',
    }),
    ConfigModule,
  ],
  providers: [
    ShopifyAuthService,
    ShopifyClientService,
    ShopifyMerchantService,
    ShopifyFileService,
  ],
  controllers: [
    ShopifyAuthController,
    ShopifyWebhookController,
    ShopifyMerchantController,
    ShopifyFileController,
  ],
  exports: [
    ShopifyAuthService,
    ShopifyClientService,
    ShopifyMerchantService,
    ShopifyFileService,
  ],
})
export class ShopifyModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(ShopifyWebhookMiddleware)
      .forRoutes(
        { path: 'webhooks/shopify/*', method: RequestMethod.POST }
      );
  }
}
```

## Dependencies & Prerequisites

- Completed Phase 1 infrastructure
- AWS S3 or equivalent file storage service
- Polaris components for the Remix app UI
- Authentication mechanisms for API endpoints

## Testing Guidelines

1. **Brand Information Form:**
   - Test form submission with and without files
   - Verify validation for required fields
   - Test error handling and feedback

2. **File Upload:**
   - Test different file types and sizes
   - Verify correct URLs are generated and stored
   - Test error handling for upload failures

3. **Progress Tracking:**
   - Verify onboarding step is correctly updated
   - Test navigation between onboarding steps

## Next Phase

Once the brand setup is implemented, proceed to [Phase 2B: Shipping Setup](./shopify-app-phase2b-shipping-setup.md) to implement the shipping configuration UI.
