/**
 * ステージコメントモデルクラスモジュール。
 *
 * ブロックくずしのステージに対するコメントを扱う。
 * @module ./models/stage-comment
 */
import { Table, Column, Model, DataType, AllowNull, Unique, CreatedAt, BelongsTo, ForeignKey, Sequelize } from 'sequelize-typescript';
import objectUtils from '../core/utils/object-utils';
import User from './user';
import StageHeader from './stage-header';

/**
 * ステージコメントモデルクラス。
 */
@Table({
	tableName: 'stageComments',
	comment: 'ステージコメント',
	timestamps: true,
	paranoid: true,
	indexes: [{
		fields: ["userId", "createdAt"]
	}, {
		fields: ['headerId', "createdAt"]
	}],
	scopes: {
		withuser: () => {
			return {
				include: [{
					model: User,
					as: 'user',
				}],
			};
		},
	}
})
export default class StageComment extends Model<StageComment> {
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
		defaultValue: 0, // 未認証ユーザーは0
	})
	userId: number;

	/** IPアドレス */
	@AllowNull(false)
	@Column({
		comment: 'IPアドレス',
		defaultValue: 0, // 未認証ユーザーは0
	})
	ipAddress: string;

	/** ステータス */
	@AllowNull(false)
	@Column({
		comment: 'ステータス',
		type: DataType.ENUM,
		values: ['private', 'public'],
		defaultValue: 'public',
	})
	status: string;

	/** ステージコメント */
	@AllowNull(false)
	@Column({
		comment: 'ステージコメント',
		type: DataType.TEXT,
	})
	comment: string;

	/** ユーザー */
	@BelongsTo(() => User)
	user: User;

	/** ステージヘッダー */
	@BelongsTo(() => StageHeader)
	header: StageHeader;

	/**
	 * 渡されたパラメータを更新用に設定する。
	 * @param params 更新用のパラメータ。
	 */
	merge(params: Object): void {
		// createdAtとか上書きされると困るので必要な値だけコピー
		objectUtils.copy(this, params, ["status", "comment"]);
	}

	/**
	 * ステージのコメント数を取得する。
	 * @param headerIds 参照するステージのヘッダーID。配列で複数指定可。未指定時は全て。
	 * @returns 検索結果。
	 */
	static async countByHeaderIds(headerIds: number | number[] = null): Promise<{ headerId: number, cnt: number }[]> {
		let where = {};
		// ステージヘッダーIDが指定された場合、そのステージのみを対象にする
		if (headerIds) {
			where['headerId'] = Array.isArray(headerIds) ? { $in: headerIds } : headerIds;
		}
		return await StageComment.findAll<any>({
			attributes: [
				'headerId', [Sequelize.fn('COUNT', Sequelize.col('id')), 'cnt'],
			],
			where: where,
			group: ["headerId"],
			raw: true
		});
	}
}
