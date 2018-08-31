/**
 * ユニットテストの初期化処理モジュール。
 * @module ./test/mocha
 */
import * as config from 'config';
import * as log4js from 'log4js';
import { Sequelize } from 'sequelize-typescript';
import { getClient } from '../src/models/rankings/redis';
import User from '../src/models/user';
import Block from '../src/models/block';

// ここにフックを入れると全テストの前に自動実行される
before(async function () {
	// ※ 初期化に時間がかかる場合は伸ばす
	this.timeout(10000);

	// 全テストの実行前に一度だけ必要な処理
	log4js.configure(config['log4js']);

	// Redis初期化
	await getClient().flushdbAsync();

	// DB初期化
	const sequelize = new Sequelize(Object.assign({
		modelPaths: [__dirname + '/../src/models'],
		logging: (log) => log4js.getLogger('debug').debug(log),
		operatorsAliases: false,
	}, config['database']));
	await sequelize.dropAllSchemas({});
	await sequelize.sync();

	// DB初期データ生成
	await User.create({ id: 1, name: 'admin', password: '6546;0ba5f2e7b4bf1f0f16c260dc347c768b33f9f818020efa7ac5e85c22b30e9d5c', status: "admin", comment: 'サンプル管理者' });
	await User.create({ id: 2, name: "testuser", password: "6546;0ba5f2e7b4bf1f0f16c260dc347c768b33f9f818020efa7ac5e85c22b30e9d5c" });
	await Block.create({ key: 'B', name: '青ブロック', status: "enable", hp: 1, score: 100, xsize: 2, ysize: 1, color: 255 });
	await Block.create({ key: 'G', name: '緑ブロック', status: "enable", hp: 1, score: 100, xsize: 2, ysize: 1, color: 65280 });
	await Block.create({ key: 'R', name: '赤ブロック', status: "enable", hp: 1, score: 100, xsize: 2, ysize: 1, color: 16711680 });
	await Block.create({ key: 'SILVER', name: '銀ブロック', status: "enable", hp: 2, score: 500, xsize: 2, ysize: 1, color: 12632256 });
	await Block.create({ key: 'GOLD', name: '金ブロック', status: "enable", hp: 3, score: 1000, xsize: 2, ysize: 1, color: 16766720 });
});
