/**
 * Redis関連の共通処理モジュール。
 * @module ./core/redis/redis-helper
 */
import * as path from 'path';
import * as S from 'string';
import { Model } from 'sequelize-typescript';
import objectUtils from '../utils/object-utils';

/**
 * ベース文字列と引数からキー用の文字列を生成する。
 * @param base 元にする値。
 * @param options その他キー情報。
 * @returns 生成したキー。
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
 * @param redisModels DBモデルを読み込むRedisモデル配列。
 * @param dbClass DBモデルクラス。
 * @param objKey DBモデルを読み込むプロパティ名。
 * @param idKey DBモデルのIDが入っているプロパティ名。
 * @returns 読み込み結果。
 */
async function bulkLoadDbModels(redisModels: { member: string }[], dbClass: typeof Model, objKey: string, idKey: string = "id"): Promise<Object[]> {
	if (redisModels.length <= 0) {
		return [];
	}
	const where = {};
	where[idKey] = { in: redisModels.map((rm) => rm.member) };
	const dbModels = await dbClass.findAll({ where: where });
	return objectUtils.mergeArray(redisModels, dbModels, "member", idKey, objKey);
}

/**
 * makeKey()形式の年月をソート用に数値化する。
 * @param yearAndMonth "" または "年" または "年:月" の値。
 * @param asc 昇順用の場合true。
 * @returns ソート用の "年月" 形式で桁を合わせた値。
 */
function yearAndMonthKeyToNumber(yearAndMonth: string, asc: boolean = false): number {
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
 * @param keys キーの配列。
 * @param base キーの年月の前の部分。
 * @returns [年, 月] の配列。降順。
 */
function keysToYearAndMonths(keys: string[], base: string): string[][] {
	return keys
		.map((k) => k.replace(base, "").replace(/^:/, ""))
		.sort((a, b) => yearAndMonthKeyToNumber(b) - yearAndMonthKeyToNumber(a))
		.map((k) => k.split(":"));
}

export default {
	makeKey: makeKey,
	bulkLoadDbModels: bulkLoadDbModels,
	yearAndMonthKeyToNumber: yearAndMonthKeyToNumber,
	keysToYearAndMonths: keysToYearAndMonths,
};