/**
 * プレイログモデルモジュール。
 *
 * ゲームの各ステージのプレイログ1件に対応する。
 * @module ./models/playlog
 */
import { Table, Column, Model, DataType, AllowNull, ForeignKey, BelongsTo, BeforeValidate, AfterCreate, AfterUpdate, Sequelize } from 'sequelize-typescript';
import * as crypto from 'crypto';
import * as config from 'config';
import objectUtils from '../core/utils/object-utils';
import StagePlayRanking from './rankings/stage-play-ranking';
import StageScoreRanking from './rankings/stage-score-ranking';
import UserPlayRanking from './rankings/user-play-ranking';
import User from './user';
import StageHeader from './stage-header';
import Stage from './stage';

/**
 * プレイログモデル。
 */
@Table({
	tableName: 'playlogs',
	comment: 'プレイログ',
	timestamps: true,
	indexes: [{
		fields: ['stageId', { attribute: 'createdAt', order: 'DESC', length: null, collate: null }]
	}, {
		fields: ['userId', { attribute: 'createdAt', order: 'DESC', length: null, collate: null }]
	}, {
		fields: ['stageId', 'userId']
	}],
	scopes: {
		playing: {
			where: {
				score: { $eq: null },
			},
		},
		user: (userId) => {
			return {
				where: {
					userId: userId,
				},
				order: [
					['createdAt', 'DESC']
				],
			};
		},
		withstage: () => {
			// ※ ログとの結合ということで、削除済みのステージも取っているので注意
			return {
				include: [{
					model: Stage,
					as: 'stage',
					required: true,
					include: [{
						model: StageHeader,
						as: 'header',
						required: true,
						paranoid: false,
					}],
				}],
			};
		},
	}
})
export default class Playlog extends Model<Playlog> {
	/** ステージID */
	@AllowNull(false)
	@ForeignKey(() => Stage)
	@Column({
		comment: 'ステージID',
		type: DataType.INTEGER,
	})
	stageId: number;

	/** ユーザーID */
	// 未認証ユーザーはnull
	@ForeignKey(() => User)
	@Column({
		comment: 'ユーザーID',
		type: DataType.INTEGER,
	})
	userId: number;

	/** 獲得スコア */
	@Column({
		comment: '獲得スコア',
		type: DataType.INTEGER,
	})
	score: number;

	/** クリアしたか？ */
	@AllowNull(false)
	@Column({
		comment: 'クリアしたか？',
		type: DataType.BOOLEAN,
		defaultValue: false,
	})
	cleared: boolean;

	// ※ createdAt,updatedAtは桁数を指定するため明示的に指定
	/** 作成日時 */
	@AllowNull(false)
	@Column({
		comment: '作成日時',
		type: DataType.DATE(3),
	})
	createdAt: Date;

	/** 更新日時 */
	@AllowNull(false)
	@Column({
		comment: '更新日時',
		type: DataType.DATE(3),
	})
	updatedAt: Date;

	/** ユーザー */
	@BelongsTo(() => User)
	user: User;

	/** ステージ */
	@BelongsTo(() => Stage)
	stage: Stage;

	/**
	 * ランキングへの登録。
	 * @param playlog 登録されたプレイログ。
	 * @param options 登録処理のオプション。
	 */
	@AfterCreate
	static addRanking(playlog: Playlog, options: {}): void {
		StagePlayRanking.addByLog(playlog)
			.then(() => UserPlayRanking.addByLog(playlog))
			.catch(console.error);
	}

	/**
	 * スコアランキングの更新。
	 * @param playlog 更新されたプレイログ。
	 * @param options 更新処理のオプション。
	 */
	@AfterUpdate
	static updateRanking(playlog: Playlog, options: {}): void {
		// スコアが設定された場合、ランキングを更新
		if (playlog.score !== undefined && playlog.score !== playlog.previous("score")) {
			StageScoreRanking.updateByLog(playlog)
				.catch(console.error);
		}
	}

	/**
	 * 渡されたパラメータを更新用に設定する。
	 * @param params 更新用のパラメータ。
	 */
	merge(params: Object): void {
		// createdAtとか上書きされると困るので必要な値だけコピー
		objectUtils.copy(this, params, ["score", "cleared"]);
	}

