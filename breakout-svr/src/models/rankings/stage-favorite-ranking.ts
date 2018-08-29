/**
 * ステージお気に入り数ランキングモデルクラスのNode.jsモジュール。
 * @module ./models/redis/stage-favorite-ranking
 */
import { IRedisMultiAsync } from '../../core/redis/redis-async-interface';
import redisHelper from '../../core/redis/redis-helper';
import { SortedSet, Entry } from '../../core/redis/sorted-set';
import Stage from '../stage';
import StageFavorite from '../stage-favorite';
import { getClient } from './redis';

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
		super(BASE_NAME, getClient(), multi);
	}

	/**
	 * ランキングデータを取得する。
	 * @param start 取得開始位置。デフォルトは先頭。
	 * @param end 取得終了位置。デフォルトは末尾。
	 * @returns 検索結果。スコアの降順。
	 */
	async findRankingAsync(start: number = undefined, end: number = undefined): Promise<RankingEntry[]> {
		const rankings = await this.entriesAsync(start, end, true);
		return <RankingEntry[]>await redisHelper.bulkLoadDbModels(rankings, Stage.scope(["latest", "withuser"]), "stage", "headerId");
	}

	/**
	 * ランキングを再作成する。
	 * @returns 総件数。
	 */
	async rebuild(): Promise<number> {
		// DBから集計後に、Redisを一旦削除して再作成
		// （再作成中の更新分はずれる可能性がある）
		const list = await StageFavorite.countByHeaderIds();
		this.clear();
		for (const info of list) {
			this.set(String(info.headerId), info.cnt);
		}
		this.commit();
		return list.length;
	}
}