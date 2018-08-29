/**
 * ランキング再生成スクリプト。
 *
 * 例) node ./dist/batch/rebuild-rankings.js
 * @module ./batch/rebuild-rankings
 */
import * as log4js from 'log4js';
import './core';
import StageFavoriteRanking from '../models/rankings/stage-favorite-ranking';

const logger = log4js.getLogger('batch');

rebuildRankings().then(() => process.exit(0));

/**
 * 各種ランキングを再生成する。
 * @return 処理状態。
 */
async function rebuildRankings(): Promise<void> {
	// TODO: 全種類には未対応。追加する
	const count = await new StageFavoriteRanking().rebuild();
	logger.info(`StageFavoriteRanking : ${count} records were rebuilt.`);
}