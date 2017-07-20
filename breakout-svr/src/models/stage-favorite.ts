/**
 * ステージお気に入りモデルクラスモジュール。
 *
 * ブロックくずしのステージに対するお気に入りを扱う。
 * @module ./models/stage-favorite
 */
import { Table, Column, Model, DataType, AllowNull, Unique, CreatedAt, Scopes, BelongsTo, ForeignKey, Sequelize } from 'sequelize-typescript';
import * as Bluebird from 'bluebird';
import objectUtils from '../core/utils/object-utils';
import User from './user';
import StageHeader from './stage-header';
import Stage from './stage';
import StageComment from './stage-comment';
import Playlog from './playlog';

/**
 * ステージお気に入りモデルクラス。
 */
@Scopes({
	one: (userId, headerId) => {
		return {
			where: {
				userId: userId,
				headerId: headerId,
			},
		};
	},
	user: (userId) => {
		return {
			where: {
				userId: userId,
			},
		};
	},
	withheader: () => {
		return {
			include: [{
				model: StageHeader,
				as: 'header',
				required: true,
			}],
		};
	},
})
@Table({
	tableName: 'stageFavorites',
	comment: 'ステージお気に入り',
	createdAt: true,
	updatedAt: false,
	indexes: [{
		fields: ["userId", "headerId"],
		unique: true,
	}, {
		fields: ['headerId', "userId"],
	}],
	hooks: {
		/**
		 * ランキングのお気に入り数加算。
		 * @function afterCreate
		 * @param {StageFavorite} favorite 登録されたお気に入り。
		 * @param {Object} options 更新処理のオプション。
		 */
		afterCreate: function (favorite, options) {
			// ※ 外側でredisをrequireすると循環参照で死ぬっぽいのでここでやる
			const redis = require('./redis');
			new redis.StageFavoriteRanking().incrementAsync(favorite.headerId)
				.catch(console.error);
		},
		/**
		 * ランキングのお気に入り数削減。
		 * @function afterDestroy
		 * @param {StageFavorite} favorite 削除されたお気に入り。
		 * @param {Object} options 削除処理のオプション。
		 */
		afterDestroy: function (favorite, options) {
			// ※ 外側でredisをrequireすると循環参照で死ぬっぽいのでここでやる
			const redis = require('./redis');
			new redis.StageFavoriteRanking().incrementAsync(favorite.headerId, -1)
				.catch(console.error);
		},
	},
})
export default class StageFavorite extends Model<StageFavorite> {
	/** ステージヘッダーID */
	@AllowNull(false)
	@ForeignKey(() => StageHeader)
	@Column({
		comment: 'ステージヘッダーID',
		type: DataType.INTEGER,
	})
	headerId: number;

	/** ユーザーID */
	@AllowNull(false)
	@ForeignKey(() => User)
	@Column({
		comment: 'ユーザーID',
		type: DataType.INTEGER,
	})
	userId: number;

	/** ユーザー */
	@BelongsTo(() => User)
	users: User[];

	/** ステージヘッダー */
	@BelongsTo(() => StageHeader)
	header: StageHeader[];

	/**
	 * ステージのお気に入り数を取得する。
	 * @function countByHeaderIds
	 * @param {number|Array} headerIds 参照するステージのヘッダーID。配列で複数指定可。未指定時は全て。
	 * @returns {Promise.<Array>} 検索結果。
	 */
	static countByHeaderIds(headerIds: number | number[] = null): Bluebird<StageFavorite[]> {
		let where = {};
		// ステージヘッダーIDが指定された場合、そのステージのみを対象にする
		if (headerIds) {
			where['headerId'] = Array.isArray(headerIds) ? { $in: headerIds } : headerIds;
		}
		return StageFavorite.scope("withheader").findAll<StageFavorite>({
			attributes: [
				'headerId', [Sequelize.fn('COUNT', Sequelize.col('stageFavorite.id')), 'cnt'],
			],
			where: where,
			group: ["headerId"],
			raw: true
		});
	}

	/**
	 * ユーザーのお気に入りステージ一覧とその関連情報を取得する。
	 * @function findStagesWithAccessibleAllInfo
	 * @param {number} userId アクセス中のユーザーのID。
	 * @returns {Promise.<Array>} 検索結果。
	 */
	static findStagesWithAccessibleAllInfo(userId: number, options: Object = {}): Bluebird<Object[]> {
		let results = [];

		return StageFavorite.scope({ method: ['user', userId] }).findAll<StageFavorite>(options)
			.then((favorites) => {
				if (favorites.length <= 0) return results;

				return Stage.scope(["latest", "withuser"]).findAll<Stage>({ where: { headerId: { in: favorites.map((f) => f.headerId) } } })
					.then((stages) => {
						if (stages.length <= 0) return results;

						// モデルのインスタンスに直接値を詰めるとJSONにしたとき出てこないので、
						// 普通のオブジェクトに詰め替えて返す
						for (let stage of stages) {
							let result = stage.toJSON();
							result.info = {};
							results.push(result);
						}

						// ユーザーのプレイ回数・クリア回数・ハイスコア
						return Playlog.reportForUser(userId, results.map((stage) => stage.id))
							.then((reports) => objectUtils.mergeArray(results, reports, "id", "stageId", "info"))
							// ステージのコメント数
							.then(() => StageComment.countByHeaderIds(stages.map((s) => s.headerId)))
							.then((reports) => objectUtils.mergeArray(results, reports, "headerId", "headerId", "info.comments", "cnt"));
					});
			});
	}
}
