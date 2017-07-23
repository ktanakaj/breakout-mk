/**
 * ステージモデルクラスモジュール。
 *
 * ブロックくずしの一つの面に対応する。
 * @module ./models/stage
 */
import { Table, Column, Model, DataType, AllowNull, Unique, CreatedAt, BelongsTo, HasMany, ForeignKey, Sequelize } from 'sequelize-typescript';
import * as Bluebird from 'bluebird';
import objectUtils from '../core/utils/object-utils';
import StageRatingRanking from './rankings/stage-rating-ranking';
import User from './user';
import StageHeader from './stage-header';
import StageComment from './stage-comment';
import StageFavorite from './stage-favorite';
import Playlog from './playlog';

/**
 * ステージモデルクラス。
 */
@Table({
	tableName: 'stages',
	comment: 'ステージ',
	timestamps: true,
	indexes: [{
		fields: ['headerId', 'status', { attribute: 'createdAt', order: 'DESC', length: null, collate: null }]
	}, {
		fields: ['headerId', 'status', 'name']
	}],
	scopes: {
		latest: {
			where: {
				status: "latest",
			},
			order: [
				['createdAt', 'DESC']
			],
		},
		withuser: () => {
			return {
				include: [{
					model: StageHeader,
					as: 'header',
					required: true,
					include: [{
						model: User,
						as: 'user',
						required: true,
					}],
				}],
			};
		},
		accessible: (userId) => {
			let where = { status: "public" };
			if (userId) {
				where = <any>{
					$or: [where, { userId: userId }]
				};
			}
			return {
				include: [{
					model: StageHeader,
					as: 'header',
					where: where,
					required: true,
					include: [{
						model: User,
						as: 'user',
						where: {
							status: { $ne: "disable" },
						},
						required: true,
					}],
				}],
			};
		},
		user: (userId, status) => {
			let where = { userId: userId };
			if (status) {
				where['status'] = status;
			}
			return {
				include: [{
					model: StageHeader,
					as: 'header',
					required: true,
					where: where,
					include: [{
						model: User,
						as: 'user',
						required: true,
					}],
				}],
			};
		},
	}
})
export default class Stage extends Model<Stage> {
	/** ステージヘッダーID */
	@AllowNull(false)
	@ForeignKey(() => StageHeader)
	@Column({
		comment: "ステージヘッダーID",
		type: DataType.INTEGER,
	})
	headerId: number;

	/** ステージ名 */
	@AllowNull(false)
	@Column({
		comment: 'ステージ名',
	})
	name: string;

	/** ステータス */
	@AllowNull(false)
	@Column({
		comment: 'ステータス',
		type: DataType.ENUM,
		values: ['latest', 'updated'],
		defaultValue: 'latest',
	})
	status: string;

	/** ステージデータ */
	@AllowNull(false)
	@Column({
		comment: 'ステージデータ',
		type: DataType.TEXT,
	})
	map: string;

	/** ステージ名 */
	@AllowNull(false)
	@Column({
		comment: 'ステージコメント',
		type: DataType.TEXT,
	})
	comment: string;

	/** ステージヘッダー */
	@BelongsTo(() => StageHeader)
	header: StageHeader;

	/** ステージプレイログ */
	@HasMany(() => Playlog)
	playlogs: Playlog[];

	/**
	 * 渡されたパラメータを更新用に設定する。
	 * @function merge
	 * @param {Object} params 更新用のパラメータ。
	 */
	merge(params: Object): void {
		// createdAtとか上書きされると困るので必要な値だけコピー
		objectUtils.copy(this, params, ["name", "status", "map", "comment"]);
	}

	/**
	 * ステージ&ヘッダーをmerge()する。
	 * @param params 更新用のパラメータ。
	 * @returns 実行結果。
	 */
	mergeAll(params: Object): void {
		if (!this.header) {
			throw new Error("this.header is unloaded");
		}
		if (params['header']) {
			this.header.merge(params['header']);
		}
		this.merge(params);
	}

	/**
	 * ステージ&ヘッダーをsave()する。
	 * @param options saveオプション。
	 * @returns 実行結果。
	 */
	saveAll(options: {} = {}): Bluebird<Stage> {
		/**
		 * ステージを必要なら新バージョンの形でsave()する。
		 * @function saveWithNewVersion
		 * @param {Object} options saveオプション。
		 * @returns {Promise.<Stage>} 実行結果。
		 */
		const saveWithNewVersion = (options) => {
			// 新規またはマップが変わっていない場合、普通にsave
			if (this.isNewRecord || this.map == this.previous("map")) {
				return this.save(options);
			}
			// マップが変わった場合は、旧レコードを updated にして新レコードを登録
			const newRecord = Stage.build();
			objectUtils.copy(newRecord, this, ["headerId", "name", "map", "comment"]);

			return Stage.findById<Stage>(this.id)
				.then((oldRecord) => {
					oldRecord.status = "updated";
					return oldRecord;
				})
				.then((oldRecord) => oldRecord.save(options))
				.then(() => newRecord.save(options));
		};

		return this.sequelize.transaction((t) => {
			options = options || {};
			options['transaction'] = options['transaction'] || t;

			if (!this.header) {
				throw new Error("this.header is unloaded");
			}
			// 新規の場合はヘッダーIDが必要なのでヘッダーから保存
			return this.header.save(options)
				.then((header) => {
					this.headerId = header.id;
				})
				.then(() => saveWithNewVersion(options));
		});
	}

