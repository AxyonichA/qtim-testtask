
import { TransactionManager } from './trx-manager.abstract'
import { TypeOrmTransactionManager } from './trx-manager.typeorm'

export const TrxManagerProvider = {
  provide: TransactionManager,
  useClass: TypeOrmTransactionManager,
};