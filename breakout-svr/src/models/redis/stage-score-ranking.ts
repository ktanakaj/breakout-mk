/**
 * ステージ別スコアランキングモデルクラスのNode.jsモジュール。
 * @module ./models/redis/stage-score-ranking
 */
import redisHelper from '../../core/redis/redis-helper';
import { SortedSet } from '../../core/redis/sorted-set';
import User from '../user';

const BASE_NAME = "stageScoreRankings";

/**
 * ステージ別スコアランキングコレクションクラス。
 */
class StageScoreRanking extends SortedSet {
	/** ステージID */
	stageId: number;
	/** 年 */
	year: number;
	/** 月 */
	month: number;

	/**
	 * コレクションインスタンスを生成する。
	 * @param {number} stageId ステージID。
	 * @param {number} year 年。※年間／月間ランキングの場合
	 * @param {number} month 月。※月間ランキングの場合
	 */
	constructor(stageId, year = null, month = null) {
		super(StageScoreRanking.makeKey(stageId, year, month));
		this.stageId = stageId;
		this.year = year;
		this.month = month;
	}

	/**
	 * ステージID・年・月からキー用の文字列を生成する。
	 * @param {number} stageId ステージID。
	 * @param {number} year 年。※年間／月間ランキングの場合
	 * @param {number} month 月。※月間ランキングの場合
	 * @returns {string} キー文字列。
	 */
	static makeKey(stageId: number, year: number = null, month: number = null): string {
		// 累計／年間／月間を引数で振り分け
		const args = [BASE_NAME, stageId];
		if (year) {
			args.push(year);
		}
		if (month) {
			args.push(month);
		}
		return (<any>redisHelper).makeKey(...args);
	}

	/**
	 * データをプレイログから登録する。
	 * @param {Playlog} playlog プレイログ。
	 * @returns {Promise} 更新結果。
	 */
	static updateByLog(playlog) {
		// スコアの入っていないログ（ゲームが終了していないログ）は無視
		if (playlog.score === null) {
			return new Promise((resolve) => resolve());
		}

		// 累計／年間／月間を一度に登録する
		const date = playlog.createdAt ? new Date(playlog.createdAt) : new Date();
		const multi = redisHelper.client.multi();

		const keys = [playlog.stageId, date.getFullYear(), date.getMonth() + 1];
		let promises = [];
		for (let i = 1; i <= 3; i++) {
			let ranking = new (<any>StageScoreRanking)(...keys.slice(0, i));
			ranking.multi = multi;
			promises.push(ranking.setIfGreater(playlog.userId, playlog.score));
		}
		return Promise.all(promises)
			.then((results) => {
				return results.some((v) => v) ? (<any>multi).execAsync() : null;
			});
	}

	/**
	 * ランキングデータを取得する。
	 * @param {number} start 取得開始位置。デフォルトは先頭。
	 * @param {number} end 取得終了位置。デフォルトは末尾。
	 * @returns {Promise.<Array>} 検索結果。スコアの降順。
	 */
	findRankingAsync(start, end) {
		return this.entriesAsync(start, end, true)
			.then((rankings) => redisHelper.bulkLoadDbModels(rankings, User, "user"));
	}

	/**
	 * ランキングの全てのRedisキーを取得する。
	 * @param {number} stageId ステージID。未指定時は全ステージID。
	 * @returns {Promise.<Array>} 検索結果。
	 */
	static keysAsync(stageId = "*") {
		let base = StageScoreRanking.makeKey(<any>stageId);
		if (stageId != "*") {
			// ※ ステージIDの前方一致で他のステージがヒットしてしまうため、
			//   stageScoreRankings:2:* 形式で検索
			//   ただしそれだけだと累計が取れなくなるので、2回実行して混ぜる
			return (<any>redisHelper.client).keysAsync(base)
				.then((keys1) => {
					return (<any>redisHelper.client).keysAsync(redisHelper.makeKey(base, "*"))
						.then((keys2) => keys1.concat(keys2));
				});
		} else {
			return (<any>redisHelper.client).keysAsync(base);
		}
	}

	/**
	 * ランキングの全ての年月を取得する。
	 * @param {number} stageId ステージID。
	 * @returns {Promise.<Array>} 検索結果。
	 */
	static yearAndMonthsAsync(stageId) {
		return StageScoreRanking.keysAsync(stageId)
			.then((keys) => redisHelper.keysToYearAndMonths(keys, StageScoreRanking.makeKey(stageId)));
	}

	/**
	 * 全てのランキングを削除する。
	 * @param {Object} multi 参照するmultiインスタンス。
	 * @param {number} stageId ステージID。未指定時は全ステージID。
	 * @returns {Promise} 削除結果。
	 */
	static clearAll(multi, stageId) {
		return StageScoreRanking.keysAsync(stageId)
			.then((keys) => keys.forEach((key) => multi.del(key)));
	}
}

module.exports = StageScoreRanking;