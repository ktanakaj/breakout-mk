// /**
//  * @file games.jsのテスト。
//  */
// const assert = require('power-assert');
// const httpMocksHelper = require('../../http-mocks-helper');
// const models = require('../../../models');
// const router = require('../../../routes/api/games');
// const User = models.User;
// const StageHeader = models.StageHeader;
// const Stage = models.Stage;

// describe('/api/games', () => {
// 	before(() => {
// 		// sqliteへのテストデータ登録
// 		return models.sequelize.sync({ force: true })
// 			.then(() => User.create({ id: 2, name: "test user", password: "xxxx" }))
// 			.then(() => StageHeader.create({ id: 3, userId: 2 }))
// 			.then(() => Stage.create({ id: 5, headerId: 3, name: "test stage", map: "[R] [G]" }));
// 	});

// 	describe('/start', () => {
// 		it('should start game', (done) => {
// 			const req = httpMocksHelper.createAuthorizedRequestAtUserId2({
// 				method: 'POST',
// 				url: '/start',
// 				body: { stageId: 5 },
// 			});
// 			const res = httpMocksHelper.createResponseForJsonResult(function(playlog) {
// 				assert.strictEqual(playlog.stageId, 5);
// 				assert.strictEqual(playlog.userId, 2);
// 				done();
// 			});
// 			router(req, res, done);
// 		});
// 	});
// });