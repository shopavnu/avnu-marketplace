import { Repository } from 'typeorm';
import { FocusState } from '../entities/focus-state.entity';
export declare class FocusStateService {
  private readonly focusStateRepository;
  private readonly logger;
  constructor(focusStateRepository: Repository<FocusState>);
  saveFocusState(focusData: Partial<FocusState>): Promise<FocusState>;
  getLastFocusState(userId: string, sessionId: string): Promise<FocusState | null>;
  getRouteFocusState(userId: string, sessionId: string, route: string): Promise<FocusState | null>;
  clearFocusStates(userId: string, sessionId: string): Promise<boolean>;
  getFocusHistory(userId: string, limit?: number): Promise<FocusState[]>;
  cleanupOldFocusStates(olderThan: Date): Promise<number>;
}
