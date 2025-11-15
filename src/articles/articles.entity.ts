import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'

import { User } from '../users/users.entity'
import { ArticleStatus } from './enums/article-status.enum'

@Entity('articles')
export class Article{
  @PrimaryGeneratedColumn()
  id: number
  
  @ManyToOne(() => User)
  @JoinColumn({ name: 'authorId' })
  author: User;

  @Column({ name: 'authorId' })
  authorId: number;
  
  @Column({
    type: 'varchar',
    length: 255,
    nullable: false
  })
  title: string
  
  @Column({
    type: 'text',
    nullable: false
  })
  description: string
  
  @Column({
    type: 'enum',
    enum: ArticleStatus,
    nullable: false,
    default: ArticleStatus.DRAFT
  })
  status: ArticleStatus;

  @Column({
    type: 'timestamp',
    nullable: false,
    default: () => 'CURRENT_TIMESTAMP'
  })
  publishedOn?: Date;
  

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}