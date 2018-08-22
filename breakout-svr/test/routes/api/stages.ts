/**
 * @file stages.tsのテスト。
 */
import * as assert from 'power-assert';
import * as httpMocks from "node-mocks-http";
import testHelper from '../../test-helper';
import { NotFoundError } from '../../../src/core/utils/http-error';
import User from '../../../src/models/user';
import StageHeader from '../../../src/models/stage-header';
import Stage from '../../../src/models/stage';
import router from '../../../src/routes/api/stages';

describe('/api/stages', () => {
	before(async () => {
		// sqliteへのテストデータ登録
		await StageHeader.create({ id: 13, userId: 2, status: 'public' });
		await StageHeader.create({ id: 14, userId: 2, status: 'private' });
		await Stage.create({ id: 15, headerId: 13, name: "public stage", map: "[R] [G]" });
		await Stage.create({ id: 16, headerId: 14, name: "private stage", map: "[R] [G] [B]" });
	});

	describe('GET /', () => {
		it('should return stages', async () => {
			const req = httpMocks.createRequest({
				method: 'GET',
				url: '/',
			});
			const res = await testHelper.callRequestHandler(router, req);

			const stages = res._getJson();
			assert(Array.isArray(stages));

			// 未ログインのため、公開ステージのみが取得される
			const stage = stages.find((s) => s.id === 15);
			assert.strictEqual(stage.name, 'public stage');
			assert.strictEqual(stage.header.id, 13);

			assert.strictEqual(stages.find((s) => s.id === 16), undefined);
		});
	});

	describe('POST /', () => {
		it('should create stage', async () => {
			const req = await testHelper.createRequestForUser({
				method: 'POST',
				url: '/',
				body: {
					name: 'Create Stage1',
					map: '[B] [B] [B]',
					comment: 'Created by unittest',
					header: {
						status: 'public',
					},
				},
			});
			const res = await testHelper.callRequestHandler(router, req);

			const stage = res._getJson();
			assert.strictEqual(typeof stage.id, 'number');
			assert.strictEqual(stage.name, 'Create Stage1');
			assert.strictEqual(stage.map, '[B] [B] [B]');
			assert.strictEqual(stage.comment, 'Created by unittest');
			assert.strictEqual(typeof stage.header.id, 'number');

			const dbstage = await Stage.findById(stage.id);
			assert.strictEqual(dbstage.name, stage.name);
			assert.strictEqual(dbstage.map, stage.map);
			assert.strictEqual(dbstage.comment, stage.comment);
			assert.strictEqual(dbstage.headerId, stage.header.id);
		});
	});

	describe('GET /:id', () => {
		it('should return stage', async () => {
			const req = httpMocks.createRequest({
				method: 'GET',
				url: '/15',
			});
			const res = await testHelper.callRequestHandler(router, req);

			const stage = res._getJson();
			assert.strictEqual(stage.name, 'public stage');
			assert.strictEqual(stage.header.id, 13);

			// 追加情報はなし
			assert.strictEqual(stage.info, undefined);
		});

		it('should return stage with all info', async () => {
			const req = httpMocks.createRequest({
				method: 'GET',
				url: '/15',
				query: {
					fields: 'all',
				},
			});
			const res = await testHelper.callRequestHandler(router, req);

			const stage = res._getJson();
			assert.strictEqual(stage.name, 'public stage');
			assert.strictEqual(stage.header.id, 13);

			// 追加情報あり
			assert(stage.info instanceof Object);
		});

		it('should return private stage for owner', async () => {
			const req = await testHelper.createRequestForUser({
				method: 'GET',
				url: '/16',
			});
			req.user = await User.findById(2);
			const res = await testHelper.callRequestHandler(router, req);

			const stage = res._getJson();
			assert.strictEqual(stage.name, 'private stage');
		});

		it("should't return private stage for not owner", async () => {
			const req = httpMocks.createRequest({
				method: 'GET',
				url: '/16',
			});
			try {
				await testHelper.callRequestHandler(router, req);
				assert.fail('Missing expected exception');
			} catch (err) {
				assert(err instanceof NotFoundError);
			}
		});
	});
});