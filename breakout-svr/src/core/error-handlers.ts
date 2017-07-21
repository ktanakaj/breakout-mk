/**
 * エラーハンドラーのNode.jsモジュール。
 * @module ./core/error-handlers
 */
import * as express from 'express';
import { HttpError } from './http-error';
import * as log4js from 'log4js';
const logger = log4js.getLogger('error');

/**
 * 404エラーハンドラー。
 * @param req HTTPリクエスト。
 * @param res HTTPレスポンス。
 * @param next 後続のルーティング処理へのcallback。
 */
function handleNotFound(req: express.Request, res: express.Response, next: express.NextFunction): void {
	next(new HttpError(404));
}

/**
 * HTTPエラーをレスポンスに出力する。
 * @param err エラー情報。
 * @param res HTTPレスポンス。
 */
function outputHttpError(err: HttpError, res: express.Response): void {
	res.status(err.status);
	res.type(err.contentType);
	res.send(err.message);
}

/**
 * Sequelizeで複数返るエラーメッセージを結合する。
 * @param err Sequelizeの例外。
 * @returns エラーメッセージ文字列。
 */
function joinSequelizeErrorMessages(err: any): string {
	if (Array.isArray(err.errors)) {
		return err.errors.map((e) => e.message || "").join(", ");
	} else {
		return "";
	}
}

/**
 * Sequelizeエラーハンドラー。
 * @param err エラー情報。
 * @param req HTTPリクエスト。
 * @param res HTTPレスポンス。
 * @param next 後続のルーティング処理へのcallback。
 */
function handleSequelizeError(err: any, req: express.Request, res: express.Response, next: express.NextFunction): void {
	if (!res.headersSent) {
		switch (err.name) {
			case "SequelizeUniqueConstraintError":
				outputHttpError(new HttpError(400, joinSequelizeErrorMessages(err) || "unique key must be unique"), res);
				return;
			case "SequelizeValidationError":
				outputHttpError(new HttpError(400, joinSequelizeErrorMessages(err) || "input is invalid"), res);
				return;
		}
	}
	return next(err);
}

/**
 * HTTPエラーハンドラー。
 * @param err エラー情報。
 * @param req HTTPリクエスト。
 * @param res HTTPレスポンス。
 * @param next 後続のルーティング処理へのcallback。
 */
function handleHttpError(err: any, req: express.Request, res: express.Response, next: express.NextFunction): void {
	if (!res.headersSent && err instanceof HttpError) {
		outputHttpError(err, res);
		return;
	}
	return next(err);
}

/**
 * デフォルトエラーハンドラー（開発用）。
 * @param err エラー情報。
 * @param req HTTPリクエスト。
 * @param res HTTPレスポンス。
 * @param next 後続のルーティング処理へのcallback。
 */
function handleErrorForDevelop(err: any, req: express.Request, res: express.Response, next: express.NextFunction): void {
	// エラーをそのままレスポンスで出力
	logger.error(err);
	if (res.headersSent) {
		return next(err);
	}
	outputHttpError(new HttpError(err.status, err.message + "\n\n" + err), res);
}

/**
 * デフォルトエラーハンドラー。
 * @param err エラー情報。
 * @param req HTTPリクエスト。
 * @param res HTTPレスポンス。
 * @param next 後続のルーティング処理へのcallback。
 */
function handleError(err: any, req: express.Request, res: express.Response, next: express.NextFunction): void {
	// エラーを固定メッセージでレスポンスに出力。ログにはすべて出力
	logger.error(err);
	if (res.headersSent) {
		return next(err);
	}
	outputHttpError(new HttpError(err.status, err.status || "API Error"), res);
}

let handlers = {
	handleNotFound: handleNotFound,
	handleSequelizeError: handleSequelizeError,
	handleHttpError: handleHttpError,
	handleError: handleError,
};

// 開発中と運用で一部エラーハンドラーを切り替え
if (process.env.NODE_ENV === 'development') {
	handlers.handleError = handleErrorForDevelop;
}

export default handlers;
