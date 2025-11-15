// src/articles/dto/articles-query.dto.ts
import { IsEnum, IsInt, IsOptional, IsString, IsDateString, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { ArticleStatus } from '../enums/article-status.enum'

export interface ArticlesFindParams {
  page?: number;
  limit?: number;
  title?: string;
  status?: ArticleStatus;
  authorId?: number;
  publishedFrom?: string;
  publishedTo?: string;
}

export class ArticlesQueryDto extends PaginationQueryDto implements ArticlesFindParams {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  authorId?: number;

  @IsOptional()
  @IsEnum(ArticleStatus)
  status?: ArticleStatus;

  @IsOptional()
  @IsDateString()
  publishedFrom?: string;

  @IsOptional()
  @IsDateString()
  publishedTo?: string;
}
