/**
 * ステージ情報モデルクラスモジュール。
 *
 * ブロックくずしのステージの各種情報を扱う。
 * @module ./models/stage-header
 */
import { Table, Column, Model, DataType, AllowNull, ForeignKey, Default, Comment, BelongsTo, HasMany, AfterUpdate, AfterDestroy, Sequelize } from 'sequelize-typescript';
import objectUtils from '../core/utils/object-utils';
import redis from './rankings/redis';
import StagePlayRanking from './rankings/stage-play-ranking';
import StageRatingRanking from './rankings/stage-rating-ranking';
import UserRatingRanking from './rankings/user-rating-ranking';
import StageFavoriteRanking from './rankings/stage-favorite-ranking';
import User from './user';
import Stage from './stage';
import StageRating from './stage-rating';
import StageFavorite from './stage-favorite';
import StageComment from './stage-comment';

/**
 * ステージ情報モデルクラス。
 */
@Table({
	tableName: 'stageHeaders',
	comment: 'ステージヘッダー',
	timestamps: true,
	paranoid: true,
	indexes: [{
		fields: ['userId', 'status']
	}, {
		fields: ['status', "userId"]
	}],
})
export default class StageHeader extends Model<StageHeader> {
	/** ユーザーID */
	@Comment('ユーザーID')
	@AllowNull(false)
	@ForeignKey(() => User)
	@Column
	userId: number;

	/** ステータス */
	@Comment('ステータス')
	@AllowNull(false)
	@Default('private')
	@Column({
		type: DataType.ENUM,
		values: ['private', 'public'],
	})
	status: string;

	/** ユーザー */
	@BelongsTo(() => User)
	user: User;

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
	 * 関連ランキングの掲載可否更新。
	 * @param header 更新されたヘッダー。
	 * @param options 更新処理のオプション。
	 * @returns 処理状態。
	 */
	@AfterUpdate
	static async updateRankingStatus(header: StageHeader, options: {}): Promise<void> {
		// 公開/非公開が変わった場合、評価ランキングに登録/削除
		// ※ 評価以外は非公開でも載せているのでとりあえずOK
		if (header.status !== undefined && header.status !== header.previous("status")) {
			const stageRanking = new StageRatingRanking();
			if (header.status === "public") {
				await stageRanking.refreshAsync(header.id);
			} else {
				await stageRanking.deleteAsync(header.id);
			}
			await new UserRatingRanking().refreshAsync(header.userId);
		}
	}

	/**
	 * 関連ランキングの削除。
	 * @param header 削除されたヘッダー。
	 * @param options 削除処理のオプション。
	 * @returns 処理状態。
	 */
	@AfterDestroy
	static async removeRankings(header: StageHeader, options: {}): Promise<void> {
		const multi = redis.getClient().multi();

		// ※ ステージ別ランキングなど、残っていても導線がないものはそのまま
		const favoriteRanking = new StageFavoriteRanking(multi);
		favoriteRanking.delete(header.id);
		const stageRatingRanking = new StageRatingRanking(multi);
		stageRatingRanking.delete(header.id);

		// プレイ回数ランキングはステージに紐づくので過去バージョンも含めて消す
		const stages = await header.$get('stages');
		for (let stage of <Stage[]>stages) {
			await StagePlayRanking.deleteAll(multi, stage.id);
		}
		const userRatingRanking = new UserRatingRanking(multi);
		await userRatingRanking.refresh(header.userId);
		await multi.execAsync();
	}

	/**
	 * 渡されたパラメータを更新用に設定する。
	 * @param params 更新用のパラメータ。
	 */
	merge(params: Object): void {
		// userIdとか上書きされると困るので必要な値だけコピー
		objectUtils.copy(this, params, ["status"]);
	}

	/**
	 * 評価を設定する。
	 * @param userId ユーザーID。
	 * @param rating レーティング。
	 * @returns 更新結果。
	 */
	async setRating(userId: number, rating: number): Promise<StageRating> {
		// 既にある場合は上書き、ない場合は新規作成
		const result = await StageRating.scope({ method: ['one', userId, this.id] }).findOrInitialize<StageRating>({ where: {} });
		const stageRating = result[0];
		stageRating.headerId = this.id;
		stageRating.userId = userId;
		stageRating.rating = rating;
		await stageRating.save();

		// 非公開以外は評価ランキングを更新
		if (this.status === "public") {
			try {
				await new StageRatingRanking().refreshAsync(stageRating.headerId);
				await new UserRatingRanking().refreshAsync(this.userId);
			} catch (e) {
				console.error(e);
			}
		}
		return stageRating;
	}

	/**
	 * 評価を取得する。
	 * @param userId ユーザーID。
	 * @returns 取得結果。
	 */
	async getRating(userId: number): Promise<number> {
		const stageRating = await StageRating.scope({ method: ['one', userId, this.id] }).findOne<StageRating>();
		return stageRating ? stageRating.rating : 0;
	}

	/**
	 * お気に入りを登録する。
	 * @param userId ユーザーID。
	 * @returns 更新結果。
	 */
	async addFavoriteByUserId(userId: number): Promise<StageFavorite> {
		const result = await StageFavorite.scope({ method: ['one', userId, this.id] })
			.findOrCreate<StageFavorite>(<any>{ where: {}, defaults: { userId: userId, headerId: this.id } });
		return result[0];
	}

	/**
	 * お気に入りを削除する。
	 * @param userId ユーザーID。
	 * @returns 削除結果。
	 */
	async removeFavoriteByUserId(userId: number): Promise<void> {
		// afterDestroyの処理があるので、オブジェクトを取って消す
		const favorite = await StageFavorite.scope({ method: ['one', userId, this.id] }).findOne<StageFavorite>();
		if (favorite) {
			return await favorite.destroy();
		}
	}

	/**
	 * 指定されたユーザー用にコメントを取得する。
	 * @param userId ユーザーID。
	 * @returns 検索結果。
	 */
	async getCommentsByUserId(userId: number): Promise<StageComment[]> {
		// ステージ作者は全て、それ以外はpublicか、自分の投稿のみ
		let where = {};
		if (this.userId !== userId) {
			where = { status: "public" };
			if (userId) {
				where = { $or: [where, { userId: userId }] };
			}
		}
		return <StageComment[]>await this.$get('comments', { where: where, scope: ["withuser"] });
	}

	/**
	 * ユーザーの作成ステージ数を取得する。
	 * @param userIds 参照するユーザーID。配列で複数指定可。未指定時は全て。
	 * @returns 検索結果。
	 */
	static async countByUserIds(userIds: number | number[] = null): Promise<{ userId: number, created: number }[]> {
		let where = {};
		// ユーザーIDが指定された場合、そのユーザーのみを対象にする
		if (userIds) {
			where['userId'] = Array.isArray(userIds) ? { $in: userIds } : userIds;
		}
		return await StageHeader.findAll<any>({
			attributes: [
				'userId', [Sequelize.fn('COUNT', Sequelize.col('id')), 'created'],
			],
			where: where,
			group: ["userId"],
			raw: true
		});
	}
}
