import * as bcrypt from 'bcryptjs';
import dataSource from '../data-source';
import { User } from '../../users/users.entity';
import { Article } from '../../articles/articles.entity'
import { ArticleStatus } from '../../articles/enums/article-status.enum'

async function generateUsers(count: number): Promise<User[]> {
  const users: User[] = [];

  for (let i = 1; i <= count; i++) {
    const user = new User();
    user.firstName = `User ${i}`;
    user.email = `user${i}@example.com`;
    user.password = await bcrypt.hash(`password-${i}`, 10);
    users.push(user);
  }

  return users;
}

function generateArticles(count: number, users: User[]): Article[] {
  const articles: Article[] = [];

  for (let i = 1; i <= count; i++) {
    const article = new Article();

    article.title = `Article ${i}`;
    article.description = `Description for article ${i}`;

    const randomUser = users[Math.floor(Math.random() * users.length)];
    article.author = randomUser;

    const isPublished = Math.random() > 0.5;
    article.status = isPublished ? ArticleStatus.PUBLISHED : ArticleStatus.DRAFT;

    if (isPublished) {
      const offsetMs = Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000;
      article.publishedOn = new Date(Date.now() - offsetMs);
    }

    articles.push(article);
  }

  return articles;
}

async function seed() {
  try {
    await dataSource.initialize();
    console.log('Database connected');

    const userRepo = dataSource.getRepository(User);
    const articleRepo = dataSource.getRepository(Article);

    const usersToSave = await generateUsers(50);
    const users = await userRepo.save(usersToSave);

    console.log(`Users created: ${users.length}`);

    const articles = generateArticles(200, users);
    await articleRepo.save(articles);

    console.log(`Articles created: ${articles.length}`);
    console.log('Seed complete');
  } catch (err) {
    console.error('Seeding failed:', err);
  } finally {
    await dataSource.destroy();
  }
}

seed();