import { Article } from '../articles.entity'
import { ArticlesFindParams } from '../dto/articles-query.dto'

export abstract class ArticlesRepository {
  abstract findAll(params: ArticlesFindParams): Promise<{ items: Article[]; total: number }>;
  abstract findById(id: number): Promise<Article | null>
  abstract create(article: Partial<Article>): Promise<Article>
  abstract update(data: Partial<Article>): Promise<Article>
  abstract delete(id: number): Promise<void>
}