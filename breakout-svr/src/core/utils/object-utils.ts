/**
 * オブジェクト関連ユーティリティモジュール。
 * @module ./core/utils/object-utils
 */
import * as _ from 'lodash';

/**
 * オブジェクト配列同士をキーでマージする。
 * @param objs1 マージ先のオブジェクト配列。※更新される
 * @param objs2 マージ元のオブジェクト配列。
 * @param idKey1 objs1でキーが入っているプロパティ名。
 * @param idKey2 objs2でキーが入っているプロパティ名。
 * @param objKey マージ結果を登録するプロパティ名。set()の形式が使用可。
 * @param valueKey objs2の特定のプロパティのみを登録する場合そのプロパティ名。get()の形式が使用可。
 * @returns マージ結果。
 */
function mergeArray(objs1: Array<Object>, objs2: Array<Object>, idKey1: string, idKey2: string, objKey: string, valueKey?: string): Array<Object> {
	// 結合用にマップ作成
	const map = {};
	for (let obj1 of objs1) {
		map[obj1[idKey1]] = obj1;
	}

	for (let obj2 of objs2) {
		let obj1 = map[obj2[idKey2]];
		if (obj1) {
			_.set(obj1, objKey, valueKey ? _.get(obj2, valueKey) : obj2);
		}
	}
	return objs1;
}

/**
 * オブジェクト配列同士をキーでマージし、片方のオブジェクトの配列プロパティに追加する。
 * @param objs1 マージ先のオブジェクト配列。※更新される
 * @param objs2 マージ元のオブジェクト配列。
 * @param idKey1 objs1でキーが入っているプロパティ名。
 * @param idKey2 objs2でキーが入っているプロパティ名。
 * @param arrayKey マージ結果を登録する配列プロパティ名。set()の形式が使用可。
 * @param valueKey objs2の特定のプロパティのみを登録する場合そのプロパティ名。get()の形式が使用可。
 * @returns マージ結果。
 */
function mergePushArray(objs1: Array<Object>, objs2: Array<Object>, idKey1: string, idKey2: string, arrayKey: string, valueKey?: string): Array<Object> {
	// 結合用にマップ作成
	const map = {};
	for (let obj1 of objs1) {
		map[obj1[idKey1]] = obj1;
	}

	for (let obj2 of objs2) {
		let obj1 = map[obj2[idKey2]];
		if (obj1) {
			// getで配列を取り出し、その後setで詰め直す
			let array = _.get(obj1, arrayKey) || [];
			if (!Array.isArray(array)) {
				throw new Error(`'${arrayKey}' is not array. : ` + obj1);
			}
			array.push(valueKey ? _.get(obj2, valueKey) : obj2);
			_.set(obj1, arrayKey, array);
		}
	}
	return objs1;
}

export default {
	mergeArray,
	mergePushArray,
};
