/**
 * @file stages.tsのテスト。
 */
import * as assert from 'power-assert';
import * as httpMocks from "node-mocks-http";
import testHelper from '../../test-helper';
import StageHeader from '../../../models/stage-header';
import Stage from '../../../models/stage';
import router from '../../../routes/api/stages';

describe('/api/stages', () => {
	describe('/', () => {
		before(async () => {
			// sqliteへのテストデータ登録
			await StageHeader.create({ id: 13, userId: 2, status: 'public' });
			await StageHeader.create({ id: 14, userId: 2, status: 'private' });
			await Stage.create({ id: 15, headerId: 13, name: "public stage", map: "[R] [G]" });
			await Stage.create({ id: 16, headerId: 14, name: "private stage", map: "[R] [G] [B]" });
		});

		it('should return stages', async () => {
			const req = await httpMocks.createRequest({
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
});