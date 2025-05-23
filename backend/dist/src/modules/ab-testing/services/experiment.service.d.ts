import { Repository } from 'typeorm';
import { Experiment, ExperimentStatus } from '../entities/experiment.entity';
import { ExperimentVariant } from '../entities/experiment-variant.entity';
import { ExperimentResult } from '../entities/experiment-result.entity';
import { UserExperimentAssignment } from '../entities/user-experiment-assignment.entity';
import { CreateExperimentDto } from '../dto/create-experiment.dto';
import { UpdateExperimentDto } from '../dto/update-experiment.dto';
import { UpdateExperimentVariantDto } from '../dto/update-experiment-variant.dto';
export declare class ExperimentService {
    private readonly experimentRepository;
    private readonly variantRepository;
    private readonly resultRepository;
    private readonly assignmentRepository;
    private readonly logger;
    constructor(experimentRepository: Repository<Experiment>, variantRepository: Repository<ExperimentVariant>, resultRepository: Repository<ExperimentResult>, assignmentRepository: Repository<UserExperimentAssignment>);
    create(createExperimentDto: CreateExperimentDto): Promise<Experiment>;
    findAll(status?: ExperimentStatus): Promise<Experiment[]>;
    findOne(id: string): Promise<Experiment>;
    update(id: string, updateExperimentDto: UpdateExperimentDto): Promise<Experiment>;
    updateVariant(id: string, updateVariantDto: UpdateExperimentVariantDto): Promise<ExperimentVariant>;
    remove(id: string): Promise<void>;
    startExperiment(id: string): Promise<Experiment>;
    pauseExperiment(id: string): Promise<Experiment>;
    completeExperiment(id: string): Promise<Experiment>;
    archiveExperiment(id: string): Promise<Experiment>;
    declareWinner(experimentId: string, variantId: string): Promise<Experiment>;
    getExperimentResults(id: string): Promise<any>;
}
