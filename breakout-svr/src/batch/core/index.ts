/**
 * バッチ共通モジュール。
 * @module ./batch/core
 */
import 'reflect-metadata';
import * as config from 'config';
import * as log4js from 'log4js';
import 'source-map-support/register';
import { Sequelize } from 'sequelize-typescript';

// log4jsの初期化
log4js.configure(config['log4js']);
const logger = log4js.getLogger('batch');

// バッチ開始ログの出力
const name = process.argv.join(' ');
logger.info(name + " : started");

// Sequelizeの初期化
new Sequelize(Object.assign({
	modelPaths: [__dirname + '/../../models'],
	logging: (log) => log4js.getLogger('debug').debug(log),
	operatorsAliases: false,
}, config['database']));

// バッチ終了ログの出力
// ※ イベントでバッチ終了に割り込む
process.on('exit', (code) => {
	if (code) {
		logger.error(`${name} : failed (${code})`);
	} else {
		logger.info(`${name} : finished`);
	}
});
process.on('uncaughtException', (err) => {
	log4js.getLogger('error').error(err);
	process.exit(1);
});
process.on('unhandledRejection', (reason, p) => {
	log4js.getLogger('error').error(reason);
	process.exit(1);
});

