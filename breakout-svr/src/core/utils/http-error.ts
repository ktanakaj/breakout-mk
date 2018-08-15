/**
 * HTTPエラーの例外クラスのNode.jsモジュール。
 * @module ./core/utils/http-error
 */
import * as http from 'http';

/**
 * HTTPレスポンスとして結果をクライアントに返すエラーの例外クラス。
 */
export class HttpError extends Error {
	/** HTTPステータスコード。 */
	status: number;
	/** 原因となるエラーがある場合その値。 */
	cause: any;

	/**
	 * 例外を生成する。
	 * @param status HTTPステータスコード。未指定時は500。
	 * @param message 例外エラーメッセージ。未指定時はステータスコードに応じた値。
	 */
	constructor(status?: number, message?: string) {
		super(message || HttpError.makeDefaultMessage(status));
		this.name = this.constructor.name;
		this.status = status || 500;
	}

	/**
	 * HTTPステータスコードに対応するデフォルトエラーメッセージを生成する。
	 * @param status HTTPステータスコード。未指定時は500扱い。
	 * @returns 例外エラーメッセージ。
	 */
	private static makeDefaultMessage(status: number): string {
		let message = http.STATUS_CODES[status];
		if (message) {
			return message;
		}
		return "Internal Server Error";
	}
}

/**
 * リクエスト不正の例外クラス。
 */
export class BadRequestError extends HttpError {
	/**
	 * 例外を生成する。
	 * @param message 例外エラーメッセージ。
	 * @param cause 原因となるエラーがある場合その値。
	 */
	constructor(message?: string, cause?: any) {
		super(400, message);
		this.cause = cause;
	}
}

/**
 * 未認証の例外クラス。
 */
export class UnauthorizedError extends HttpError {
	/**
	 * 例外を生成する。
	 * @param message 例外エラーメッセージ。
	 */
	constructor(message?: string) {
		super(401, message);
	}
}

/**
 * 権限無しの例外クラス。
 */
export class ForbiddenError extends HttpError {
	/**
	 * 例外を生成する。
	 * @param message 例外エラーメッセージ。
	 */
	constructor(message?: string) {
		super(403, message);
	}
}

/**
 * 未存在の例外クラス。
 */
export class NotFoundError extends HttpError {
	/**
	 * 例外を生成する。
	 * @param message 例外エラーメッセージ。
	 * @param cause 原因となるエラーがある場合その値。
	 */
	constructor(message?: string, cause?: any) {
		super(404, message);
		this.cause = cause;
	}
}

/**
 * サーバーエラーの例外クラス。
 */
export class InternalServerError extends HttpError {
	/**
	 * 例外を生成する。
	 * @param message 例外エラーメッセージ。
	 * @param cause 原因となるエラーがある場合その値。
	 */
	constructor(message?: string, cause?: any) {
		super(500, message);
		this.cause = cause;
	}
}