/**
 * ステージ情報モデルクラスモジュール。
 *
 * ブロックくずしのステージの各種情報を扱う。
 * @module ./models/stage-header
 */
import { Table, Column, Model, DataType, AllowNull, Unique, CreatedAt, DefaultScope, ForeignKey, BelongsTo, HasMany, Sequelize } from 'sequelize-typescript';
import * as Bluebird from 'bluebird';
import objectUtils from '../core/utils/object-utils';
import { User } from './user';
import { Stage } from './stage';
import { StageRating } from './stage-rating';
import { StageFavorite } from './stage-favorite';
import { StageComment } from './stage-comment';

/**
 * ステージ情報モデルクラス。
 */
@DefaultScope({
	order: [
		['status'],
		['key', 'ASC']
	],
})
@Table({
	tableName: 'stageHeaders',
	comment: 'ステージヘッダー',
	paranoid: true,
	indexes: [{
		fields: ['userId', 'status']
	}, {
		fields: ['status', "userId"]
	}],
	hooks: {
		/**
		 * 関連ランキングの掲載可否更新。
		 * @function afterUpdate
		 * @param {StageHeader} header 更新されたヘッダー。
		 * @param {Object} options 更新処理のオプション。
		 */
		afterUpdate: function (header: StageHeader, options: Object): void {
			// ※ 外側でredisをrequireすると循環参照で死ぬっぽいのでここでやる
			const redis = require('./redis');
			// 公開/非公開が変わった場合、評価ランキングに登録/削除
			// ※ 評価以外は非公開でも載せているのでとりあえずOK
			if (header.status != undefined && header.status != header.previous("status")) {
				const stageRanking = new redis.StageRatingRanking();
				let promise;
				if (header.status == "public") {
					promise = stageRanking.refreshAsync(header.id);
				} else {
					promise = stageRanking.deleteAsync(header.id);
				}
				promise
					.then(() => new redis.UserRatingRanking().refreshAsync(header.userId))
					.catch(console.error);
			}
		},
		/**
		 * 関連ランキングの削除。
		 * @function afterDestroy
		 * @param {StageHeader} header 削除されたヘッダー。
		 * @param {Object} options 削除処理のオプション。
		 */
		afterDestroy: function (header: StageHeader, options: Object): void {
			// ※ 外側でredisをrequireすると循環参照で死ぬっぽいのでここでやる
			const redis = require('./redis');
			const multi = require('../libs/redis-helper').client.multi();

			// ※ ステージ別ランキングなど、残っていても導線がないものはそのまま
			const favoriteRanking = new redis.StageFavoriteRanking();
			favoriteRanking.multi = multi;
			favoriteRanking.delete(header.id);
			const ratingRanking = new redis.StageRatingRanking();
			ratingRanking.multi = multi;
			ratingRanking.delete(header.id);

			// プレイ回数ランキングはステージに紐づくので過去バージョンも含めて消す
			header.$get('stages')
				.then((stages) => {
					let promises = [];
					for (let stage of <Stage[]>stages) {
						promises.push(redis.StagePlayRanking.deleteAll(multi, stage.id));
					}
					return Promise.all(promises);
				})
				.then(() => {
					const ratingRanking = new redis.UserRatingRanking();
					ratingRanking.multi = multi;
					return ratingRanking.refresh(header.userId);
				})
				.then(() => multi.execAsync())
				.catch(console.error);
		},
	},
})
export class StageHeader extends Model<StageHeader> {
	/** ユーザーID */
	@AllowNull(false)
	@ForeignKey(() => User)
	@Column({
		comment: 'ユーザーID',
		type: DataType.INTEGER,
	})
	userId: number;

	/** ステータス */
	@AllowNull(false)
	@Column({
		comment: 'ステータス',
		type: DataType.ENUM,
		values: ['private', 'public'],
		defaultValue: 'private',
	})
	status: string;

	/** ユーザー */
	@BelongsTo(() => User)
	users: User[];

	/** ステージ */
	@HasMany(() => Stage)
	stages: Stage[];

	/** ステージコメント */
	@HasMany(() => StageComment)
	comments: StageComment[];

	/** ステージお気に入り */
	@HasMany(() => StageFavorite)
	favorites: StageFavorite[];

	/** ステージレーティング */
	@HasMany(() => StageRating)
	ratings: StageRating[];

