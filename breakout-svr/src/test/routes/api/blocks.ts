/**
 * @file blocks.tsのテスト。
 */
import * as assert from 'power-assert';
import * as httpMocks from "node-mocks-http";
import testHelper from '../../test-helper';
import router from '../../../routes/api/blocks';

describe('/api/blocks', () => {
	describe('/', () => {
		it('should return blocks', async () => {
			const req = await testHelper.createRequestForUser({
				method: 'GET',
				url: '/',
			});
			const res = await testHelper.callRequestHandler(router, req);

			const blocks = res._getJson();
			assert(Array.isArray(blocks));

			const block = blocks[0];
			assert.strictEqual(block.key, 'B');
			assert.strictEqual(block.name, '青ブロック');
		});
	});
});