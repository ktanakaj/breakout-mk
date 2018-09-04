/**
 * @file rankings.tsのテスト。
 */
import * as assert from 'power-assert';
import * as httpMocks from "node-mocks-http";
import testHelper from '../test-helper';
import router from '../../src/routes/rankings';

describe('/api/rankings', () => {
	describe('GET /play/([0-9]*)/?([0-9]*)/', () => {
		it('should return ranking', async () => {
			const req = httpMocks.createRequest({
				method: 'GET',
				url: '/play/',
			});
			const res = await testHelper.callRequestHandler(router, req);

			const ranking = res._getJson();
			assert(Array.isArray(ranking));

			// TODO: 実際にランキングを登録しての確認を行う
		});
	});
});