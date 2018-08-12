/**
 * バリデーションユーティリティモジュール。
 * @module ./core/utils/validation-utils
 */
import { BadRequestError, NotFoundError } from '../http-error';

/**
 * バリデートエラーのメッセージを生成する。
 * @param value エラーになった値。
 * @param name 名前を通知する値の名前。
 * @param suffix エラーの文。
 * @returns エラーメッセージ。
 */
function makeMessage(value: any, name?: string, suffix?: string): string {
	let message = '';
	if (name !== undefined) {
		message += name + '=';
	}
	if (value !== undefined) {
		message += value + ' ';
	}
	return message + suffix;
}

/**
 * 渡された値が空か検証する。
 * @param value 空かチェックする値。
 * @param name NG時に通知する値の名前。
 * @returns valueの値。
 * @throws 検証NG。
 */
function notFound<T>(value: T, name?: string): T {
	// ifでfalseと判定される値の場合、空として例外を投げる
	if (!value) {
		throw new NotFoundError(name ? makeMessage(undefined, name, "is not found") : undefined);
	}
	return value;
}

/**
 * 渡された値が数値か検証する。
 * @param value 数値かチェックする値。
 * @param name NG時に通知する値の名前。
 * @returns valueの値。
 * @throws 検証NG。
 */
function toNumber(value: any, name?: string): number {
	// 変換に失敗する値の場合、数値以外として例外を投げる
	value = Number(value);
	if (isNaN(value)) {
		throw new BadRequestError(makeMessage(value, name, "is not number"));
	}
	return value;
}

export default {
	notFound,
	toNumber,
};