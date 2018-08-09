/**
 * ユニットテスト補助用のヘルパーモジュール。
 * @module ./test/test-helper
 */
import { EventEmitter } from 'events';
import * as express from 'express';
import * as httpMocks from 'node-mocks-http';

export interface MockResponse extends httpMocks.MockResponse<express.Response> {
	_getJson(): any;
}

/**
 * expressのリクエストを実行する。
 * @param requestHandler expressのリクエストハンドラーやルーター。
 * @param req 実行するリクエスト。
 * @returns レスポンス。
 */
function callRequestHandler(requestHandler: express.RequestHandler, req: express.Request): Promise<MockResponse> {
	return new Promise<MockResponse>((resolve, reject) => {
		const res: MockResponse = httpMocks.createResponse({
			eventEmitter: EventEmitter,
		});
		res['_getJson'] = function() { return JSON.parse(this._getData()); };
		res.once('end', () => resolve(res));
		res.once('error', (err) => reject(err));
		requestHandler(req, res, (err) => err ? reject(err) : resolve(res));
	});
}

export default {
	callRequestHandler,
};
