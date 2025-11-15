import { Test, TestingModule } from '@nestjs/testing';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

import { ArticlesService } from './articles.service';
import { ArticlesRepository } from './repository/articles.repository';
import { Article } from './articles.entity';
import { ArticleStatus } from './enums/article-status.enum';
import { CreateArticleDto } from './dto/create-article.dto';

describe('ArticlesService', () => {
  let service: ArticlesService;
  let articlesRepository: jest.Mocked<ArticlesRepository>;
  let cache: {
    get: jest.Mock;
    set: jest.Mock;
    del: jest.Mock;
  };

  const articleAuthorId = 42;

  const articleMock: Article = {
    id: 1,
    title: 'Test article',
    description: 'Description',
    status: ArticleStatus.DRAFT,
    publishedOn: undefined,
    authorId: articleAuthorId,
    author: {
      id: articleAuthorId,
      firstName: 'User',
      lastName: undefined,
      email: 'user@example.com',
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const repoMock: Partial<jest.Mocked<ArticlesRepository>> = {
      findById: jest.fn(),
      findAll: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    cache = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ArticlesService,
        {
          provide: ArticlesRepository,
          useValue: repoMock,
        },
        {
          provide: CACHE_MANAGER,
          useValue: cache,
        },
      ],
    }).compile();

    service = module.get<ArticlesService>(ArticlesService);
    articlesRepository = module.get(ArticlesRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('findById: возвращает статью из кэша, если она там есть', async () => {
    cache.get.mockResolvedValueOnce(articleMock);

    const result = await service.findById(articleMock.id);

    expect(cache.get).toHaveBeenCalledWith(`article:${articleMock.id}`);
    expect(articlesRepository.findById).not.toHaveBeenCalled();
    expect(result).toBe(articleMock);
  });

  it('findById: кидает NotFoundException, если статьи нет', async () => {
    cache.get.mockResolvedValueOnce(undefined);
    articlesRepository.findById.mockResolvedValueOnce(null);

    await expect(service.findById(articleMock.id)).rejects.toBeInstanceOf(
      NotFoundException,
    );

    expect(cache.get).toHaveBeenCalledWith(`article:${articleMock.id}`);
    expect(articlesRepository.findById).toHaveBeenCalledWith(articleMock.id);
    expect(cache.set).not.toHaveBeenCalled();
  });

  it('findById: идёт в репозиторий, если в кэше нет, и кладёт результат в кэш', async () => {
    cache.get.mockResolvedValueOnce(undefined);
    articlesRepository.findById.mockResolvedValueOnce(articleMock);

    const result = await service.findById(articleMock.id);

    expect(cache.get).toHaveBeenCalledWith(`article:${articleMock.id}`);
    expect(articlesRepository.findById).toHaveBeenCalledWith(articleMock.id);
    expect(cache.set).toHaveBeenCalledWith(
      `article:${articleMock.id}`,
      articleMock,
    );
    expect(result).toBe(articleMock);
  });

  it('update: кидает NotFoundException, если статьи нет', async () => {
    articlesRepository.findById.mockResolvedValueOnce(null);

    await expect(
      service.update(articleMock.id, { title: 'New title' }, articleAuthorId),
    ).rejects.toBeInstanceOf(NotFoundException);

    expect(articlesRepository.findById).toHaveBeenCalledWith(articleMock.id);
    expect(articlesRepository.update).not.toHaveBeenCalled();
  });

  it('update: кидает ForbiddenException, если текущий пользователь не автор', async () => {
    const otherUserArticle = {
      ...articleMock,
      author: { ...articleMock.author, id: 999 },
      authorId: 999,
    };

    articlesRepository.findById.mockResolvedValueOnce(otherUserArticle as Article);

    await expect(
      service.update(articleMock.id, { title: 'New title' }, articleAuthorId),
    ).rejects.toBeInstanceOf(ForbiddenException);

    expect(articlesRepository.update).not.toHaveBeenCalled();
  });


  it('update: при переводе в PUBLISHED проставляет publishedOn', async () => {
    const draftArticle = {
      ...articleMock,
      status: ArticleStatus.DRAFT,
      publishedOn: undefined,
    };

    articlesRepository.findById.mockResolvedValueOnce(draftArticle as Article);
    articlesRepository.update.mockImplementation((a: Article) =>
      Promise.resolve(a),
    );

    const dto = { status: ArticleStatus.PUBLISHED };
    const result = await service.update(articleMock.id, dto, articleAuthorId);

    expect(articlesRepository.update).toHaveBeenCalledWith(
      expect.objectContaining({
        status: ArticleStatus.PUBLISHED,
        publishedOn: expect.any(Date),
      }),
    );

    expect(result.status).toBe(ArticleStatus.PUBLISHED);
    expect(result.publishedOn).toBeInstanceOf(Date);
  });

  it('update: очищает кэш статьи и списки статей', async () => {
    articlesRepository.findById.mockResolvedValueOnce(articleMock);
    articlesRepository.update.mockImplementation((a: Article) =>
      Promise.resolve(a),
    );

    const listKey1 = 'articles:list:1:10:{}';
    const listKey2 = 'articles:list:2:10:{}';

    const anyService: any = service;
    anyService.articleListCacheKeys.add(listKey1);
    anyService.articleListCacheKeys.add(listKey2);

    await service.update(articleMock.id, { title: 'Updated' }, articleAuthorId);

    expect(cache.del).toHaveBeenCalledWith(`article:${articleMock.id}`);

    expect(cache.del).toHaveBeenCalledWith(listKey1);
    expect(cache.del).toHaveBeenCalledWith(listKey2);

    expect(anyService.articleListCacheKeys.size).toBe(0);
  });

  it('delete: кидает NotFoundException, если статьи нет', async () => {
    articlesRepository.findById.mockResolvedValueOnce(null);

    await expect(
      service.delete(articleMock.id, articleAuthorId),
    ).rejects.toBeInstanceOf(NotFoundException);

    expect(articlesRepository.delete).not.toHaveBeenCalled();
  });

  it('delete: кидает ForbiddenException, если текущий пользователь не автор', async () => {
    const otherUserArticle = {
      ...articleMock,
      author: { ...articleMock.author, id: 999 },
      authorId: 999,
    };

    articlesRepository.findById.mockResolvedValueOnce(
      otherUserArticle as Article,
    );

    await expect(
      service.delete(articleMock.id, articleAuthorId),
    ).rejects.toBeInstanceOf(ForbiddenException);

    expect(articlesRepository.delete).not.toHaveBeenCalled();
  });

  it('delete: удаляет статью, чистит кэш статьи и инвалидирует списки', async () => {
    articlesRepository.findById.mockResolvedValueOnce(articleMock);
    articlesRepository.delete.mockResolvedValueOnce(undefined);

    const listKey = 'articles:list:1:10:{}';
    const anyService: any = service;
    anyService.articleListCacheKeys.add(listKey);

    await service.delete(articleMock.id, articleAuthorId);

    expect(articlesRepository.delete).toHaveBeenCalledWith(articleMock.id);
    expect(cache.del).toHaveBeenCalledWith(`article:${articleMock.id}`);
    expect(cache.del).toHaveBeenCalledWith(listKey);
    expect(anyService.articleListCacheKeys.size).toBe(0);
  });

  it('create: создаёт статью и инвалидирует списки', async () => {
    const dto: CreateArticleDto = {
      title: 'New',
      description: 'Desc',
      publishedOn: undefined,
    };

    articlesRepository.create.mockResolvedValue({
      ...articleMock,
      ...dto,
      id: 123,
    } as Article);

    const listKey = 'articles:list:1:10:{}';
    const anyService: any = service;
    anyService.articleListCacheKeys.add(listKey);

    const result = await service.create(dto, articleAuthorId);

    expect(articlesRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        ...dto,
        authorId: articleAuthorId,
      }),
    );

    expect(result.id).toBe(123);

    expect(cache.del).toHaveBeenCalledWith(listKey);
    expect(anyService.articleListCacheKeys.size).toBe(0);
  });
});
