import { ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';

import { CreateArticleDto } from './dto/create-article.dto'
import { ArticlesRepository } from './repository/articles.repository'
import { Article } from './articles.entity'
import { ArticleStatus } from './enums/article-status.enum'
import { ArticlesQueryDto } from './dto/articles-query.dto'
import { PaginatedResponse } from 'src/common/types/pagination.types'
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager'

@Injectable()
export class ArticlesService {
  private readonly articleListCacheKeys = new Set<string>()
  constructor(
    private readonly articlesRepository: ArticlesRepository,
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
  ) {}

  private articleKey(id: number) {
    return `article:${id}`;
  }

  private articlesListKey(query: ArticlesQueryDto) {
    const { page = 1, limit = 10, ...rest } = query;
    return `articles:list:${page}:${limit}:${JSON.stringify(rest)}`;
  }

  private async invalidateArticlesLists() {
    for (const key of this.articleListCacheKeys) {
      await this.cache.del(key);
    }
    this.articleListCacheKeys.clear();
  }

  async findAll(query: ArticlesQueryDto): Promise<PaginatedResponse<Article>>{
    const { page = 1, limit = 10 } = query;

    const cacheKey = this.articlesListKey({ ...query, page, limit });
    const cached = await this.cache.get<PaginatedResponse<Article>>(cacheKey);
    if (cached) {
      console.log(cached);
      
      return cached;
    }

    const { items, total } = await this.articlesRepository.findAll({
      ...query,
      page,
      limit,
    });

    const response: PaginatedResponse<Article> = {
      data: items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };

    await this.cache.set(cacheKey, response);
    this.articleListCacheKeys.add(cacheKey);

    return response;
  }

  async findById(id: number): Promise<Article> {
    const cacheKey = this.articleKey(id);

    const cached = await this.cache.get<Article>(cacheKey);
    if (cached) {
      return cached;
    }


    const article = await this.articlesRepository.findById(id);

    if (!article) {
      throw new NotFoundException('Article not found');
    }

    await this.cache.set(cacheKey, article);

    return article;
  }
  
  async create(dto: CreateArticleDto, currentUserID: number): Promise<Article> {
    const article = await this.articlesRepository.create({
      ...dto,
      authorId: currentUserID,
      publishedOn: dto.publishedOn ? new Date(dto.publishedOn) : undefined,
    });

    await this.invalidateArticlesLists();
  
    return article
  }

  async update(id: number, dto: Partial<CreateArticleDto>, currentUserID: number): Promise<Article> {
    const article = await this.articlesRepository.findById(id);

    if (!article) {
      throw new NotFoundException('Article not found');
    }

    if (article.author.id !== currentUserID) {
      throw new ForbiddenException();
    }
    
    if (
        dto.status === ArticleStatus.PUBLISHED &&
        article.status !== ArticleStatus.PUBLISHED
    ) {
        article.status = ArticleStatus.PUBLISHED;
        article.publishedOn = new Date();
    }

    Object.assign(article, dto);

    const updated = await this.articlesRepository.update(article);

    await this.cache.del(this.articleKey(id));
    await this.invalidateArticlesLists();

    return updated;
  }

  async delete(id: number, currentUserID: number): Promise<void> {
    const article = await this.articlesRepository.findById(id);

    if (!article) {
      throw new NotFoundException('Article not found');
    }

    if (article.author.id !== currentUserID) {
      throw new ForbiddenException();
    }

    await this.articlesRepository.delete(id);
    await this.cache.del(this.articleKey(id));
    await this.invalidateArticlesLists();
    return
  }
}
