// /**
//  * HTTPモック用のヘルパーモジュール。
//  * @module ./test/http-mocks-helper
//  */
// const events = require('events');
// const httpMocks = require('node-mocks-http');

// // userId = 2 の認証トークン
// /** @const {string} */
// const AUTHORIZED_TOKEN2 = "JWT eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOjIsInRpbWVzdGFtcCI6MTQ3MzQzMzM5ODg4NX0.5St4FGMG3n99qt8cULXhyhed4AOi5nXZ0lLNkE9OE5E";

// /** @const {string} */
// const TRACKING_ID1 = "unittest-tracking-id1";
// /** @const {string} */
// const TRACKING_ID2 = "unittest-tracking-id2";

// /**
//  * 未ログイン状態のモックリクエストを生成する。
//  * @param {Object} options httpMocks.createRequest()に渡すoptions。
//  * @returns {Object} 生成したモックリクエスト。
//  */
// function creatRequestAtNoUser(options) {
// 	options.cookies = options.cookies || {};
// 	options.cookies['Tracking-Id'] = options.cookies['Tracking-Id'] || TRACKING_ID1;
// 	return httpMocks.createRequest(options);
// }

// /**
//  * ユーザーID=2でログイン状態のモックリクエストを生成する。
//  * @param {Object} options httpMocks.createRequest()に渡すoptions。
//  * @returns {Object} 生成したモックリクエスト。
//  */
// function createAuthorizedRequestAtUserId2(options) {
// 	options.headers = options.headers || {};
// 	options.headers.authorization = options.headers.authorization || AUTHORIZED_TOKEN2;
// 	options.cookies = options.cookies || {};
// 	options.cookies['Tracking-Id'] = options.cookies['Tracking-Id'] || TRACKING_ID2;
// 	let req = httpMocks.createRequest(options);
// 	req.user = req.user || { id: 2 };
// 	return req;
// }

// /**
//  * JSONを返す処理用のモックレスポンスを生成する。
//  * @param {Object} options httpMocks.createResponse()に渡すoptions。
//  * @returns {Object} 生成したモックレスポンス。
//  */
// function createResponseForJsonResult(callback) {
// 	const res = httpMocks.createResponse({
// 		eventEmitter: events.EventEmitter
// 	});
// 	res.on('end', function() {
// 		callback(JSON.parse(res._getData()));
// 	});
// 	return res;
// }

// module.exports = {
// 	creatRequestAtNoUser: creatRequestAtNoUser,
// 	createAuthorizedRequestAtUserId2: createAuthorizedRequestAtUserId2,
// 	createResponseForJsonResult: createResponseForJsonResult,
// };