import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FocusState } from '../entities/focus-state.entity';

@Injectable()
export class FocusStateService {
  private readonly logger = new Logger(FocusStateService.name);

  constructor(
    @InjectRepository(FocusState)
    private readonly focusStateRepository: Repository<FocusState>,
  ) {}

  /**
   * Save the current focus state for a user
   * @param focusData Focus state data
   * @returns Saved focus state
   */
  async saveFocusState(focusData: Partial<FocusState>): Promise<FocusState> {
    this.logger.log(`Saving focus state for user ${focusData.userId} on route ${focusData.route}`);

    // Set last active time to now
    focusData.lastActive = new Date();

    // Check if there's an existing active focus state for this user and session
    const existingState = await this.focusStateRepository.findOne({
      where: {
        userId: focusData.userId,
        sessionId: focusData.sessionId,
        isActive: true,
      },
    });

    if (existingState) {
      // Update the existing state
      const updatedState = { ...existingState, ...focusData };
      await this.focusStateRepository.update(existingState.id, updatedState);
      return this.focusStateRepository.findOne({ where: { id: existingState.id } });
    } else {
      // Create a new focus state
      const newState = this.focusStateRepository.create(focusData);
      return this.focusStateRepository.save(newState);
    }
  }

  /**
   * Get the last active focus state for a user
   * @param userId User ID
   * @param sessionId Session ID
   * @returns Focus state or null if not found
   */
  async getLastFocusState(userId: string, sessionId: string): Promise<FocusState | null> {
    return this.focusStateRepository.findOne({
      where: {
        userId,
        sessionId,
        isActive: true,
      },
      order: {
        lastActive: 'DESC',
      },
    });
  }

  /**
   * Get the last focus state for a specific route
   * @param userId User ID
   * @param sessionId Session ID
   * @param route Route path
   * @returns Focus state or null if not found
   */
  async getRouteFocusState(
    userId: string,
    sessionId: string,
    route: string,
  ): Promise<FocusState | null> {
    return this.focusStateRepository.findOne({
      where: {
        userId,
        sessionId,
        route,
        isActive: true,
      },
      order: {
        lastActive: 'DESC',
      },
    });
  }

  /**
   * Clear all focus states for a user session
   * @param userId User ID
   * @param sessionId Session ID
   * @returns Boolean indicating success
   */
  async clearFocusStates(userId: string, sessionId: string): Promise<boolean> {
    this.logger.log(`Clearing focus states for user ${userId} in session ${sessionId}`);
    const result = await this.focusStateRepository.update(
      { userId, sessionId, isActive: true },
      { isActive: false },
    );
    return result.affected > 0;
  }

  /**
   * Get focus history for a user
   * @param userId User ID
   * @param limit Maximum number of records to return
   * @returns Array of focus states
   */
  async getFocusHistory(userId: string, limit = 10): Promise<FocusState[]> {
    return this.focusStateRepository.find({
      where: { userId },
      order: { lastActive: 'DESC' },
      take: limit,
    });
  }

  /**
   * Clean up old focus states (can be run as a scheduled task)
   * @param olderThan Date threshold for deletion
   * @returns Number of records deleted
   */
  async cleanupOldFocusStates(olderThan: Date): Promise<number> {
    const result = await this.focusStateRepository.delete({
      lastActive: olderThan,
    });
    this.logger.log(`Cleaned up ${result.affected} old focus states`);
    return result.affected;
  }
}
