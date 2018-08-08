/**
 * ユニットテストの初期化処理モジュール。
 * @module ./test/mocha
 */
import * as config from 'config';
import * as log4js from 'log4js';
import { Sequelize } from 'sequelize-typescript';

// ここにフックを入れると全テストの前に自動実行される
before(async function () {
	// ※ 初期化に時間がかかる場合は伸ばす
	this.timeout(10000);

	// 全テストの実行前に一度だけ必要な処理
	log4js.configure(config['log4js']);

	const sequelize = new Sequelize(Object.assign({
		modelPaths: [__dirname + '/../models'],
		logging: (log) => log4js.getLogger('debug').debug(log),
	}, config['database']));
	await sequelize.sync();
});
