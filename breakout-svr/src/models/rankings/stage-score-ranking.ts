/**
 * ステージ別スコアランキングモデルクラスのNode.jsモジュール。
 * @module ./models/redis/stage-score-ranking
 */
import { IRedisMultiAsync } from '../../core/redis/redis-async-interface';
import redisHelper from '../../core/redis/redis-helper';
import { SortedSet, Entry } from '../../core/redis/sorted-set';
import User from '../user';
import Playlog from '../playlog';
import { getClient } from './redis';

const BASE_NAME = "stageScoreRankings";

export interface RankingEntry extends Entry {
	user: User[];
}

/**
 * ステージ別スコアランキングコレクションクラス。
 */
export default class StageScoreRanking extends SortedSet {
	/** ステージID */
	stageId: number;
	/** 年 */
	year: number;
	/** 月 */
	month: number;

	/**
	 * コレクションインスタンスを生成する。
	 * @param stageId ステージID。
	 * @param year 年。※年間／月間ランキングの場合
	 * @param month 月。※月間ランキングの場合
	 */
	constructor(stageId: number, year: number = null, month: number = null) {
		super(StageScoreRanking.makeKey(stageId, year, month), getClient());
		this.stageId = stageId;
		this.year = year;
		this.month = month;
	}

	/**
	 * ステージID・年・月からキー用の文字列を生成する。
	 * @param stageId ステージID。
	 * @param year 年。※年間／月間ランキングの場合
	 * @param month 月。※月間ランキングの場合
	 * @returns キー文字列。
	 */
	static makeKey(stageId: number, year: number = null, month: number = null): string {
		// 累計／年間／月間を引数で振り分け
		const args: any = [stageId];
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
	static updateByLog(playlog: Playlog): Promise<void> {
		// スコアの入っていないログ（ゲームが終了していないログ）は無視
		if (playlog.score === null) {
			return new Promise((resolve) => resolve());
		}

		// 累計／年間／月間を一度に登録する
		const date = playlog.createdAt ? new Date(playlog.createdAt) : new Date();
		const multi = getClient().multi();

		const keys = [playlog.stageId, date.getFullYear(), date.getMonth() + 1];
		let promises = [];
		for (let i = 1; i <= 3; i++) {
			let ranking = new (<any>StageScoreRanking)(...keys.slice(0, i));
			ranking.multi = multi;
			promises.push(ranking.setIfGreater(playlog.userId || 0, playlog.score));
		}
		return Promise.all(promises)
			.then((results) => {
				return results.some((v) => v) ? multi.execAsync() : null;
			})
			.then(() => { });
	}

	/**
	 * ランキングデータを取得する。
	 * @param start 取得開始位置。デフォルトは先頭。
	 * @param end 取得終了位置。デフォルトは末尾。
	 * @returns 検索結果。スコアの降順。
	 */
	async findRankingAsync(start: number = undefined, end: number = undefined): Promise<RankingEntry[]> {
		const rankings = await this.entriesAsync(start, end, true);
		return <RankingEntry[]>await redisHelper.bulkLoadDbModels(rankings, User, "user");
	}

	/**
	 * ランキングの全てのRedisキーを取得する。
	 * @param stageId ステージID。未指定時は全ステージID。
	 * @returns 検索結果。
	 */
	static async keysAsync(stageId: number | string = "*"): Promise<string[]> {
		let base = StageScoreRanking.makeKey(<any>stageId);
		if (stageId !== "*") {
			// ※ ステージIDの前方一致で他のステージがヒットしてしまうため、
			//   stageScoreRankings:2:* 形式で検索
			//   ただしそれだけだと累計が取れなくなるので、2回実行して混ぜる
			const keys1 = await getClient().keysAsync(base);
			const keys2 = await getClient().keysAsync(redisHelper.makeKey(base, "*"));
			return keys1.concat(keys2);
		} else {
			return await getClient().keysAsync(base);
		}
	}

	/**
	 * ランキングの全ての年月を取得する。
	 * @param stageId ステージID。
	 * @returns 検索結果。
	 */
	static async yearAndMonthsAsync(stageId: number): Promise<string[][]> {
		const keys = await StageScoreRanking.keysAsync(stageId);
		return redisHelper.keysToYearAndMonths(keys, StageScoreRanking.makeKey(stageId));
	}

	/**
	 * 全てのランキングを削除する。
	 * @param multi 参照するmultiインスタンス。
	 * @param stageId ステージID。未指定時は全ステージID。
	 * @returns 削除結果。
	 */
	static async clearAll(multi: IRedisMultiAsync, stageId: number): Promise<void> {
		const keys = await StageScoreRanking.keysAsync(stageId);
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
		let count = await this.rebuildByTerm();
		for (let y = 0; y < 3; y++) {
			const year = now.getFullYear() - y;
			count += await this.rebuildByTerm(year);
			for (let m = 1; m <= 12; m++) {
				count += await this.rebuildByTerm(year, m);
			}
		}
		return count;
	}

	/**
	 * 特定期間のランキングを再作成する。
	 * @returns 総件数。
	 */
	private static async rebuildByTerm(year: number = undefined, month: number = undefined): Promise<number> {
		// DBから集計後に、Redisを一旦削除して再作成
		// （再作成中の更新分はずれる可能性がある）
		// TODO: 未実装。その期間の全ステージ分をまとめて取ってきて一気に登録する
		return 0;
	}
}
