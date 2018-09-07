/**
 * ステージモデルクラスモジュール。
 *
 * ブロックくずしの一つの面に対応する。
 * @module ./models/stage
 */
import { Table, Column, Model, DataType, AllowNull, Default, Comment, BelongsTo, HasMany, ForeignKey, IFindOptions } from 'sequelize-typescript';
import { Op } from 'sequelize';
import * as _ from 'lodash';
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
					[Op.or]: [where, { userId }]
				};
			}
			return {
				include: [{
					model: StageHeader,
					as: 'header',
					where,
					required: true,
					include: [{
						model: User,
						as: 'user',
						where: {
							status: { [Op.ne]: "disable" },
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
					where,
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
	@Comment('ステージヘッダーID')
	@AllowNull(false)
	@ForeignKey(() => StageHeader)
	@Column
	headerId: number;

	/** ステージ名 */
	@Comment('ステージ名')
	@AllowNull(false)
	@Column
	name: string;

	/** ステータス */
	@Comment('ステータス')
	@AllowNull(false)
	@Default('latest')
	@Column({
		type: DataType.ENUM,
		values: ['latest', 'updated'],
	})
	status: string;

	/** ステージデータ */
	@Comment('ステージデータ')
	@AllowNull(false)
	@Column(DataType.TEXT)
	map: string;

	/** ステージコメント */
	@Comment('ステージコメント')
	@AllowNull(false)
	@Default('')
	@Column(DataType.TEXT)
	comment: string;

	/** ステージヘッダー */
	@BelongsTo(() => StageHeader)
	header: StageHeader;

	/** ステージプレイログ */
	@HasMany(() => Playlog)
	playlogs: Playlog[];

	/**
	 * 渡されたパラメータを更新用に設定する。
	 * @param params 更新用のパラメータ。
	 */
	merge(params: object): void {
		// createdAtとか上書きされると困るので必要な値だけコピー
		this.set(_.pick(params, ['name', 'status', 'map', 'comment']));
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
	async saveAll(options: {} = {}): Promise<Stage> {
		/**
		 * ステージを必要なら新バージョンの形でsave()する。
		 * @function saveWithNewVersion
		 * @param options saveオプション。
		 * @returns 実行結果。
		 */
		const saveWithNewVersion = async (options) => {
			// 新規またはマップが変わっていない場合、普通にsave
			if (this.isNewRecord || this.map === this.previous("map")) {
				return await this.save(options);
			}
			// マップが変わった場合は、旧レコードを updated にして新レコードを登録
			const newRecord = Stage.build(_.pick(this, ['headerId', 'name', 'map', 'comment']));
			const oldRecord = await Stage.findById<Stage>(this.id);
			oldRecord.status = "updated";
			await oldRecord.save(options);
			return await newRecord.save(options);
		};

		return await this.sequelize.transaction(async (t) => {
			options = options || {};
			options['transaction'] = options['transaction'] || t;

			if (!this.header) {
				throw new Error("this.header is unloaded");
			}
			// 新規の場合はヘッダーIDが必要なのでヘッダーから保存
			const header = await this.header.save(options);
			this.headerId = header.id;
			const stage = await saveWithNewVersion(options);
			stage.header = header;
			return stage;
		});
	}

	/**
	 * レコードを主キーで取得する。
	 * @param id テーブルの主キー。
	 * @param options 検索オプション。
	 * @returns レコード。
	 * @throws SequelizeEmptyResultError レコードが存在しない場合。
	 */
	static async findOrFail(id: number, options?: IFindOptions<Stage>): Promise<Stage> {
		// rejectOnEmptyを有効化したfindByIdのエイリアス
		options = options || {};
		options.rejectOnEmpty = true;
		return await (<any>this).findById(id, options);
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
	static async findByIdWithAccessibleAllInfo(stageId: number, userId: number): Promise<Stage> {
		const stage = await Stage.scope({ method: ['accessible', userId] }).findById<Stage>(stageId);
		if (!stage) return stage;

		// モデルのインスタンスに直接値を詰めるとJSONにしたとき出てこないので、
		// 普通のオブジェクトに詰め替えて返す
		const result = stage.toJSON();
		result.info = { tried: 0, score: 0, cleared: 0, user: { tried: 0, score: 0, cleared: 0, rating: 0, favorited: false } };

		// コメント
		const comments = await stage.header.getCommentsByUserId(userId);
		result.header.comments = comments;

		// レーティング（平均）
		const score = await new StageRatingRanking().getAsync(String(stage.headerId));
		result.info.rating = score;

		// ステージの統計情報
		const reports = await Playlog.reportByStageIds(stageId);
		for (let r of reports) {
			result.info.tried = r.tried;
			result.info.score = r.score;
			result.info.cleared = r.cleared;
		}

		// ログイン時のみの情報
		if (!userId) {
			return result;
		}

		// ステージのユーザーの統計情報
		const reports2 = await Playlog.reportForUser(userId, stageId);
		for (let r of reports2) {
			result.info.user = r;
		}
		// お気に入り有無
		const favorite = await StageFavorite.scope({ method: ['one', userId, stage.headerId] }).findOne();
		result.info.user.favorited = !!favorite;

		// レーティング（ユーザー）
		const rating = await stage.header.getRating(userId);
		result.info.user.rating = rating;

		return result;
	}

	/**
	 * 最新ステージ一覧とその関連情報を取得する。
	 * @param userId アクセス中のユーザーのID。未ログインは0。
	 * @param options findAllオプション。
	 * @returns 検索結果。
	 */
	static async findLatestStagesWithAccessibleAllInfo(userId: number, options?: IFindOptions<Stage>): Promise<Stage[]> {
		const ranking = new StageRatingRanking();
		let results = [];

		const stages = await Stage.scope(<any>["latest", { method: ['accessible', userId] }]).findAll(options);
		if (stages.length <= 0) return results;

		// モデルのインスタンスに直接値を詰めるとJSONにしたとき出てこないので、
		// 普通のオブジェクトに詰め替えて返す
		for (let stage of stages) {
			let result = stage.toJSON();
			result.info = { tried: 0, score: 0, cleared: 0, rating: 0 };
			results.push(result);
		}

		// ステージの平均評価
		const scores = await Promise.all(results.map((stage) => ranking.getAsync(stage.headerId)));
		for (let i = 0; i < scores.length; i++) {
			results[i].info.rating = scores[i] || 0;
		}

		// ユーザーのプレイ回数・クリア回数・ハイスコア
		if (userId <= 0) {
			return results;
		}

		const reports = await Playlog.reportForUser(userId, results.map((stage) => stage.id));
		objectUtils.mergeArray(results, reports, "id", "stageId", "info");

		return results;
	}

	/**
	 * ユーザーが登録したステージ一覧とその関連情報を取得する。
	 * @param userId 検索するユーザーのID。
	 * @param all publicのみに制限しない場合true。
	 * @param options findAllオプション。
	 * @returns 検索結果。
	 */
	// TODO: 戻り値の型修正（実際にはStageインスタンスじゃない, infoの中身も明記する）
	static async findUserStagesWithAccessibleAllInfo(userId: number, all: boolean = false, options?: IFindOptions<Stage>): Promise<(Stage & { info: {} })[]> {
		const ranking = new StageRatingRanking();
		let results = [];

		const stages = await Stage.scope(<any>["latest", { method: ['user', userId, all ? null : "public"] }]).findAll(options);
		if (stages.length <= 0) return results;

		// モデルのインスタンスに直接値を詰めるとJSONにしたとき出てこないので、
		// 普通のオブジェクトに詰め替えて返す
		for (let stage of stages) {
			let result = stage.toJSON();
			result.info = {};
			results.push(result);
		}

		// ステージの挑まれた回数・クリアされた回数・ハイスコア
		const reports = await Playlog.reportByStageIds(results.map((stage) => stage.id));
		objectUtils.mergeArray(results, reports, "id", "stageId", "info");

		// ステージの平均評価
		const scores = await Promise.all(results.map((stage) => ranking.getAsync(stage.headerId)));
		for (let i = 0; i < scores.length; i++) {
			results[i].info.rating = scores[i] || 0;
		}

		// お気に入り数
		const reports2 = await StageFavorite.countByHeaderIds(results.map((stage) => stage.headerId));
		objectUtils.mergeArray(results, reports2, "headerId", "headerId", "info.favorites", "cnt");

		// コメント数
		const reports3 = await StageComment.countByHeaderIds(results.map((stage) => stage.headerId));
		objectUtils.mergeArray(results, reports3, "headerId", "headerId", "info.comments", "cnt");

		return results;
	}
}
