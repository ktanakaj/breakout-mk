/**
 * @file blocks.tsのテスト。
 */
import * as assert from 'power-assert';
import * as httpMocks from "node-mocks-http";
import testHelper from '../test-helper';
import Block from '../../src/models/block';
import router from '../../src/routes/blocks';

describe('/api/blocks', () => {
	describe('GET /', () => {
		it('should return blocks', async () => {
			const req = httpMocks.createRequest({
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

	describe('POST /', () => {
		it('should create block', async () => {
			const req = await testHelper.createRequestForUser({
				method: 'POST',
				url: '/',
				body: {
					key: 'TEST1',
					name: 'Created block1',
					status: 'enable',
					hp: 10,
					score: 10000,
					xsize: 5,
					ysize: 1,
					color: 255,
				},
			});
			const res = await testHelper.callRequestHandler(router, req);

			const block = res._getJson();
			assert.strictEqual(block.key, 'TEST1');
			assert.strictEqual(block.name, 'Created block1');
			assert.strictEqual(block.status, 'enable');
			assert.strictEqual(block.hp, 10);
			assert.strictEqual(block.score, 10000);
			assert.strictEqual(block.xsize, 5);
			assert.strictEqual(block.ysize, 1);
			assert.strictEqual(block.color, 255);

			const dbblock = await Block.findById(block.key);
			assert.strictEqual(dbblock.name, block.name);
		});
	});
});