/**
 * ステージ評価ランキングモデルクラスのNode.jsモジュール。
 * @module ./models/redis/stage-rating-ranking
 */
import * as Bluebird from 'bluebird';
import redisHelper from '../../core/redis/redis-helper';
import { SortedSet } from '../../core/redis/sorted-set';
import { Stage } from '../stage';
import { StageRating } from '../stage-rating';

const BASE_NAME = "stageRatingRankings";

/**
 * ステージ評価ランキングコレクションクラス。
 */
class StageRatingRanking extends SortedSet {

	/**
	 * コレクションインスタンスを生成する。
	 */
	constructor() {
		super(BASE_NAME);
	}

	/**
	 * 指定されたステージの平均レーティングを再集計する。
	 * @param {number} headerId ステージヘッダーID。
	 * @returns {Promise} 更新結果。
	 */
	refreshAsync(headerId: number): Bluebird<any> {
		return StageRating.averageByHeaderIds(headerId)
			.then(([row]) => this.setAsync(headerId, row ? row['rating'] : 0));
	}

	/**
	 * ランキングデータを取得する。
	 * @param {number} start 取得開始位置。デフォルトは先頭。
	 * @param {number} end 取得終了位置。デフォルトは末尾。
	 * @returns {Promise.<Array>} 検索結果。スコアの降順。
	 */
	findRankingAsync(start: number, end: number): Bluebird<StageRatingRanking[]> {
		return this.entriesAsync(start, end, true)
			.then((rankings) => redisHelper.bulkLoadDbModels(rankings, Stage.scope(["latest", "withuser"]), "stage", "headerId"));
	}
}

module.exports = StageRatingRanking;