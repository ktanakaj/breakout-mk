/**
 * @file users.tsのテスト。
 */
import * as assert from 'power-assert';
import * as httpMocks from "node-mocks-http";
import testHelper from '../../test-helper';
import User from '../../../src/models/user';
import router from '../../../src/routes/api/users';

describe('/api/users', () => {
	describe('GET /', () => {
		it('should return users', async () => {
			const req = await testHelper.createRequestForUser({
				method: 'GET',
				url: '/',
			});
			const res = await testHelper.callRequestHandler(router, req);

			const users = res._getJson();
			assert(Array.isArray(users));

			const user = users.find((u) => u.id === 1);
			assert.strictEqual(user.name, 'admin');
			assert.strictEqual(user.password, undefined);
			assert.strictEqual(user.comment, 'サンプル管理者');
		});
	});

	describe('POST /', () => {
		it('should create user', async () => {
			// 認証用の関数が必要なので、認証用のモックでユーザーだけ消して実行
			const req = await testHelper.createRequestForUser({
				method: 'POST',
				url: '/',
				body: {
					name: 'createuser1',
					password: '123456',
				},
			});
			req.logout();
			const res = await testHelper.callRequestHandler(router, req);

			const user = res._getJson();
			assert.strictEqual(typeof user.id, 'number');
			assert.strictEqual(user.name, 'createuser1');
			// パスワードは返さない
			assert.strictEqual(user.password, undefined);

			const dbuser = await User.scope('login').findById(user.id);
			assert.strictEqual(dbuser.name, user.name);
			assert(/[0-9A-z]+;[0-9A-z]+/.test(dbuser.password));

			// 認証状態になっていること
			assert.strictEqual(req.user.id, user.id);
		});
	});
});