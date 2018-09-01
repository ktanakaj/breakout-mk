/**
 * @file rebuild-rankings.tsのテスト。
 */
import * as assert from 'power-assert';
import * as child_process from 'child_process';
import StageHeader from '../../src/models/stage-header';
import Stage from '../../src/models/stage';
import StageRating from '../../src/models/stage-rating';
import StageFavorite from '../../src/models/stage-favorite';

describe('rebuild-rankings.ts', function () {
	// ※ バッチは普通に実行するとexitして終了してしまうので、
	//    別プロセスで実行して、その戻り値やコンソール出力をチェックする。
	//    （mocha内で動かないため、事前にコンパイルが必須なので注意。）
	this.timeout(10000);

	before(async () => {
		// sqliteへのテストデータ登録
		await StageHeader.create({ id: 20, userId: 1, status: 'public' });
		await Stage.create({ id: 25, headerId: 20, name: "public stage", map: "[R] [G]" });
		await StageRating.create({ headerId: 20, userId: 2, rating: 4 });
		await StageFavorite.create({ headerId: 20, userId: 2 });
	});

	it('バッチ実行', async () => {
		const logs = child_process.execSync('node ./dist/batch/rebuild-rankings.js', { encoding: 'utf8' });
		assert(/StagePlayRanking : [0-9]+ records were rebuilt./m.test(logs));
		assert(/UserPlayRanking : [0-9]+ records were rebuilt./m.test(logs));
		assert(/StageScoreRanking : [0-9]+ records were rebuilt./m.test(logs));
		assert(/StageRatingRanking : [0-9]+ records were rebuilt./m.test(logs));
		assert(/UserRatingRanking : [0-9]+ records were rebuilt./m.test(logs));
		assert(/StageFavoriteRanking : [0-9]+ records were rebuilt./m.test(logs));
	});
});