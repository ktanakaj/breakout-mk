/**
 * ステージ評価モデルクラスモジュール。
 *
 * ブロックくずしのステージに対する評価を扱う。
 * @module ./models/stage-rating
 */
import { Table, Column, Model, DataType, AllowNull, Unique, CreatedAt, BelongsTo, ForeignKey, Sequelize } from 'sequelize-typescript';
import objectUtils from '../core/utils/object-utils';
import User from './user';
import StageHeader from './stage-header';

/**
 * ステージ評価モデルクラス。
 */
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
	scopes: {
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
	}
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
	 * @param headerIds 参照するステージのヘッダーID。配列で複数指定可。未指定時は全て。
	 * @returns 検索結果。
	 */
	static async averageByHeaderIds(headerIds: number | number[] = null): Promise<{ headerId: number, rating: number }[]> {
		let where = {};
		// ステージヘッダーIDが指定された場合、そのステージのみを対象にする
		if (headerIds) {
			where['headerId'] = Array.isArray(headerIds) ? { $in: headerIds } : headerIds;
		}
		// ※ ステージ削除チェックのため、ヘッダーまでJOINする
		return await StageRating.scope("withheader").findAll<any>({
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
	 * @param userIds 参照するユーザーID。配列で複数指定可。未指定時は全て。
	 * @returns 検索結果。
	 */
	static async averageByUserIds(userIds: number | number[] = null): Promise<{ userId: number, rating: number }[]> {
		// ※ 評価は公開のステージに対するもののみ計算
		let where = { status: "public" };
		// ユーザーIDが指定された場合、そのユーザーのステージのみを対象にする
		if (userIds) {
			where['userId'] = Array.isArray(userIds) ? { $in: userIds } : userIds;
		}
		return await StageRating.findAll<any>({
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
