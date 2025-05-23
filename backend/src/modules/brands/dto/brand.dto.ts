import { IsString, IsOptional, IsUrl, IsInt, IsArray, ValidateNested, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class SocialLinksDto {
  @IsOptional()
  @IsString()
  @IsUrl()
  instagram?: string;

  @IsOptional()
  @IsString()
  @IsUrl()
  twitter?: string;

  @IsOptional()
  @IsString()
  @IsUrl()
  facebook?: string;
}

export class CreateBrandDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  @IsUrl()
  logoUrl?: string;

  @IsOptional()
  @IsString()
  @IsUrl()
  websiteUrl?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => SocialLinksDto)
  socialLinks?: SocialLinksDto;

  @IsOptional()
  @IsString()
  supportedCausesInfo?: string;

  @IsOptional()
  @IsInt()
  @Min(1800)
  @Max(new Date().getFullYear())
  foundedYear?: number;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  values?: string[];
}

export class UpdateBrandDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  @IsUrl()
  logoUrl?: string;

  @IsOptional()
  @IsString()
  @IsUrl()
  websiteUrl?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => SocialLinksDto)
  socialLinks?: SocialLinksDto;

  @IsOptional()
  @IsString()
  supportedCausesInfo?: string;

  @IsOptional()
  @IsInt()
  @Min(1800)
  @Max(new Date().getFullYear())
  foundedYear?: number;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  values?: string[];
}

export class BrandResponseDto {
  id: string;
  name: string;
  description?: string;
  logoUrl?: string;
  websiteUrl?: string;
  socialLinks?: {
    instagram?: string;
    twitter?: string;
    facebook?: string;
  };
  supportedCausesInfo?: string;
  foundedYear?: number;
  location?: string;
  values?: string[];
  createdAt: Date;
  updatedAt: Date;
  products?: any[];
}
