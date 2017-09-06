/**
 * ステージ評価ランキングモデルクラスのNode.jsモジュール。
 * @module ./models/redis/stage-rating-ranking
 */
import { IRedisMultiAsync } from '../../core/redis/redis-async';
import redisHelper from '../../core/redis/redis-helper';
import { SortedSet, Entry } from '../../core/redis/sorted-set';
import Stage from '../stage';
import StageRating from '../stage-rating';
import redis from './redis';

const BASE_NAME = "stageRatingRankings";

export interface RankingEntry extends Entry {
	stage: Stage[];
}

/**
 * ステージ評価ランキングコレクションクラス。
 */
export default class StageRatingRanking extends SortedSet {
	/**
	 * コレクションインスタンスを生成する。
	 * @param multi 参照するmultiインスタンス。
	 */
	constructor(multi: IRedisMultiAsync = null) {
		super(BASE_NAME, redis.getClient(), multi);
	}

	/**
	 * 指定されたステージの平均レーティングを再集計する。
	 * @param headerId ステージヘッダーID。
	 * @returns 更新結果。
	 */
	async refreshAsync(headerId: number): Promise<any> {
		const [row] = await StageRating.averageByHeaderIds(headerId)
		await this.setAsync(String(headerId), row ? row.rating : 0);
	}

	/**
	 * ランキングデータを取得する。
	 * @param start 取得開始位置。デフォルトは先頭。
	 * @param end 取得終了位置。デフォルトは末尾。
	 * @returns 検索結果。スコアの降順。
	 */
	async findRankingAsync(start: number = undefined, end: number = undefined): Promise<RankingEntry[]> {
		const rankings = await this.entriesAsync(start, end, true)
		return <RankingEntry[]>await redisHelper.bulkLoadDbModels(rankings, Stage.scope(["latest", "withuser"]), "stage", "headerId");
	}
}
