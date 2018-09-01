/**
 * ランキング再生成スクリプト。
 *
 * 例) node ./dist/batch/rebuild-rankings.js
 * @module ./batch/rebuild-rankings
 */
import * as log4js from 'log4js';
import './core';
import StagePlayRanking from '../models/rankings/stage-play-ranking';
import UserPlayRanking from '../models/rankings/user-play-ranking';
import StageScoreRanking from '../models/rankings/stage-score-ranking';
import StageRatingRanking from '../models/rankings/stage-rating-ranking';
import UserRatingRanking from '../models/rankings/user-rating-ranking';
import StageFavoriteRanking from '../models/rankings/stage-favorite-ranking';

const logger = log4js.getLogger('batch');

rebuildRankings().then(() => process.exit(0));

/**
 * 各種ランキングを再生成する。
 * @return 処理状態。
 */
async function rebuildRankings(): Promise<void> {
	let count = await StagePlayRanking.rebuildAll();
	logger.info(`StagePlayRanking : ${count} records were rebuilt.`);

	count = await UserPlayRanking.rebuildAll();
	logger.info(`UserPlayRanking : ${count} records were rebuilt.`);

	count = await StageScoreRanking.rebuildAll();
	logger.info(`StageScoreRanking : ${count} records were rebuilt.`);

	count = await new StageRatingRanking().rebuild();
	logger.info(`StageRatingRanking : ${count} records were rebuilt.`);

	count = await new UserRatingRanking().rebuild();
	logger.info(`UserRatingRanking : ${count} records were rebuilt.`);

	count = await new StageFavoriteRanking().rebuild();
	logger.info(`StageFavoriteRanking : ${count} records were rebuilt.`);
}