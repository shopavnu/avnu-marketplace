import { Type } from '@nestjs/common';
import { Repository } from 'typeorm';
export declare function SafeInjectRepository<T>(
  _entity: Type<T>,
): (target: any, key: string, _index?: number) => void;
export declare function createRepositoryFactory<T>(_entity: Type<T>): {
  new (repository: Repository<T>): {
    readonly repository: Repository<T>;
    getRepository(): Repository<T>;
  };
};
export declare function createRepositoryProvider<T>(_entity: Type<T>): {
  provide: string;
  useFactory: (factory: { getRepository(): Repository<T> }) => Repository<T>;
  inject: {
    new (repository: Repository<T>): {
      readonly repository: Repository<T>;
      getRepository(): Repository<T>;
    };
  }[];
};
