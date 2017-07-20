/**
 * ステージお気に入り数ランキングモデルクラスのNode.jsモジュール。
 * @module ./models/redis/stage-favorite-ranking
 */
import * as Bluebird from 'bluebird';
import redisHelper from '../../core/redis/redis-helper';
import { SortedSet } from '../../core/redis/sorted-set';
import Stage from '../stage';

const BASE_NAME = "stageFavoriteRankings";

/**
 * ステージお気に入り数ランキングコレクションクラス。
 */
class StageFavoriteRanking extends SortedSet {

	/**
	 * コレクションインスタンスを生成する。
	 */
	constructor() {
		super(BASE_NAME);
	}

	/**
	 * ランキングデータを取得する。
	 * @param {number} start 取得開始位置。デフォルトは先頭。
	 * @param {number} end 取得終了位置。デフォルトは末尾。
	 * @returns {Promise.<Array>} 検索結果。スコアの降順。
	 */
	findRankingAsync(start: number, end: number): Bluebird<StageFavoriteRanking[]> {
		return this.entriesAsync(start, end, true)
			.then((rankings) => redisHelper.bulkLoadDbModels(rankings, Stage.scope(["latest", "withuser"]), "stage", "headerId"));
	}
}

module.exports = StageFavoriteRanking;