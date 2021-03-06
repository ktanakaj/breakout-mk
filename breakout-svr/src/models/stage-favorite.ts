/**
 * ステージお気に入りモデルクラスモジュール。
 *
 * ブロックくずしのステージに対するお気に入りを扱う。
 * @module ./models/stage-favorite
 */
import { Table, Column, Model, AllowNull, Comment, BelongsTo, ForeignKey, AfterCreate, AfterDestroy, Sequelize, IFindOptions } from 'sequelize-typescript';
import { Op } from 'sequelize';
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
				where: { userId, headerId },
			};
		},
		user: (userId) => {
			return {
				where: { userId },
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

	/** ユーザー */
	@BelongsTo(() => User)
	user: User;

	/** ステージヘッダー */
	@BelongsTo(() => StageHeader)
	header: StageHeader;

	/**
	 * ランキングのお気に入り数加算。
	 * @param favorite 登録されたお気に入り。
	 * @returns 処理状態。
	 */
	@AfterCreate
	static async incrementRanking(favorite: StageFavorite): Promise<void> {
		await new StageFavoriteRanking().incrementAsync(String(favorite.headerId));
	}

	/**
	 * ランキングのお気に入り数削減。
	 * @param favorite 削除されたお気に入り。
	 * @returns 処理状態。
	 */
	@AfterDestroy
	static async decrementRanking(favorite: StageFavorite): Promise<void> {
		await new StageFavoriteRanking().incrementAsync(String(favorite.headerId), -1);
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
			where['headerId'] = Array.isArray(headerIds) ? { [Op.in]: headerIds } : headerIds;
		}
		return await StageFavorite.scope("withheader").findAll<any>({
			attributes: [
				'headerId',
				[Sequelize.fn('COUNT', Sequelize.col('StageFavorite.id')), 'cnt'],
			],
			where,
			group: ["headerId"],
			raw: true
		});
	}

	/**
	 * ユーザーのお気に入りステージ一覧とその関連情報を取得する。
	 * @param userId アクセス中のユーザーのID。
	 * @param options 検索条件。
	 * @returns 検索結果。
	 */
	// TODO: 戻り値の型修正（実際にはStageインスタンスじゃない, infoの中身も明記する）
	static async findStagesWithAccessibleAllInfo(userId: number, options?: IFindOptions<StageFavorite>): Promise<(Stage & { info: {} })[]> {
		let results = [];

		const favorites = await StageFavorite.scope({ method: ['user', userId] }).findAll(options);
		if (favorites.length <= 0) return results;

		const stages = await Stage.scope(["latest", "withuser"]).findAll({ where: { headerId: { [Op.in]: favorites.map((f) => f.headerId) } } });
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
