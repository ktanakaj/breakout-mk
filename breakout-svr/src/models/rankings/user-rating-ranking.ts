/**
 * ユーザー作成ステージ評価ランキングランキングモデルクラスのNode.jsモジュール。
 * @module ./models/redis/user-rating-ranking
 */
import { IRedisMultiAsync } from '../../core/redis/redis-async-interface';
import redisHelper from '../../core/redis/redis-helper';
import { SortedSet, Entry } from '../../core/redis/sorted-set';
import objectUtils from '../../core/utils/object-utils';
import User from '../user';
import StageHeader from '../stage-header';
import StageRating from '../stage-rating';
import { getClient } from './redis';

const BASE_NAME = "userRatingRankings";

export interface RankingEntry extends Entry {
	info?: { userId: number, created: number }[];
}

/**
 * ユーザー作成ステージ評価ランキングランキングコレクションクラス。
 */
export default class UserRatingRanking extends SortedSet {
	/**
	 * コレクションインスタンスを生成する。
	 * @param multi 参照するmultiインスタンス。
	 */
	constructor(multi: IRedisMultiAsync = null) {
		super(BASE_NAME, getClient(), multi);
	}

	/**
	 * 指定されたユーザーが作成したステージの合計レーティングを再集計する。※要コミット
	 * @param userId ユーザーID。
	 * @returns 処理状態。
	 */
	async refresh(userId: number): Promise<void> {
		const [row] = await StageRating.averageByUserIds(userId);
		this.set(String(userId), row ? row.rating : 0);
	}

	/**
	 * 指定されたユーザーが作成したステージの合計レーティングを再集計する。
	 * @param userId ユーザーID。
	 * @returns 処理状態。
	 */
	async refreshAsync(userId: number): Promise<void> {
		const [row] = await StageRating.averageByUserIds(userId);
		this.setAsync(String(userId), row ? row.rating : 0);
	}

	/**
	 * ランキングデータを取得する。
	 * @param start 取得開始位置。デフォルトは先頭。
	 * @param end 取得終了位置。デフォルトは末尾。
	 * @returns 検索結果。スコアの降順。
	 */
	async findRankingAsync(start: number = undefined, end: number = undefined): Promise<RankingEntry[]> {
		const rankings = await this.entriesAsync(start, end, true);
		if (rankings.length === 0) {
			return rankings;
		}
		await redisHelper.bulkLoadDbModels(rankings, User, "user");
		const reports = await StageHeader.countByUserIds(rankings.map((r) => Number(r.member)));
		return <RankingEntry[]>objectUtils.mergeArray(rankings, reports, "member", "userId", "info");
	}

	/**
	 * ランキングを再作成する。
	 * @returns 総件数。
	 */
	async rebuild(): Promise<number> {
		// DBから集計後に、Redisを一旦削除して再作成
		// （再作成中の更新分はずれる可能性がある）
		const list = await StageRating.averageByUserIds();
		this.clear();
		for (const info of list) {
			this.set(String(info.userId), info.rating);
		}
		this.commit();
		return list.length;
	}
}