	/**
	 * 渡されたパラメータを更新用に設定する。
	 * @function merge
	 * @param {Object} params 更新用のパラメータ。
	 */
	merge(params: Object): void {
		// userIdとか上書きされると困るので必要な値だけコピー
		objectUtils.copy(this, params, ["status"]);
	}

	/**
	 * 評価を設定する。
	 * @function setRating
	 * @param {number} userId ユーザーID。
	 * @param {number} rating レーティング。
	 * @returns {Promise.<StageRating>} 更新結果。
	 */
	setRating(userId: number, rating: number): Bluebird<StageRating> {
		// ※ 外側でredisをrequireすると循環参照で死ぬっぽいのでここでやる
		const redis = require('./redis');
		// 既にある場合は上書き、ない場合は新規作成
		return StageRating.scope({ method: ['one', userId, this.id] }).findOrInitialize<StageRating>({ where: {} })
			.then(([stageRating]) => {
				stageRating.headerId = this.id;
				stageRating.userId = userId;
				stageRating.rating = rating;
				return stageRating;
			})
			.then((stageRating) => stageRating.save())
			.then((stageRating) => {
				// 非公開以外は評価ランキングを更新
				if (this.status === "public") {
					new redis.StageRatingRanking().refreshAsync(stageRating.headerId)
						.then(() => new redis.UserRatingRanking().refreshAsync(this.userId))
						.catch(console.error);
				}
				return stageRating;
			});
	}

	/**
	 * 評価を取得する。
	 * @function getRating
	 * @param {number} userId ユーザーID。
	 * @returns {Promise.<number>} 取得結果。
	 */
	getRating(userId: number): Bluebird<number> {
		return StageRating.scope({ method: ['one', userId, this.id] }).findOne<StageRating>()
			.then((stageRating) => stageRating ? stageRating.rating : 0);
	}

	/**
	 * お気に入りを登録する。
	 * @function addFavoriteByUserId
	 * @param {number} userId ユーザーID。
	 * @returns {Promise.<StageFavorite>} 更新結果。
	 */
	addFavoriteByUserId(userId: number): Bluebird<any> {
		return StageFavorite.scope({ method: ['one', userId, this.id] })
			.findOrCreate<StageFavorite>(<any>{ where: {}, defaults: { userId: userId, headerId: this.id } });
	}

	/**
	 * お気に入りを削除する。
	 * @function removeFavoriteByUserId
	 * @param {number} userId ユーザーID。
	 * @returns {Promise} 削除結果。
	 */
	removeFavoriteByUserId(userId: number): Bluebird<void> {
		// afterDestroyの処理があるので、オブジェクトを取って消す
		return StageFavorite.scope({ method: ['one', userId, this.id] }).findOne<StageFavorite>()
			.then((favorite) => {
				if (favorite) {
					return favorite.destroy();
				}
			});
	}

	/**
	 * 指定されたユーザー用にコメントを取得する。
	 * @function getCommentsByUserId
	 * @param {number} userId ユーザーID。
	 * @returns {Promise.<Array>} 検索結果。
	 */
	getCommentsByUserId(userId: number): Bluebird<StageComment[]> {
		// ステージ作者は全て、それ以外はpublicか、自分の投稿のみ
		let where = {};
		if (this.userId != userId) {
			where = { status: "public" };
			if (userId) {
				where = { $or: [where, { userId: userId }] };
			}
		}
		return <Bluebird<StageComment[]>>this.$get('comments', { where: where, scope: ["withuser"] });
	}

	/**
	 * ユーザーの作成ステージ数を取得する。
	 * @function countByUserIds
	 * @param {number|Array} userIds 参照するユーザーID。配列で複数指定可。未指定時は全て。
	 * @returns {Promise.<Array>} 検索結果。
	 */
	static countByUserIds(userIds: number | number[] = null): Bluebird<Object[]> {
		let where = {};
		// ユーザーIDが指定された場合、そのユーザーのみを対象にする
		if (userIds) {
			where['userId'] = Array.isArray(userIds) ? { $in: userIds } : userIds;
		}
		return StageHeader.findAll<StageHeader>({
			attributes: [
				'userId', [Sequelize.fn('COUNT', Sequelize.col('id')), 'created'],
			],
			where: where,
			group: ["userId"],
			raw: true
		});
	}
}
