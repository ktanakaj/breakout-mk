/**
 * ステージお気に入りモデルクラスモジュール。
 *
 * ブロックくずしのステージに対するお気に入りを扱う。
 * @module ./models/stage-favorite
 */
import { Table, Column, Model, DataType, AllowNull, BelongsTo, ForeignKey, AfterCreate, AfterDestroy, Sequelize } from 'sequelize-typescript';
import objectUtils from '../core/utils/object-utils';
import StageFavoriteRanking from './rankings/stage-favorite-ranking';
import User from './user';
import StageHeader from './stage-header';
import Stage from './stage';
import StageComment from './stage-comment';
import Playlog from './playlog';

/**
 * ステージお気に入りモデルクラス。
 */
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
	scopes: {
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
	}
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
	user: User;

	/** ステージヘッダー */
	@BelongsTo(() => StageHeader)
	header: StageHeader;

	/**
	 * ランキングのお気に入り数加算。
	 * @param favorite 登録されたお気に入り。
	 * @param options 更新処理のオプション。
	 */
	@AfterCreate
	static incrementRanking(favorite: StageFavorite, options: {}): void {
		new StageFavoriteRanking().incrementAsync(String(favorite.headerId))
			.catch(console.error);
	}

	/**
	 * ランキングのお気に入り数削減。
	 * @param favorite 削除されたお気に入り。
	 * @param options 削除処理のオプション。
	 */
	@AfterDestroy
	static decrementRanking(favorite: StageFavorite, options: {}): void {
		new StageFavoriteRanking().incrementAsync(String(favorite.headerId), -1)
			.catch(console.error);
	}

	/**
	 * ステージのお気に入り数を取得する。
	 * @param headerIds 参照するステージのヘッダーID。配列で複数指定可。未指定時は全て。
	 * @returns 検索結果。
	 */
	static async countByHeaderIds(headerIds: number | number[] = null): Promise<{ headerId: number, cnt: number }[]> {
		let where = {};
		// ステージヘッダーIDが指定された場合、そのステージのみを対象にする
		if (headerIds) {
			where['headerId'] = Array.isArray(headerIds) ? { $in: headerIds } : headerIds;
		}
		return await StageFavorite.scope("withheader").findAll<any>({
			attributes: [
				'headerId', [Sequelize.fn('COUNT', Sequelize.col('StageFavorite.id')), 'cnt'],
			],
			where: where,
			group: ["headerId"],
			raw: true
		});
	}

	/**
	 * ユーザーのお気に入りステージ一覧とその関連情報を取得する。
	 * @param userId アクセス中のユーザーのID。
	 * @returns 検索結果。
	 */
	// TODO: 戻り値の型修正
	static async findStagesWithAccessibleAllInfo(userId: number, options: {} = {}): Promise<Stage[]> {
		let results = [];

		const favorites = await StageFavorite.scope({ method: ['user', userId] }).findAll<StageFavorite>(options);
		if (favorites.length <= 0) return results;

		const stages = await Stage.scope(["latest", "withuser"]).findAll<Stage>({ where: { headerId: { $in: favorites.map((f) => f.headerId) } } });
		if (stages.length <= 0) return results;

		// モデルのインスタンスに直接値を詰めるとJSONにしたとき出てこないので、
		// 普通のオブジェクトに詰め替えて返す
		for (let stage of stages) {
			let result = stage.toJSON();
			result.info = {};
			results.push(result);
		}

		// ユーザーのプレイ回数・クリア回数・ハイスコア
		const reports = await Playlog.reportForUser(userId, results.map((stage) => stage.id));
		objectUtils.mergeArray(results, reports, "id", "stageId", "info");

		// ステージのコメント数
		const reports2 = await StageComment.countByHeaderIds(stages.map((s) => s.headerId));
		objectUtils.mergeArray(results, reports2, "headerId", "headerId", "info.comments", "cnt");

		return results;
	}
}
