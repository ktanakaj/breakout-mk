/**
 * バリデーションユーティリティモジュール。
 * @deprecated バリデーションモジュールはいくらでもあるので自前でやらない
 * @module ./core/utils/validation-utils
 */
import { NotFoundError } from './http-error';

/**
 * 渡された値が空か検証する。
 * @param value 空かチェックする値。
 * @returns valueの値。
 * @throws 検証NG。
 * @deprecated モデル側で findOrFail() を作ったり rejectOnEmpty オプションを指定したりする。
 */
function notFound<T>(value: T): T {
	// ifでfalseと判定される値の場合、空として例外を投げる
	if (!value) {
		throw new NotFoundError('value is not found');
	}
	return value;
}

export default {
	notFound,
};