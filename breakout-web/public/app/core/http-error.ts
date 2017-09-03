/**
 * HTTPエラー用例外クラス群。
 * @module ./app/core/http-error
 */
import { Response } from '@angular/http';

/**
 * HTTPのエラーを格納する例外クラス。
 */
export class HttpError extends Error {
	/** HTTPステータスコード */
	status: number;

	/**
	 * 例外を生成する。
	 * @param status HTTPステータスコード。
	 * @param message エラーメッセージ。
	 */
	constructor(status: number, message: string = '') {
		super(message || "Http Error");
		this.name = "HttpError";
		this.status = status;
	}

	/**
	 * ステータスコードに応じたHTTP例外を生成する。
	 * @param status ステータスコード。
	 * @param message エラーメッセージ。
	 * @returns 生成した例外。
	 */
	static create(status: number, message: string = '') {
		switch (status) {
			case 400:
				return new BadRequestError(message);
			case 401:
				return new UnauthorizedError(message);
			case 403:
				return new ForbiddenError(message);
			case 404:
				return new NotFoundError(message);
			case 500:
				return new InternalServerError(message);
			case 502:
				return new ServiceUnavailableError(message);
			default:
				return new HttpError(status, message);
		}
	}
}

/**
 * 400 Bad Requestのエラーを格納する例外クラス。
 */
export class BadRequestError extends HttpError {
	/**
	 * 例外を生成する。
	 * @param message エラーメッセージ。
	 */
	constructor(message: string = '') {
		super(400, message || "Bad Request");
		this.name = "BadRequestError";
	}
}

/**
 * 401 Unauthorizedのエラーを格納する例外クラス。
 */
export class UnauthorizedError extends HttpError {
	/**
	 * 例外を生成する。
	 * @param message エラーメッセージ。
	 */
	constructor(message: string = '') {
		super(401, message || "Unauthorized");
		this.name = "UnauthorizedError";
	}
}

/**
 * 403 Forbiddenのエラーを格納する例外クラス。
 */
export class ForbiddenError extends HttpError {
	/**
	 * 例外を生成する。
	 * @param message エラーメッセージ。
	 */
	constructor(message: string = '') {
		super(403, message || "Forbidden");
		this.name = "ForbiddenError";
	}
}

/**
 * 404 Not Foundのエラーを格納する例外クラス。
 */
export class NotFoundError extends HttpError {
	/**
	 * 例外を生成する。
	 * @param message エラーメッセージ。
	 */
	constructor(message: string = '') {
		super(404, message || "Not Found");
		this.name = "NotFoundError";
	}
}

/**
 * 500 Internal Server Errorのエラーを格納する例外クラス。
 */
export class InternalServerError extends HttpError {
	/**
	 * 例外を生成する。
	 * @param message エラーメッセージ。
	 */
	constructor(message: string = '') {
		super(500, message || "Internal Server Error");
		this.name = "InternalServerError";
	}
}

/**
 * 503 Service Unavailableのエラーを格納する例外クラス。
 */
export class ServiceUnavailableError extends HttpError {
	/**
	 * 例外を生成する。
	 * @param message エラーメッセージ。
	 */
	constructor(message: string = '') {
		super(503, message || "Service Unavailable");
		this.name = "ServiceUnavailableError";
	}
}

/**
 * HTTPレスポンスから例外を投げる。
 * @param response HTTPレスポンス。
 * @throws 生成した例外。
 */
export function throwErrorByResponse(response: Response | any): never {
	// レスポンスの場合、HTTPエラーに変換して投げる
	if (response instanceof Response) {
		// レスポンスが文字列の場合エラーメッセージと判断
		let message = '';
		if (response.headers.has('content-type') && response.headers.get('content-type').startsWith('text/plain')) {
			message = response.text();
		}
		throw HttpError.create(response.status, message);
	}
	// それ以外はそのまま投げる
	throw response;
}
