/**
 * ユニットテスト補助用のヘルパーモジュール。
 * @module ./test/test-helper
 */
import { EventEmitter } from 'events';
import * as express from 'express';
import * as httpMocks from 'node-mocks-http';
import User from '../models/user';

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
		res['_getJson'] = function () { return JSON.parse(this._getData()); };
		res.once('end', () => resolve(res));
		res.once('error', (err) => reject(err));
		requestHandler(req, res, (err) => err ? reject(err) : resolve(res));
	});
}

/**
 * 認証情報を設定したモックリクエストを生成する。
 * @param options httpMocks.createRequest()に渡すoptions。
 * @returns 生成したモックリクエスト。
 */
async function createRequestForUser(options: httpMocks.RequestOptions): Promise<httpMocks.MockRequest<express.Request>> {
	// 無理やり認証情報を付けて認証中扱いにする
	const req = httpMocks.createRequest(options);
	req.user = await User.findOne({ where: { name: 'admin' } });
	// passport認証ありの場合、logIn,isAuthenticatedが無いと言われるので、無理やりモックを詰める
	req.logIn = <any>function (user, optionsOrDone, done) {
		this.user = user;
		// ※ 引数2つと3つのバージョンがある？ので調整
		if (typeof done === 'function') {
			done();
		} else {
			optionsOrDone();
		}
	};
	req.login = req.logIn;
	req.logout = function () { this.user = null; };
	req.isAuthenticated = function () { return Boolean(this.user); };
	return req;
}

export default {
	callRequestHandler,
	createRequestForUser,
};
