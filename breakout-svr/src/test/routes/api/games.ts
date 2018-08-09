/**
 * @file games.tsのテスト。
 */
import * as assert from 'power-assert';
import * as httpMocks from "node-mocks-http";
import testHelper from '../../test-helper';
import User from '../../../models/user';
import StageHeader from '../../../models/stage-header';
import Stage from '../../../models/stage';
import router from '../../../routes/api/games';

describe('/api/games', () => {
	before(async () => {
		// sqliteへのテストデータ登録
		await User.create({ id: 2, name: "test user", password: "xxxx" });
		await StageHeader.create({ id: 3, userId: 2, status: 'public' });
		await Stage.create({ id: 5, headerId: 3, name: "test stage", map: "[R] [G]" });
	});

	describe('/start', () => {
		it('should start game', async () => {
			const req = httpMocks.createRequest({
				method: 'POST',
				url: '/start',
				body: { stageId: 5 },
			});
			const res = await testHelper.callRequestHandler(router, req);
			const playlog = res._getJson();
			assert.strictEqual(playlog.stageId, 5);
			assert.strictEqual(playlog.userId, null);
		});
	});
});