/**
 * ステージお気に入り数ランキングモデルクラスのNode.jsモジュール。
 * @module ./models/redis/stage-favorite-ranking
 */
import { IRedisMultiAsync } from '../../core/redis/redis-async';
import redisHelper from '../../core/redis/redis-helper';
import { SortedSet, Entry } from '../../core/redis/sorted-set';
import Stage from '../stage';
import redis from './redis';

const BASE_NAME = "stageFavoriteRankings";

export interface RankingEntry extends Entry {
	stage: Stage[];
}

/**
 * ステージお気に入り数ランキングコレクションクラス。
 */
export default class StageFavoriteRanking extends SortedSet {
	/**
	 * コレクションインスタンスを生成する。
	 * @param multi 参照するmultiインスタンス。
	 */
	constructor(multi: IRedisMultiAsync = null) {
		super(BASE_NAME, redis.getClient(), multi);
	}

	/**
	 * ランキングデータを取得する。
	 * @param {number} start 取得開始位置。デフォルトは先頭。
	 * @param {number} end 取得終了位置。デフォルトは末尾。
	 * @returns {Promise.<Array>} 検索結果。スコアの降順。
	 */
	async findRankingAsync(start: number = undefined, end: number = undefined): Promise<RankingEntry[]> {
		const rankings = await this.entriesAsync(start, end, true);
		return <RankingEntry[]>await redisHelper.bulkLoadDbModels(rankings, Stage.scope(["latest", "withuser"]), "stage", "headerId");
	}
}