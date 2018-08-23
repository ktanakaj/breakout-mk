/**
 * @file games.tsのテスト。
 */
import * as assert from 'power-assert';
import * as httpMocks from "node-mocks-http";
import testHelper from '../../test-helper';
import { BadRequestError, NotFoundError } from '../../../src/core/utils/http-error';
import User from '../../../src/models/user';
import StageHeader from '../../../src/models/stage-header';
import Stage from '../../../src/models/stage';
import Playlog from '../../../src/models/playlog';
import StagePlayRanking from '../../../src/models/rankings/stage-play-ranking';
import StageScoreRanking from '../../../src/models/rankings/stage-score-ranking';
import UserPlayRanking from '../../../src/models/rankings/user-play-ranking';
import router from '../../../src/routes/api/games';

describe('/api/games', () => {
	before(async () => {
		// sqliteへのテストデータ登録
		await StageHeader.create({ id: 3, userId: 2, status: 'public' });
		await StageHeader.create({ id: 4, userId: 2, status: 'private' });
		await Stage.create({ id: 5, headerId: 3, name: "public stage", map: "[R] [G]" });
		await Stage.create({ id: 6, headerId: 4, name: "private stage", map: "[R] [G] [B]" });
	});

	describe('POST /start & /end', () => {
		it('should start & end game without login', async () => {
			const reqStart = httpMocks.createRequest({
				method: 'POST',
				url: '/start',
				body: { stageId: 5 },
			});
			const resStart = await testHelper.callRequestHandler(router, reqStart);

			const playlogStart = resStart._getJson();
			assert.strictEqual(typeof playlogStart.id, 'number');
			assert.strictEqual(playlogStart.stageId, 5);
			assert.strictEqual(playlogStart.userId, null);
			assert.strictEqual(playlogStart.cleared, false);

			// /endには、プレイログと同じ条件で計算したハッシュ値を渡す必要あり
			const dbPlaylog = await Playlog.findById(playlogStart.id);
			dbPlaylog.score = 1000;
			dbPlaylog.cleared = true;
			const reqEnd = httpMocks.createRequest({
				method: 'POST',
				url: '/end',
				body: {
					id: dbPlaylog.id,
					score: dbPlaylog.score,
					cleared: dbPlaylog.cleared,
					hash: dbPlaylog.hash(),
				},
			});
			const resEnd = await testHelper.callRequestHandler(router, reqEnd);

			const playlogEnd = resEnd._getJson();
			assert.strictEqual(playlogEnd.id, dbPlaylog.id);
			assert.strictEqual(playlogEnd.stageId, dbPlaylog.stageId);
			assert.strictEqual(playlogEnd.userId, dbPlaylog.userId);
			assert.strictEqual(playlogEnd.score, dbPlaylog.score);
			assert.strictEqual(playlogEnd.cleared, dbPlaylog.cleared);

			// ステージプレイランキング、スコアランキングに登録されること
			const stagePlayRanking = await new StagePlayRanking().findRankingAsync();
			const rank1 = stagePlayRanking.find((r) => Number(r.member) === dbPlaylog.stageId);
			assert.notStrictEqual(rank1, undefined);
			assert(rank1.score > 0);

			const stageScoreRanking = await new StageScoreRanking(dbPlaylog.stageId).findRankingAsync();
			const rank2 = stageScoreRanking.find((r) => Number(r.member) === 0);
			assert.notStrictEqual(rank2, undefined);
			assert(rank2.score >= dbPlaylog.score);

			// ユーザープレイランキングには登録されないこと
			const userPlayRanking = await new UserPlayRanking().findRankingAsync();
			const rank3 = userPlayRanking.find((r) => Number(r.member) === 0);
			assert.strictEqual(rank3, undefined);
		});

		it('should start & end game with login', async () => {
			const reqStart = await testHelper.createRequestForUser({
				method: 'POST',
				url: '/start',
				body: { stageId: 5 },
			});
			const resStart = await testHelper.callRequestHandler(router, reqStart);

			const playlogStart = resStart._getJson();
			assert.strictEqual(typeof playlogStart.id, 'number');
			assert.strictEqual(playlogStart.stageId, 5);
			assert.strictEqual(playlogStart.userId, 1);
			assert.strictEqual(playlogStart.cleared, false);

			// /endには、プレイログと同じ条件で計算したハッシュ値を渡す必要あり
			const dbPlaylog = await Playlog.findById(playlogStart.id);
			dbPlaylog.score = 1500;
			dbPlaylog.cleared = true;
			const reqEnd = httpMocks.createRequest({
				method: 'POST',
				url: '/end',
				body: {
					id: dbPlaylog.id,
					score: dbPlaylog.score,
					cleared: dbPlaylog.cleared,
					hash: dbPlaylog.hash(),
				},
			});
			const resEnd = await testHelper.callRequestHandler(router, reqEnd);

			const playlogEnd = resEnd._getJson();
			assert.strictEqual(playlogEnd.id, dbPlaylog.id);
			assert.strictEqual(playlogEnd.stageId, dbPlaylog.stageId);
			assert.strictEqual(playlogEnd.userId, dbPlaylog.userId);
			assert.strictEqual(playlogEnd.score, dbPlaylog.score);
			assert.strictEqual(playlogEnd.cleared, dbPlaylog.cleared);

			// ステージプレイランキング、スコアランキング、ユーザープレイランキングに登録されること
			const stagePlayRanking = await new StagePlayRanking().findRankingAsync();
			const rank1 = stagePlayRanking.find((r) => Number(r.member) === dbPlaylog.stageId);
			assert.notStrictEqual(rank1, undefined);
			assert(rank1.score > 0);

			const stageScoreRanking = await new StageScoreRanking(dbPlaylog.stageId).findRankingAsync();
			const rank2 = stageScoreRanking.find((r) => Number(r.member) === dbPlaylog.userId);
			assert.notStrictEqual(rank2, undefined);
			assert(rank2.score >= dbPlaylog.score);

			// ユーザープレイランキングには登録されないこと
			const userPlayRanking = await new UserPlayRanking().findRankingAsync();
			const rank3 = userPlayRanking.find((r) => Number(r.member) === dbPlaylog.userId);
			assert.notStrictEqual(rank3, undefined);
			assert(rank3.score > 0);
		});

		it("should't end game with invalid hash", async () => {
			const reqStart = httpMocks.createRequest({
				method: 'POST',
				url: '/start',
				body: { stageId: 5 },
			});
			const resStart = await testHelper.callRequestHandler(router, reqStart);

			const playlogStart = resStart._getJson();
			assert.strictEqual(typeof playlogStart.id, 'number');
			assert.strictEqual(playlogStart.stageId, 5);
			assert.strictEqual(playlogStart.userId, null);
			assert.strictEqual(playlogStart.cleared, false);

			// ハッシュ値とスコアが一致しない場合、endは実行不可
			const dbPlaylog = await Playlog.findById(playlogStart.id);
			dbPlaylog.score = 1000;
			dbPlaylog.cleared = true;
			const reqEnd = httpMocks.createRequest({
				method: 'POST',
				url: '/end',
				body: {
					id: dbPlaylog.id,
					score: 99999,
					cleared: dbPlaylog.cleared,
					hash: dbPlaylog.hash(),
				},
			});
			try {
				await testHelper.callRequestHandler(router, reqEnd);
				assert.fail('Missing expected exception');
			} catch (err) {
				assert(err instanceof BadRequestError);
				assert(/hash=.+ is not valid/.test(err.message));
			}
		});
	});

	describe('POST /start', () => {
		it('should start private game for owner', async () => {
			const req = await testHelper.createRequestForUser({
				method: 'POST',
				url: '/start',
				body: { stageId: 6 },
			});
			req.user = await User.findById(2);
			const res = await testHelper.callRequestHandler(router, req);

			const playlog = res._getJson();
			assert.strictEqual(typeof playlog.id, 'number');
		});

		it("should't start private game for not owner", async () => {
			const req = await testHelper.createRequestForUser({
				method: 'POST',
				url: '/start',
				body: { stageId: 6 },
			});
			try {
				await testHelper.callRequestHandler(router, req);
				assert.fail('Missing expected exception');
			} catch (err) {
				assert.strictEqual(err.name, 'SequelizeEmptyResultError');
			}
		});
	});

	describe('POST /end', () => {
		it("should't end game with out start game", async () => {
			const req = await testHelper.createRequestForUser({
				method: 'POST',
				url: '/end',
				body: {
					id: 9999,
					score: 1000,
					cleared: true,
					hash: 'cc7e999fbabe24ef92f4e2b0c98c7c22fd7d8eee',
				},
			});
			try {
				await testHelper.callRequestHandler(router, req);
				assert.fail('Missing expected exception');
			} catch (err) {
				assert.strictEqual(err.name, 'SequelizeEmptyResultError');
			}
		});
	});
});