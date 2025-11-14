import * as Joi from 'joi'


export default Joi.object({
	NODE_ENV: Joi.string()
		.valid('development', 'test', 'production', 'staging')
		.default('development'),
	DATABASE_HOST: Joi.string().default('localhost'),
	DATABASE_PORT: Joi.number().default(5432),
	DATABASE_USER: Joi.string().required(),
	DATABASE_PASSWORD: Joi.string().required(),
	DATABASE_NAME: Joi.string().required(),
	DATABASE_SYNC: Joi.string().default('false'),
	DATABASE_AUTOLOAD: Joi.string().default('false'),
})