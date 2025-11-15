import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import { Article } from '../articles.entity'
import { ArticlesRepository } from './articles.repository'

@Injectable()
export class TypeOrmArticlesRepository extends ArticlesRepository{
  constructor(
    @InjectRepository(Article) 
    private readonly repo: Repository<Article>
  ) {
    super()
  }

  async findAll(): Promise<Article[]> {
    return await this.repo.find();
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