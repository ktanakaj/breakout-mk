/**
 * ステージ人気ランキングモデルクラスのNode.jsモジュール。
 * @module ./models/redis/stage-play-ranking
 */
import redisHelper from '../../core/redis/redis-helper';
import { SortedSet } from '../../core/redis/sorted-set';
import objectUtils from '../../core/utils/object-utils';
import Stage from '../stage';
import Playlog from '../playlog';

const BASE_NAME = "stagePlayRankings";

/**
 * ステージ人気ランキングコレクションクラス。
 */
class StagePlayRanking extends SortedSet {
	/** 年 */
	year: number;
	/** 月 */
	month: number;

	/**
	 * コレクションインスタンスを生成する。
	 * @param {number} year 年。※年間／月間ランキングの場合
	 * @param {number} month 月。※月間ランキングの場合
	 */
	constructor(year = null, month = null) {
		super(StagePlayRanking.makeKey(year, month));
		this.year = year;
		this.month = month;
	}

	/**
	 * 年・月からキー用の文字列を生成する。
	 * @param {number} year 年。※年間／月間ランキングの場合
	 * @param {number} month 月。※月間ランキングの場合
	 * @returns {string} キー文字列。
	 */
	static makeKey(year = null, month = null) {
		// 累計／年間／月間を引数で振り分け
		const args = [BASE_NAME];
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
	static addByLog(playlog) {
		// 累計／年間／月間を一度に登録する
		const date = playlog.createdAt ? new Date(playlog.createdAt) : new Date();

		const keys = [date.getFullYear(), date.getMonth() + 1];
		const multi = redisHelper.client.multi();
		for (let i = 0; i < 3; i++) {
			let ranking = new StagePlayRanking(...keys.slice(0, i));
			ranking.multi = multi;
			ranking.increment(playlog.stageId);
		}
		return (<any>multi).execAsync();
	}

	/**
	 * ランキングデータを取得する。
	 * @param {number} start 取得開始位置。デフォルトは先頭。
	 * @param {number} end 取得終了位置。デフォルトは末尾。
	 * @returns {Promise.<Array>} 検索結果。スコアの降順。
	 */
	findRankingAsync(start, end) {
		return this.entriesAsync(start, end, true)
			.then((rankings) => {
				if (rankings.length == 0) {
					return rankings;
				}
				return redisHelper.bulkLoadDbModels(rankings, Stage.scope("withuser"), "stage")
					.then(() => Playlog.reportByStageIds(rankings.map((r) => r.member), [String(this.year), String(this.month)]))
					.then((reports) => objectUtils.mergeArray(rankings, reports, "member", "stageId", "info"));
			});
	}

	/**
	 * ランキングの全てのRedisキーを取得する。
	 * @returns {Promise.<Array>} 検索結果。
	 */
	static keysAsync() {
		return (<any>redisHelper.client).keysAsync(StagePlayRanking.makeKey() + "*");
	}

	/**
	 * ランキングの全ての年月を取得する。
	 * @returns {Promise.<Array>} 検索結果。
	 */
	static yearAndMonthsAsync() {
		return StagePlayRanking.keysAsync()
			.then((keys) => redisHelper.keysToYearAndMonths(keys, BASE_NAME));
	}

	/**
	 * 全てのランキングを削除する。
	 * @param {Object} multi 参照するmultiインスタンス。
	 * @returns {Promise} 削除結果。
	 */
	static clearAll(multi) {
		return StagePlayRanking.keysAsync()
			.then((keys) => keys.forEach((key) => multi.del(key)));
	}

	/**
	 * 全てのランキングから指定されたメンバーを削除する。
	 * @param {Object} multi 参照するmultiインスタンス。
	 * @params {string} member 削除するメンバー。
	 * @returns {Promise} 削除結果。
	 */
	static deleteAll(multi, member) {
		return StagePlayRanking.keysAsync()
			.then((keys) => {
				for (let key of keys) {
					multi.zrem(key, [member]);
				}
			});
	}
}

module.exports = StagePlayRanking;