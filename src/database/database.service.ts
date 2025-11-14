import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common'
import { DataSource } from 'typeorm'

@Injectable()
export class DatabaseService implements OnApplicationBootstrap {
	private readonly logger = new Logger(DatabaseService.name);
	constructor(private readonly ds: DataSource) {}
	async onApplicationBootstrap() {
		this.logger.log(`DataSoure инициализирован = ${this.ds.isInitialized}`);
		await this.ds.query('SELECT 1');
		this.logger.log('БД пинг успешен');
	}
}