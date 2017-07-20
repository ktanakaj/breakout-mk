/**
 * ステージ評価モデルクラスモジュール。
 *
 * ブロックくずしのステージに対する評価を扱う。
 * @module ./models/stage-rating
 */
import { Table, Column, Model, DataType, AllowNull, Unique, CreatedAt, Scopes, BelongsTo, ForeignKey, Sequelize } from 'sequelize-typescript';
import * as Bluebird from 'bluebird';
import objectUtils from '../core/utils/object-utils';
import User from './user';
import StageHeader from './stage-header';

/**
 * ステージ評価モデルクラス。
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
	tableName: 'stageRatings',
	comment: 'ステージ評価',
	timestamps: true,
	indexes: [{
		fields: ["userId", "headerId"],
		unique: true,
	}, {
		fields: ['headerId', "userId"],
	}],
})
export default class StageRating extends Model<StageRating> {
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

	/** レーティング */
	@AllowNull(false)
	@Column({
		comment: 'レーティング',
		type: DataType.INTEGER(2),
		validate: { min: 0, max: 5 },
	})
	rating: number;

	/** ユーザー */
	@BelongsTo(() => User)
	users: User[];

	/** ステージヘッダー */
	@BelongsTo(() => StageHeader)
	header: StageHeader[];

	/**
	 * ステージの平均評価を取得する。
	 * @function averageByHeaderIds
	 * @param {number|Array} headerIds 参照するステージのヘッダーID。配列で複数指定可。未指定時は全て。
	 * @returns {Promise.<Array>} 検索結果。
	 */
	static averageByHeaderIds(headerIds: number | number[] = null): Bluebird<Object[]> {
		let where = {};
		// ステージヘッダーIDが指定された場合、そのステージのみを対象にする
		if (headerIds) {
			where['headerId'] = Array.isArray(headerIds) ? { $in: headerIds } : headerIds;
		}
		// ※ ステージ削除チェックのため、ヘッダーまでJOINする
		return StageRating.scope("withheader").findAll<StageRating>({
			attributes: [
				'headerId', [Sequelize.fn('AVG', Sequelize.col('rating')), 'rating']
			],
			where: where,
			group: ["headerId"],
			raw: true
		});
	}

	/**
	 * ユーザーの平均評価を取得する。
	 * @function averageByUserIds
	 * @param {number|Array} userIds 参照するユーザーID。配列で複数指定可。未指定時は全て。
	 * @returns {Promise.<Array>} 検索結果。
	 */
	static averageByUserIds(userIds: number | number[] = null): Bluebird<Object[]> {
		// ※ 評価は公開のステージに対するもののみ計算
		let where = { status: "public" };
		// ユーザーIDが指定された場合、そのユーザーのステージのみを対象にする
		if (userIds) {
			where['userId'] = Array.isArray(userIds) ? { $in: userIds } : userIds;
		}
		return StageRating.findAll<StageRating>({
			attributes: [
				'header.userId', [Sequelize.fn('AVG', Sequelize.col('rating')), 'rating']
			],
			include: [{
				model: StageHeader,
				as: 'header',
				attributes: [],
				required: true,
				where: where,
			}],
			group: ["header.userId"],
			raw: true
		});
	}
}
