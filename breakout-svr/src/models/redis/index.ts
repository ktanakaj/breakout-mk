/**
 * NoSQLモデルパッケージのNode.jsモジュール。
 * @module ./models/redis
 */

import * as path from 'path';
import * as S from 'string';
import fileUtils from '../../core/utils/file-utils';

const models = {};

// このディレクトリにある他のモデルクラスをすべて読み込む
fileUtils.directoryWalkSync(
	__dirname,
	(realpath) => {
		const fname = path.basename(realpath);
		if (/\.[jt]s$/.test(fname) && fname != "index.js" && fname != "index.ts") {
			models[S(path.basename(fname).replace(/\.[jt]s$/, '')).camelize().titleCase().s] = require(realpath);
		}
	});

module.exports = models;