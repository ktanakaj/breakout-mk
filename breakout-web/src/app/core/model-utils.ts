/**
 * モデル操作関連のユーティリティ。
 * @module ./app/core/model-utils
 */

/**
 * 指定されたサイズの二次元配列を作成する。
 * @param xmax Xサイズ。
 * @param ymax Yサイズ。
 * @returns 二次元配列。
 */
function makeEmptyTable(xmax: number, ymax: number): any[][] {
	const table = [];
	for (let y = 0; y < ymax; y++) {
		if (!table[y]) {
			table[y] = [];
		}
		for (let x = 0; x < xmax; x++) {
			if (!table[y][x]) {
				table[y][x] = null;
			}
		}
	}
	return table;
}

/**
 * モデル配列を連想配列に変換する。
 * @param models key列を持つモデル配列。
 * @param key キー名。デフォルトはid。
 * @returns key列をキーとする連想配列。
 */
function modelsToMap(models: Object[], key: string = 'id'): Object {
	const map = {};
	if (Array.isArray(models)) {
		for (let i = 0; i < models.length; i++) {
			map[models[i][key]] = models[i];
		}
	}
	return map;
}

export default {
	makeEmptyTable,
	modelsToMap,
};
