import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

import { TransactionManager } from './trx-manager.abstract';

@Injectable()
export class TypeOrmTransactionManager extends TransactionManager {
  constructor(private readonly dataSource: DataSource) {
    super();
  }

  runInTransaction<T>(work: () => Promise<T>): Promise<T> {
    return this.dataSource.transaction(() => work());
  }
}