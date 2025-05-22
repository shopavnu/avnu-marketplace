import { ABTestingService } from '../services/ab-testing.service';
import { ABTestResultDto } from '../dto/ab-test-results.dto';
export declare class ABTestingResolver {
  private readonly abTestingService;
  constructor(abTestingService: ABTestingService);
  abTestResults(): Promise<ABTestResultDto[]>;
}
