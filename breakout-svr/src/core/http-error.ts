/**
 * HTTPエラーの例外クラスのNode.jsモジュール。
 * @module ./libs/http-error
 */
import * as http from 'http';

/**
 * HTTPレスポンスとして結果をクライアントに返すエラーの例外クラス。
 * @extends Error
 */
class HttpError extends Error {
	status: number;
	contentType: string;

	/**
	 * 例外を生成する。
	 * @param status HTTPステータスコード。未指定時は500。
	 * @param message 例外エラーメッセージ。未指定時はステータスコードに応じた値。
	 * @param contentType コンテンツタイプ。未指定時は"text"。
	 */
	constructor(status?: number, message?: string, contentType: string = "text") {
		super(message || HttpError.makeDefaultMessage(status));
		this.name = "HttpError";
		this.status = status || 500;
		this.contentType = contentType;
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

export { HttpError };
