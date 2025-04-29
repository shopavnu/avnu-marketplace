import { ABTestResultDto } from '../dto/ab-test-results.dto';
export declare class ABTestingService {
    constructor();
    getABTestResults(): Promise<ABTestResultDto[]>;
}
