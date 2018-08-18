/**
 * @file users.tsのテスト。
 */
import * as assert from 'power-assert';
import testHelper from '../../test-helper';
import router from '../../../routes/api/users';

describe('/api/users', () => {
	describe('/', () => {
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
});