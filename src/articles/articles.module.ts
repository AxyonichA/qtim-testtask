import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm'

import { ArticlesController } from './articles.controller';
import { ArticlesService } from './articles.service';
import { TypeOrmArticlesRepository } from './repository/articles.typeorm-repository'
import { ArticlesRepository } from './repository/articles.repository'
import { Article } from './articles.entity'

@Module({
  imports: [TypeOrmModule.forFeature([Article])],
  providers: [
    ArticlesService,
    {
      provide: ArticlesRepository,
      useClass: TypeOrmArticlesRepository
    }
  ],
  controllers: [ArticlesController],
  exports: [ArticlesService, ArticlesRepository]
})
export class ArticlesModule {}
