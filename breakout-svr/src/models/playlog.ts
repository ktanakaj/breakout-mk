/**
 * プレイログモデルモジュール。
 *
 * ゲームの各ステージのプレイログ1件に対応する。
 * @module ./models/playlog
 */
import { Table, Column, Model, DataType, AllowNull, Unique, CreatedAt, ForeignKey, BelongsTo, Sequelize } from 'sequelize-typescript';
import * as crypto from 'crypto';
import * as config from 'config';
import objectUtils from '../core/utils/object-utils';
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
	hooks: {
		/**
		 * 型を合わせる。
		 * @param playlog バリデーションされるプレイログ。
		 * @param options バリデーション処理のオプション。
		 */
		beforeValidate: function (playlog: Playlog, options: {}): void {
			// clearedに文字列が入ってきた場合booleanに変換
			// （sequelizeがそのまま渡してしまい、MySQLが暗黙の型変換で失敗するため）
			if (playlog.cleared !== undefined && playlog.cleared !== null) {
				playlog.cleared = playlog.isClear();
			}
		},
		/**
		 * ランキングへの登録。
		 * @param playlog 登録されたプレイログ。
		 * @param options 登録処理のオプション。
		 */
		afterCreate: function (playlog: Playlog, options: {}): void {
			// ※ 外側でredisをrequireすると循環参照で死ぬっぽいのでここでやる
			const redis = require('./redis');
			redis.StagePlayRanking.addByLog(playlog)
				.then(() => redis.UserPlayRanking.addByLog(playlog))
				.catch(console.error);
		},
		/**
		 * スコアランキングの更新。
		 * @param playlog 更新されたプレイログ。
		 * @param options 更新処理のオプション。
		 */
		afterUpdate: function (playlog: Playlog, options: {}): void {
			// ※ 外側でredisをrequireすると循環参照で死ぬっぽいのでここでやる
			const redis = require('./redis');
			// スコアが設定された場合、ランキングを更新
			if (playlog.score != undefined && playlog.score != playlog.previous("score")) {
				redis.StageScoreRanking.updateByLog(playlog)
					.catch(console.error);
			}
		},
	},
	scopes: {
		playing: {
			where: {
				// score: null,
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
	@AllowNull(false)
	@ForeignKey(() => User)
	@Column({
		comment: 'ユーザーID',
		type: DataType.INTEGER,
		defaultValue: 0, // 未認証ユーザーは0
	})
	userId: number;

	/** 獲得スコア */
	@AllowNull(false)
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

	/** ユーザー */
	@BelongsTo(() => User)
	user: User;

	/** ステージ */
	@BelongsTo(() => Stage)
	stage: Stage;

	/**
	 * 渡されたパラメータを更新用に設定する。
	 * @param params 更新用のパラメータ。
	 */
	merge(params: Object): void {
		// createdAtとか上書きされると困るので必要な値だけコピー
		objectUtils.copy(this, params, ["score", "cleared"]);
	}

	/**
	 * クリアしたか？
	 * @returns クリアした場合true。
	 */
	isClear(): boolean {
		// 文字列が入ってくることがあるので、その場合もうまく判定
		if (<any>this.cleared === 'TRUE' || <any>this.cleared === 'True' || <any>this.cleared === 'true') {
			return true;
		} else if (<any>this.cleared === 'FALSE' || <any>this.cleared === 'False' || <any>this.cleared === 'false') {
			return false;
		}
		return Boolean(this.cleared);
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
		hashGenerator.update(String(this.userId));
		hashGenerator.update(String(this.score));
		hashGenerator.update(String(this.isClear()));
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
		if (between.length == 2) {
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
		if (between.length == 2) {
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
