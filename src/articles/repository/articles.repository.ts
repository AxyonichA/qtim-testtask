import { Article } from '../articles.entity'

export abstract class ArticlesRepository {
  abstract findAll(): Promise<Article[]>
  abstract findById(id: number): Promise<Article | null>
  abstract create(article: Partial<Article>): Promise<Article>
  abstract update(data: Partial<Article>): Promise<Article>
  abstract delete(id: number): Promise<void>
}