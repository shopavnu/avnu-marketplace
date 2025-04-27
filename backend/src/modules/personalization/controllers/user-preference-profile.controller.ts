import { Controller, Get, Post, Body, Param, UseGuards, Req } from '@nestjs/common';
import { UserPreferenceProfileService } from '../services/user-preference-profile.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { UserPreferenceProfile } from '../entities/user-preference-profile.entity';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('User Preference Profile')
@Controller('user-preference-profile')
export class UserPreferenceProfileController {
  constructor(private readonly userPreferenceProfileService: UserPreferenceProfileService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user preference profile' })
  @ApiResponse({ status: 200, description: 'Returns the user preference profile', type: UserPreferenceProfile })
  async getUserPreferenceProfile(@Req() req): Promise<UserPreferenceProfile> {
    const userId = req.user.userId;
    return this.userPreferenceProfileService.getUserPreferenceProfile(userId);
  }

  @Post('update-from-session/:sessionId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update user preference profile from session data' })
  @ApiResponse({ status: 200, description: 'Updates and returns the user preference profile', type: UserPreferenceProfile })
  async updateProfileFromSession(@Req() req, @Param('sessionId') sessionId: string): Promise<UserPreferenceProfile> {
    const userId = req.user.userId;
    return this.userPreferenceProfileService.updateProfileFromSession(userId, sessionId);
  }

  @Get('recommendations')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get personalized product recommendations' })
  @ApiResponse({ status: 200, description: 'Returns personalized product recommendations', type: [String] })
  async getPersonalizedRecommendations(@Req() req): Promise<string[]> {
    const userId = req.user.userId;
    return this.userPreferenceProfileService.getPersonalizedRecommendations(userId);
  }
}
