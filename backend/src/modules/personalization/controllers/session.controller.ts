import { Controller, Post, Body, Logger } from '@nestjs/common';
import { SessionService } from '../services/session.service';
import { SessionInteractionType } from '../enums/session-interaction-type.enum';

/**
 * DTO for tracking session interactions
 */
class TrackSessionInteractionDto {
  sessionId: string;
  type: SessionInteractionType;
  data: Record<string, any>;
  durationMs?: number;
}

/**
 * Controller for handling session tracking events
 */
@Controller('session')
export class SessionController {
  private readonly logger = new Logger(SessionController.name);

  constructor(private readonly sessionService: SessionService) {}

  /**
   * Track a session interaction
   */
  @Post('track')
  async trackInteraction(@Body() dto: TrackSessionInteractionDto) {
    try {
      await this.sessionService.trackInteraction(dto.sessionId, dto.type, dto.data, dto.durationMs);
      return { success: true };
    } catch (error) {
      this.logger.error(`Failed to track session interaction: ${error.message}`);
      return { success: false, error: 'Failed to track interaction' };
    }
  }

  /**
   * Get or create a session
   */
  @Post('initialize')
  async initializeSession(@Body() { sessionId }: { sessionId: string }) {
    try {
      const session = await this.sessionService.getOrCreateSession(sessionId);
      return {
        success: true,
        sessionId: session.sessionId,
        startTime: session.startTime,
        lastActivityTime: session.lastActivityTime,
      };
    } catch (error) {
      this.logger.error(`Failed to initialize session: ${error.message}`);
      return { success: false, error: 'Failed to initialize session' };
    }
  }
}
