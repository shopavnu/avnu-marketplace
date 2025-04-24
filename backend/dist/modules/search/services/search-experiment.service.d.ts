import { ConfigService } from '@nestjs/config';
import { SearchOptionsInput } from '../dto/search-options.dto';
import { SearchResponseDto } from '../dto/search-response.dto';
import { ExperimentStatus } from '../../ab-testing/entities/experiment.entity';
export declare class SearchExperimentService {
    private readonly configService;
    private readonly logger;
    private readonly experiments;
    private readonly enabled;
    constructor(configService: ConfigService);
    private initializeExperiments;
    registerExperiment(experiment: SearchExperiment): void;
    getExperiments(): SearchExperiment[];
    getExperiment(experimentId: string): SearchExperiment | undefined;
    applyExperiment(options: SearchOptionsInput, experimentId: string, variantId?: string): SearchOptionsInput;
    private selectRandomVariant;
    processExperimentResults(results: SearchResponseDto, options: SearchOptionsInput): SearchResponseDto;
}
export interface SearchExperiment {
    id: string;
    name: string;
    description: string;
    status: ExperimentStatus;
    startDate: Date;
    variants: SearchExperimentVariant[];
}
export interface SearchExperimentVariant {
    id: string;
    name: string;
    description: string;
    weight: number;
    trafficPercentage: number;
    modifyOptions: (options: SearchOptionsInput) => SearchOptionsInput;
}
