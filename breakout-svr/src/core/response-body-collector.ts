/**
 * レスポンスボディを参照用に保存するExpressミドルウェア。
 * @module ./core/response-body-collector
 */
import * as express from 'express';

/**
 * レスポンスボディ出力にフックして、res._getData() で参照できるようにするミドルウェア。
 *
 * レスポンスのサイズが大きい場合問題となる可能性があるため、本番環境での運用は注意。
 * @param req リクエスト。
 * @param res レスポンス。
 * @param next 次の処理呼び出し用のコールバック。
 */
export default function responseBodyCollector(req: express.Request, res: express.Response, next: express.NextFunction): void {
	const chunks = [];

	// 通常の write や end にフックする
	function callWithPushChunk(org: Function) {
		return function (chunk) {
			if (chunk !== undefined && chunk !== null && chunk !== '') {
				chunks.push(chunk);
			}
			org.apply(this, arguments);
		};
	}
	res.write = <any>callWithPushChunk(res.write);
	res.end = callWithPushChunk(res.end);

	// 動的にメソッドを追加
	res['_getData'] = function () { return Buffer.concat(chunks).toString('utf8'); };

	next();
}