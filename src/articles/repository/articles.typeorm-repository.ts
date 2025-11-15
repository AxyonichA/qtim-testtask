import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import { Article } from '../articles.entity'
import { ArticlesRepository } from './articles.repository'
import { ArticlesFindParams } from '../dto/articles-query.dto'

@Injectable()
export class TypeOrmArticlesRepository extends ArticlesRepository{
  constructor(
    @InjectRepository(Article) 
    private readonly repo: Repository<Article>
  ) {
    super()
  }

  async findAll(params: ArticlesFindParams): Promise<{ items: Article[]; total: number }> {
    const {
      page = 1,
      limit = 10,
      title,
      status,
      authorId,
      publishedFrom,
      publishedTo,
    } = params;

    const qb = this.repo
      .createQueryBuilder('article')
      .orderBy('article.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (title) {
      qb.andWhere('article.title ILIKE :title', { title: `%${title}%` });
    }

    if (status) {
      qb.andWhere('article.status = :status', { status });
    }

    if (authorId) {
      qb.andWhere('article.authorId = :authorId', { authorId });
    }

    if (publishedFrom) {
      qb.andWhere('article.publishedOn >= :from', { from: publishedFrom });
    }

    if (publishedTo) {
      qb.andWhere('article.publishedOn <= :to', { to: publishedTo });
    }

    const [items, total] = await qb.getManyAndCount();

    return { items, total };
  }
  async create(dto: Partial<Article>): Promise<Article> {
    const article = this.repo.create(dto);

    return await this.repo.save(article);
  }

  async findById(id: number): Promise<Article | null> {
    return await this.repo.findOne({
      where: { id },
      relations: ['author'],
    });
  }

  async update(data: Article): Promise<Article> {
    return await this.repo.save(data);
  }

  async delete(id: number): Promise<void> {
    await this.repo.delete(id);
  }
}