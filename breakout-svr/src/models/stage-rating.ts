/**
 * ステージ評価モデルクラスモジュール。
 *
 * ブロックくずしのステージに対する評価を扱う。
 * @module ./models/stage-rating
 */
import { Table, Column, Model, DataType, AllowNull, Comment, Min, Max, BelongsTo, ForeignKey, Sequelize } from 'sequelize-typescript';
import { Op } from 'sequelize';
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
				where: { userId, headerId },
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
	@Comment('ステージヘッダーID')
	@AllowNull(false)
	@ForeignKey(() => StageHeader)
	@Column
	headerId: number;

	/** ユーザーID */
	@Comment('ユーザーID')
	@AllowNull(false)
	@ForeignKey(() => User)
	@Column
	userId: number;

	/** レーティング */
	@Comment('レーティング')
	@AllowNull(false)
	@Min(0)
	@Max(5)
	@Column(DataType.INTEGER(2))
	rating: number;

	/** ユーザー */
	@BelongsTo(() => User)
	user: User;

	/** ステージヘッダー */
	@BelongsTo(() => StageHeader)
	header: StageHeader;

	/**
	 * ステージの平均評価を取得する。
	 * @param headerIds 参照するステージのヘッダーID。配列で複数指定可。未指定時は全て。
	 * @returns 検索結果。
	 */
	static async averageByHeaderIds(headerIds: number | number[] = null): Promise<{ headerId: number, rating: number }[]> {
		let where = {};
		// ステージヘッダーIDが指定された場合、そのステージのみを対象にする
		if (headerIds) {
			where['headerId'] = Array.isArray(headerIds) ? { [Op.in]: headerIds } : headerIds;
		}
		// ※ ステージ削除チェックのため、ヘッダーまでJOINする
		return await StageRating.scope("withheader").findAll<any>({
			attributes: [
				'headerId',
				[Sequelize.fn('AVG', Sequelize.col('rating')), 'rating']
			],
			where,
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
			where['userId'] = Array.isArray(userIds) ? { [Op.in]: userIds } : userIds;
		}
		return await StageRating.findAll<any>({
			attributes: [
				'header.userId',
				[Sequelize.fn('AVG', Sequelize.col('rating')), 'rating']
			],
			include: [{
				model: StageHeader,
				as: 'header',
				attributes: [],
				required: true,
				where,
			}],
			group: ["header.userId"],
			raw: true
		});
	}
}
