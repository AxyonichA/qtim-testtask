import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';

import { Public } from 'src/common/decorators/public.decorator'
import { CurrentUser } from 'src/common/decorators/current-user.decorator'
import { ArticlesService } from './articles.service'
import { CreateArticleDto } from './dto/create-article.dto'
import { Article } from './articles.entity'
import { User } from 'src/users/users.entity'
import { ArticlesQueryDto } from './dto/articles-query.dto'
import { PaginatedResponse } from 'src/common/types/pagination.types'

@Controller('articles')
export class ArticlesController {
  constructor(
    private readonly articlesService: ArticlesService
  ) {}

  @Public()
  @Get()
  async findAll(@Query() query: ArticlesQueryDto): Promise<PaginatedResponse<Article>> {
    return await this.articlesService.findAll(query);
  }

  @Public()
  @Get(':id')
  async findById(@Param("id", ParseIntPipe) id: number): Promise<Article | null> {
    return await this.articlesService.findById(id);
  }

  @Post()
  async create(@CurrentUser() user: User, @Body() dto: CreateArticleDto): Promise<Article> {
    return await this.articlesService.create(dto, user.id);
  }

  @Patch(":id")
  async update(@CurrentUser() user: User, @Param("id", ParseIntPipe) id: number, @Body() data: Partial<Article>): Promise<Article> {
    return await this.articlesService.update(id, data, user.id);
  }

  @Delete(":id")
  async delete(@CurrentUser() user: User, @Param("id", ParseIntPipe) id: number): Promise<void> {
    return await this.articlesService.delete(id, user.id);
  }
}
