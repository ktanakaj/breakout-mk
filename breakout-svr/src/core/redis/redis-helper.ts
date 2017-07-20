/**
 * Redis関連の共通処理モジュール。
 * @module ./libs/redis-helper
 */
import * as redis from 'redis';
import * as Bluebird from 'bluebird';
import * as log4js from 'log4js';
import * as path from 'path';
import * as S from 'string';
import * as config from 'config';
import objectUtils from '../utils/object-utils';
const redisconfig = config['redis'];
const logger = log4js.getLogger('debug');

/** @type {Object} */
let client = redis.createClient(redisconfig.port, redisconfig.host);

// bluebird を使って、Redisに非同期メソッド追加
Bluebird.promisifyAll(redis.RedisClient.prototype);
Bluebird.promisifyAll(redis.Multi.prototype);

// Redisコマンドログ出力の設定
if (process.env.NODE_ENV === 'development') {
	let mclient = redis.createClient(redisconfig.port, redisconfig.host);
	mclient.monitor();
	mclient.on("monitor", (time, args, raw_reply) => {
		logger.debug("Executing (redis): " + args.join(" "));
	});
}

/**
 * ベース文字列と引数からキー用の文字列を生成する。
 * @param {string} base 元にする値。
 * @param {...string} options その他キー情報。
 * @returns {string} 生成したキー。
 */
function makeKey(base: string, ...options: string[]): string {
	// baseはファイル名の場合は余計なものを除去してスタイルを合わせる
	let key = S(path.basename(base, '.js')).camelize().s;
	for (let o of options) {
		key += ":" + o;
	}
	return key;
}

/**
 * Redisモデルインスタンスに関連するDBモデルを読み込む。
 * @param {Array} redisModels DBモデルを読み込むRedisモデル配列。
 * @param {Function} dbClass DBモデルクラス。
 * @param {string} objKey DBモデルを読み込むプロパティ名。
 * @param {string} idKey DBモデルのIDが入っているプロパティ名。
 * @returns {Promise.<Array>} 読み込み結果。
 */
function bulkLoadDbModels(redisModels, dbClass, objKey, idKey = "id"): Bluebird<any> {
	if (redisModels.length <= 0) {
		return new Bluebird((resolve) => resolve());
	}
	const where = {};
	where[idKey] = { in: redisModels.map((rm) => rm.member) };
	return dbClass.findAll({ where: where })
		.then((dbModels) => objectUtils.mergeArray(redisModels, dbModels, "member", idKey, objKey));
}

/**
 * makeKey()形式の年月をソート用に数値化する。
 * @param {string} yearAndMonth "" または "年" または "年:月" の値。
 * @param {boolean} asc 昇順用の場合true。
 * @returns {string} ソート用の "年月" 形式で桁を合わせた値。
 */
function yearAndMonthKeyToNumber(yearAndMonth, asc = false): number {
	// 空の場合は累計として一番小さくor大きくするために適当な値を返す
	if (yearAndMonth === "") {
		return asc ? 0 : 999999;
	}
	// 年だけの場合は月より小さくor大きくするために適当な2桁をつける
	if (yearAndMonth.indexOf(":") === -1) {
		return Number(yearAndMonth + (asc ? "00" : "99"));
	}
	// 年月の場合は、月を2桁にする
	let year, month;
	[year, month] = yearAndMonth.split(":");
	return Number(year + S(month).pad(2, "0").s);
}

/**
 * makeKey()形式の年月キーを [年, 月] の配列に復元する。
 * @param {Array} keys キーの配列。
 * @param {string} base キーの年月の前の部分。
 * @returns {Array} [年, 月] の配列。降順。
 */
function keysToYearAndMonths(keys, base): string[] {
	return keys
		.map((k) => k.replace(base, "").replace(/^:/, ""))
		.sort((a, b) => yearAndMonthKeyToNumber(b) - yearAndMonthKeyToNumber(a))
		.map((k) => k.split(":"));
}

export default {
	client: client,
	makeKey: makeKey,
	bulkLoadDbModels: bulkLoadDbModels,
	yearAndMonthKeyToNumber: yearAndMonthKeyToNumber,
	keysToYearAndMonths: keysToYearAndMonths,
};