	/**
	 * ステージ&ヘッダーをbuild()する。
	 * @param params 設定するパラメータ。
	 * @returns ステージインスタンス。
	 */
	static buildAll(params: Object): Stage {
		const stage = Stage.build<Stage>(params);
		stage.header = StageHeader.build<StageHeader>(params['header']);
		return stage;
	}

	/**
	 * ステージとその関連情報をすべてまとめて取得する。
	 * @param stageId 参照するステージのID。
	 * @param userId アクセス中のユーザーのID。
	 * @returns 検索結果。
	 */
	static findByIdWithAccessibleAllInfo(stageId: number, userId: number): Bluebird<Stage> {
		return Stage.scope({ method: ['accessible', userId] }).findById<Stage>(stageId)
			.then((stage) => {
				if (!stage) return stage;

				// モデルのインスタンスに直接値を詰めるとJSONにしたとき出てこないので、
				// 普通のオブジェクトに詰め替えて返す
				const result = stage.toJSON();
				result.info = { tried: 0, score: 0, cleared: 0, user: { tried: 0, score: 0, cleared: 0, rating: 0, favorited: false } };

				// コメント
				return stage.header.getCommentsByUserId(userId)
					.then((comments) => result.header.comments = comments)
					// レーティング（平均）
					.then(() => new StageRatingRanking().getAsync(String(stage.headerId)))
					.then((score) => result.info.rating = score)
					// ステージの統計情報
					.then(() => Playlog.reportByStageIds(stageId))
					.then((reports) => {
						for (let r of reports) {
							result.info.tried = r.tried;
							result.info.score = r.score;
							result.info.cleared = r.cleared;
						}
					})
					.then(() => {
						// ログイン時のみの情報
						if (!userId) {
							return;
						}

						// ステージのユーザーの統計情報
						return Playlog.reportForUser(userId, stageId)
							.then((reports) => {
								for (let r of reports) {
									result.info.user = r;
								}
							})
							// お気に入り有無
							.then(() => StageFavorite.scope({ method: ['one', userId, stage.headerId] }).findOne())
							.then((favorite) => result.info.user.favorited = !!favorite)
							// レーティング（ユーザー）
							.then(() => stage.header.getRating(userId))
							.then((rating) => result.info.user.rating = rating);
					})
					.then(() => result);
			});
	}

	/**
	 * 最新ステージ一覧とその関連情報を取得する。
	 * @param userId アクセス中のユーザーのID。未ログインは0。
	 * @param options findAllオプション。
	 * @returns 検索結果。
	 */
	static findLatestStagesWithAccessibleAllInfo(userId: number, options: {} = {}): Bluebird<Stage[]> {
		const ranking = new StageRatingRanking();
		let results = [];

		return Stage.scope("latest").scope({ method: ['accessible', userId] }).findAll<Stage>(options)
			.then((stages) => {
				if (stages.length <= 0) return results;

				// モデルのインスタンスに直接値を詰めるとJSONにしたとき出てこないので、
				// 普通のオブジェクトに詰め替えて返す
				for (let stage of stages) {
					let result = stage.toJSON();
					result.info = {};
					results.push(result);
				}

				if (userId <= 0) {
					return results;
				}

				// ユーザーのプレイ回数・クリア回数・ハイスコア
				return Playlog.reportForUser(userId, results.map((stage) => stage.id))
					.then((reports) => objectUtils.mergeArray(results, reports, "id", "stageId", "info"));
			})
			// ステージの平均評価
			.then(() => Promise.all(results.map((stage) => ranking.getAsync(stage.headerId))))
			.then((scores) => {
				for (let i = 0; i < scores.length; i++) {
					results[i].info.rating = scores[i] || 0;
				}
				return results;
			});
	}

	/**
	 * ユーザーが登録したステージ一覧とその関連情報を取得する。
	 * @param userId 検索するユーザーのID。
	 * @param all publicのみに制限しない場合true。
	 * @param options findAllオプション。
	 * @returns 検索結果。
	 */
	//TODO: 戻り値の型修正
	static findUserStagesWithAccessibleAllInfo(userId: number, all: boolean = false, options: {} = undefined): Bluebird<Object[]> {
		const ranking = new StageRatingRanking();
		let results = [];

		return Stage.scope("latest").scope({ method: ['user', userId, all ? null : "public"] }).findAll<Stage>(options)
			.then((stages) => {
				if (stages.length <= 0) return results;

				// モデルのインスタンスに直接値を詰めるとJSONにしたとき出てこないので、
				// 普通のオブジェクトに詰め替えて返す
				for (let stage of stages) {
					let result = stage.toJSON();
					result.info = {};
					results.push(result);
				}

				// ステージの挑まれた回数・クリアされた回数・ハイスコア
				return Playlog.reportByStageIds(results.map((stage) => stage.id))
					.then((reports) => objectUtils.mergeArray(results, reports, "id", "stageId", "info"));
			})
			// ステージの平均評価
			.then(() => Promise.all(results.map((stage) => ranking.getAsync(stage.headerId))))
			.then((scores) => {
				for (let i = 0; i < scores.length; i++) {
					results[i].info.rating = scores[i] || 0;
				}
			})
			// お気に入り数
			.then(() => StageFavorite.countByHeaderIds(results.map((stage) => stage.headerId)))
			.then((reports) => objectUtils.mergeArray(results, reports, "headerId", "headerId", "info.favorites", "cnt"))
			// コメント数
			.then(() => StageComment.countByHeaderIds(results.map((stage) => stage.headerId)))
			.then((reports) => objectUtils.mergeArray(results, reports, "headerId", "headerId", "info.comments", "cnt"));
	}
}
