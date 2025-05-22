import { Type as ClassType } from '@nestjs/common/interfaces';
export declare class PaginationDto {
  page?: number;
  limit?: number;
}
export declare class PageInfo {
  totalItems: number;
  itemCount: number;
  itemsPerPage: number;
  totalPages: number;
  currentPage: number;
}
export declare function Paginated<T>(classRef: ClassType<T>): any;