	/**
	 * 各値から整合性チェック用のハッシュを計算する。
	 * @returns 計算したハッシュ値。
	 */
	hash(): string {
		const hashGenerator = crypto.createHash(config['game']['validation']['algorithm']);
		hashGenerator.update(config['game']['validation']['secret']);
		hashGenerator.update(String(this.id));
		hashGenerator.update(String(this.stageId));
		// ユーザーID=nullは0で代用
		hashGenerator.update(String(this.userId || 0));
		hashGenerator.update(String(this.score));
		hashGenerator.update(String(this.cleared));
		// 更新時刻も入れることで、再送信を防ぐ
		hashGenerator.update(this.createdAt.toISOString());
		hashGenerator.update(this.updatedAt.toISOString());
		return hashGenerator.digest('hex');
	}

	/**
	 * ステージの統計情報を取得する。
	 * @param stageIds 参照するステージのID。配列で複数指定可。未指定時は全て。
	 * @param date 取得する期間。"年" または "年/月" の形式か、年,月の配列。
	 * @returns 検索結果。
	 */
	static async reportByStageIds(stageIds: number | number[] = null, date: string | string[] = null): Promise<{ stageId: number, tried: number, score: number, cleared: number }[]> {
		let where = {};
		// ステージIDが指定された場合、そのステージのみを対象にする
		if (stageIds) {
			where['stageId'] = Array.isArray(stageIds) ? { $in: stageIds } : stageIds;
		}
		// 期間が指定された場合、その期間のみを対象にする
		let between = makeStartAndEndDate(date);
		if (between.length === 2) {
			where['createdAt'] = { $between: between };
		}
		return await Playlog.findAll<any>({
			attributes: [
				'stageId', [Sequelize.fn('COUNT', Sequelize.col('id')), 'tried'],
				[Sequelize.fn('MAX', Sequelize.col('score')), 'score'],
				[Sequelize.fn('SUM', Sequelize.col('cleared')), 'cleared'],
			],
			where: where,
			group: ["stageId"],
			raw: true
		});
	}

	/**
	 * ユーザーの統計情報を取得する。
	 * @param userIds 参照するユーザーのID。配列で複数指定可。未指定時は全て。
	 * @param date 取得する期間。"年" または "年/月" の形式か、年,月の配列。
	 * @returns 検索結果。
	 */
	static async reportByUserIds(userIds: number | number[] = null, date: string | string[] = null): Promise<{ userId: number, tried: number, score: number, cleared: number }[]> {
		let where = {};
		// ユーザーIDが指定された場合、そのステージのみを対象にする
		if (userIds) {
			where['userId'] = Array.isArray(userIds) ? { $in: userIds } : userIds;
		}
		// 期間が指定された場合、その期間のみを対象にする
		let between = makeStartAndEndDate(date);
		if (between.length === 2) {
			where['createdAt'] = { $between: between };
		}
		return await Playlog.findAll<any>({
			attributes: [
				'userId', [Sequelize.fn('COUNT', Sequelize.col('id')), 'tried'],
				[Sequelize.fn('MAX', Sequelize.col('score')), 'score'],
				[Sequelize.fn('SUM', Sequelize.col('cleared')), 'cleared'],
			],
			where: where,
			group: ["userId"],
			raw: true
		});
	}

	/**
	 * ユーザーのステージに関する統計情報を取得する。
	 * @param userId ユーザーID。
	 * @param stageIds 参照するステージのID。配列で複数指定可。
	 * @returns 検索結果。
	 */
	static async reportForUser(userId: number, stageIds: number | number[]): Promise<{ stageId: number, tried: number, score: number, cleared: number }[]> {
		let where = { stageId: stageIds, userId: userId };
		if (Array.isArray(stageIds)) {
			where['stageId'] = <any>{ $in: stageIds };
		}
		return await Playlog.findAll<any>({
			attributes: [
				'stageId', [Sequelize.fn('COUNT', Sequelize.col('id')), 'tried'],
				[Sequelize.fn('MAX', Sequelize.col('score')), 'score'],
				[Sequelize.fn('SUM', Sequelize.col('cleared')), 'cleared'],
			],
			where: where,
			group: ["stageId"],
			raw: true
		});
	}
}

/**
 * 期間を示す文字列から、期間の開始・終了の日時を生成する。
 * @param date 期間。"年" または "年/月" の形式か、年,月の配列。
 * @returns [開始, 終了] の配列。条件なしの場合空。
 */
function makeStartAndEndDate(date: string | string[]): Date[] {
	if (!date) {
		return [];
	}
	if (!Array.isArray(date)) {
		date = date.split("/");
	}
	if (!date[0]) {
		return [];
	}
	// 年間または月間で絞り込み
	if (!date[1]) {
		return [new Date(Number(date[0]), 0), new Date(Number(date[0]) + 1, 0)];
	} else {
		return [new Date(Number(date[0]), Number(date[1]) - 1), new Date(Number(date[0]), Number(date[1]))];
	}
}
