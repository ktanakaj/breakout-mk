/**
 * ステージ人気ランキングモデルクラスのNode.jsモジュール。
 * @module ./models/redis/stage-play-ranking
 */
import { IRedisMultiAsync } from '../../core/redis/redis-async-interface';
import redisHelper from '../../core/redis/redis-helper';
import { SortedSet, Entry } from '../../core/redis/sorted-set';
import objectUtils from '../../core/utils/object-utils';
import Stage from '../stage';
import Playlog from '../playlog';
import { getClient } from './redis';

const BASE_NAME = "stagePlayRankings";

export interface RankingEntry extends Entry {
	info?: { stageId: number, tried: number, score: number, cleared: number }[];
}

/**
 * ステージ人気ランキングコレクションクラス。
 */
export default class StagePlayRanking extends SortedSet {
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
		super(StagePlayRanking.makeKey(year, month), getClient());
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
		// 累計／年間／月間を一度に登録する
		const date = playlog.createdAt ? new Date(playlog.createdAt) : new Date();

		const keys = [date.getFullYear(), date.getMonth() + 1];
		const multi = getClient().multi();
		for (let i = 0; i < 3; i++) {
			let ranking = new StagePlayRanking(...keys.slice(0, i));
			ranking.multi = multi;
			ranking.increment(String(playlog.stageId));
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
		await redisHelper.bulkLoadDbModels(rankings, Stage.scope("withuser"), "stage");
		const reports = await Playlog.reportByStageIds(rankings.map((r) => Number(r.member)), [String(this.year), String(this.month)]);
		return <RankingEntry[]>objectUtils.mergeArray(rankings, reports, "member", "stageId", "info");
	}

	/**
	 * ランキングの全てのRedisキーを取得する。
	 * @returns 検索結果。
	 */
	static async keysAsync(): Promise<string[]> {
		return await getClient().keysAsync(StagePlayRanking.makeKey() + "*");
	}

	/**
	 * ランキングの全ての年月を取得する。
	 * @returns 検索結果。
	 */
	static async yearAndMonthsAsync(): Promise<string[][]> {
		const keys = await StagePlayRanking.keysAsync();
		return redisHelper.keysToYearAndMonths(keys, BASE_NAME);
	}

	/**
	 * 全てのランキングを削除する。
	 * @param multi 参照するmultiインスタンス。
	 * @returns 削除結果。
	 */
	static async clearAll(multi: IRedisMultiAsync): Promise<void> {
		const keys = await StagePlayRanking.keysAsync();
		keys.forEach((key) => multi.del(key));
	}

	/**
	 * 全てのランキングから指定されたメンバーを削除する。
	 * @param multi 参照するmultiインスタンス。
	 * @param member 削除するメンバー。
	 * @returns 削除結果。
	 */
	static async deleteAll(multi: IRedisMultiAsync, member: string): Promise<void> {
		const keys = await StagePlayRanking.keysAsync();
		for (let key of keys) {
			multi.zrem(key, [member]);
		}
	}
}
