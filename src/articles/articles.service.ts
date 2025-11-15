import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';

import { CreateArticleDto } from './dto/create-article.dto'
import { ArticlesRepository } from './repository/articles.repository'
import { Article } from './articles.entity'
import { User } from 'src/users/users.entity'
import { ArticleStatus } from './enums/article-status.enum'

@Injectable()
export class ArticlesService {
  constructor(
    private readonly articlesRepository: ArticlesRepository
  ) {}

  async findAll(): Promise<Article[]> {
    return await this.articlesRepository.findAll();
  }

  async findById(id: number): Promise<Article | null> {
    return await this.articlesRepository.findById(id);
  }
  
  async create(dto: CreateArticleDto, currentUserID: number): Promise<Article> {
    return await this.articlesRepository.create({
      ...dto,
      author: { id: currentUserID } as User,
      publishedOn: dto.publishedOn ? new Date(dto.publishedOn) : undefined,
    });
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

    return await this.articlesRepository.update(article);
  }

  async delete(id: number, currentUserID: number): Promise<void> {
    const article = await this.articlesRepository.findById(id);

    if (!article) {
      throw new NotFoundException('Article not found');
    }

    if (article.author.id !== currentUserID) {
      throw new ForbiddenException();
    }

    return await this.articlesRepository.delete(id);
  }
}
