/**
 * ユーザー作成ステージ評価ランキングランキングモデルクラスのNode.jsモジュール。
 * @module ./models/redis/user-rating-ranking
 */
import * as Bluebird from 'bluebird';
import redisHelper from '../../core/redis/redis-helper';
import { SortedSet } from '../../core/redis/sorted-set';
import objectUtils from '../../core/utils/object-utils';
import { User } from '../user';
import { StageHeader } from '../stage-header';
import { StageRating } from '../stage-rating';

const BASE_NAME = "userRatingRankings";

/**
 * ユーザー作成ステージ評価ランキングランキングコレクションクラス。
 */
class UserRatingRanking extends SortedSet {

	/**
	 * コレクションインスタンスを生成する。
	 */
	constructor() {
		super(BASE_NAME);
	}

	/**
	 * 指定されたユーザーが作成したステージの合計レーティングを再集計する。※要コミット
	 * @param {number} userId ユーザーID。
	 * @returns {Promise} 更新結果。
	 */
	refresh(userId: number): Bluebird<any> {
		return StageRating.averageByUserIds(userId)
			.then(([row]) => this.set(userId, row ? row['rating'] : 0));
	}

	/**
	 * 指定されたユーザーが作成したステージの合計レーティングを再集計する。
	 * @param {number} userId ユーザーID。
	 * @returns {Promise} 更新結果。
	 */
	refreshAsync(userId: number): Bluebird<void> {
		return StageRating.averageByUserIds(userId)
			.then(([row]) => this.setAsync(userId, row ? row['rating'] : 0));
	}

	/**
	 * ランキングデータを取得する。
	 * @param {number} start 取得開始位置。デフォルトは先頭。
	 * @param {number} end 取得終了位置。デフォルトは末尾。
	 * @returns {Promise.<Array>} 検索結果。スコアの降順。
	 */
	findRankingAsync(start: number, end: number): Bluebird<UserRatingRanking> {
		return this.entriesAsync(start, end, true)
			.then((rankings) => {
				if (rankings.length == 0) {
					return rankings;
				}
				return redisHelper.bulkLoadDbModels(rankings, User, "user")
					.then(() => StageHeader.countByUserIds(rankings.map((r) => r.member)))
					.then((reports) => objectUtils.mergeArray(rankings, reports, "member", "userId", "info"));
			});
	}
}

module.exports = UserRatingRanking;