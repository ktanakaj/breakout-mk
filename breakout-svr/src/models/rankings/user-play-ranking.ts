/**
 * ユーザープレイ回数ランキングモデルクラスのNode.jsモジュール。
 * @module ./models/redis/user-play-ranking
 */
import redisHelper from '../../core/redis/redis-helper';
import { SortedSet, Entry } from '../../core/redis/sorted-set';
import objectUtils from '../../core/utils/object-utils';
import User from '../user';
import Playlog from '../playlog';
import { getClient } from './redis';

const BASE_NAME = "userPlayRankings";

export interface RankingEntry extends Entry {
	info?: { userId: number, tried: number, score: number, cleared: number };
}

/**
 * ユーザープレイ回数ランキングコレクションクラス。
 */
export default class UserPlayRanking extends SortedSet {
	/** 年 */
	year: number;
	/** 月 */
	month: number;

	/**
	 * コレクションインスタンスを生成する。
	 * @param year 年。※年間／月間ランキングの場合
	 * @param month 月。※月間ランキングの場合
	 */
	constructor(year: number = null, month: number = null) {
		super(UserPlayRanking.makeKey(year, month), getClient());
		this.year = year;
		this.month = month;
	}

	/**
	 * 年・月からキー用の文字列を生成する。
	 * @param year 年。※年間／月間ランキングの場合
	 * @param month 月。※月間ランキングの場合
	 * @returns キー文字列。
	 */
	static makeKey(year: number = null, month: number = null): string {
		// 累計／年間／月間を引数で振り分け
		const args = [];
		if (year) {
			args.push(year);
		}
		if (month) {
			args.push(month);
		}
		return redisHelper.makeKey(BASE_NAME, ...args);
	}

	/**
	 * データをプレイログから登録する。
	 * @param playlog プレイログ。
	 * @returns 更新結果。
	 */
	static async addByLog(playlog: Playlog): Promise<void> {
		// 未ログインは何もしない
		if (!playlog.userId) {
			return;
		}

		// 累計／年間／月間を一度に登録する
		const date = playlog.createdAt ? new Date(playlog.createdAt) : new Date();
		const multi = getClient().multi();

		const keys = [date.getFullYear(), date.getMonth() + 1];
		for (let i = 0; i < 3; i++) {
			let ranking = new UserPlayRanking(...keys.slice(0, i));
			ranking.multi = multi;
			ranking.increment(String(playlog.userId));
		}
		await multi.execAsync();
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
		const reports = await Playlog.reportByUserIds(rankings.map((r) => Number(r.member)), [String(this.year), String(this.month)]);
		return <RankingEntry[]>objectUtils.mergeArray(rankings, reports, "member", "userId", "info");
	}

	/**
	 * ランキングの全てのRedisキーを取得する。
	 * @returns 検索結果。
	 */
	static async keysAsync(): Promise<string[]> {
		return await getClient().keysAsync(UserPlayRanking.makeKey() + "*");
	}

	/**
	 * ランキングの全ての年月を取得する。
	 * @returns 検索結果。
	 */
	static async yearAndMonthsAsync(): Promise<string[][]> {
		const keys = await UserPlayRanking.keysAsync();
		return redisHelper.keysToYearAndMonths(keys, BASE_NAME);
	}

	/**
	 * 全てのランキングを削除する。
	 * @param multi 参照するmultiインスタンス。
	 * @returns 削除結果。
	 */
	static async clearAll(multi): Promise<void> {
		const keys = await UserPlayRanking.keysAsync();
		keys.forEach((key) => multi.del(key));
	}

	/**
	 * 全ランキングを再作成する。
	 * @returns 総件数。
	 */
	static async rebuildAll(): Promise<number> {
		// 累計と各年／月の集計結果を再作成
		// TODO: 期間は現状適当に3年前までに決め打ち。Playlogから全期間のキーを取れるようにする
		const now = new Date();
		let ranking = new UserPlayRanking();
		let count = await ranking.rebuild();
		for (let y = 0; y < 3; y++) {
			const year = now.getFullYear() - y;
			ranking = new UserPlayRanking(year);
			count += await ranking.rebuild();
			for (let m = 1; m <= 12; m++) {
				ranking = new UserPlayRanking(year, m);
				count += await ranking.rebuild();
			}
		}
		return count;
	}

	/**
	 * ランキングを再作成する。
	 * @returns 総件数。
	 */
	private async rebuild(): Promise<number> {
		// DBから集計後に、Redisを一旦削除して再作成
		// （再作成中の更新分はずれる可能性がある）
		const list = await Playlog.reportByUserIds(null, [this.year, this.month].filter((v) => v).map(String));
		this.clear();
		for (const info of list) {
			this.set(String(info.userId), info.tried);
		}
		this.commit();
		return list.length;
	}
}
