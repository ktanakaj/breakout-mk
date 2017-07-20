/**
 * ユーザーモデルクラスモジュール。
 *
 * ブロックくずしのユーザー一人一人に対応する。
 * @module ./models/block
 */
import { Table, Column, Model, DataType, AllowNull, Unique, CreatedAt, DefaultScope, Scopes, HasMany } from 'sequelize-typescript';
import * as Bluebird from 'bluebird';
import * as crypto from 'crypto';
import * as config from 'config';
import * as Random from 'random-js';
import objectUtils from '../core/utils/object-utils';
import Playlog from './playlog';
import StageHeader from './stage-header';
import StageRating from './stage-rating';
import StageFavorite from './stage-favorite';
import StageComment from './stage-comment';
const random = new Random();

/**
 * ユーザーモデルクラス。
 */
@DefaultScope({
	attributes: {
		exclude: ['password'],
	},
	order: [
		['name', 'ASC'],
		['id', 'ASC']
	],
})
@Scopes({
	login: {
		where: {
			status: { $ne: "disable" },
		},
	},
	auth: {
		attributes: {
			exclude: ['password'],
		},
		where: {
			status: { $ne: "disable" },
		},
	},
})
@Table({
	tableName: 'users',
	comment: 'ユーザー',
	timestamps: true,
	indexes: [{
		fields: ['name']
	}],
	hooks: {
		beforeCreate: beforeSave,
		beforeUpdate: beforeSave,
	},
})
export default class User extends Model<User> {
	/** ユーザー名 */
	@AllowNull(false)
	@Column({
		comment: 'ユーザー名',
		unique: true,
	})
	name: string;

	/** パスワード */
	@AllowNull(false)
	@Column({
		comment: 'パスワード',
	})
	password: string;

	/** ステータス */
	@AllowNull(false)
	@Column({
		comment: 'ステータス',
		type: DataType.ENUM,
		values: ['user', 'admin', 'disable'],
		defaultValue: 'user',
	})
	status: string;

	/** ユーザーコメント */
	@Column({
		comment: 'ユーザーコメント',
		type: DataType.TEXT,
	})
	comment: string;

	/** ユーザー作成ステージ */
	@HasMany(() => StageHeader)
	headers: StageHeader[];

	/** ユーザープレイログ */
	@HasMany(() => Playlog)
	playlogs: Playlog[];

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
	 * 渡されたパスワードをハッシュ化された値と比較する。
	 * @param {string} password 比較するパスワード。
	 * @returns {boolean} 一致する場合true。
	 * @throws {Error} パスワード未読み込み。
	 */
	comparePassword(password: string): boolean {
		if (this.password == null) {
			throw new Error("this.password is unloaded");
		}
		// salt;ハッシュ値 のデータからsaltを取り出し、そのsaltで計算した結果と比較
		return this.password == User.passwordToHash(password, this.password.split(";")[0]);
	}

	/**
	 * パスワードプロパティをハッシュ化する。
	 * @throws {Error} パスワード未設定。
	 */
	hashPassword(): void {
		if (this.password == null) {
			throw new Error("this.password is unseted");
		}
		this.password = User.passwordToHash(this.password);
	}

	/**
	 * 渡されたパラメータを更新用に設定する。
	 * @param {Object} params 更新用のパラメータ。
	 * @param {boolean} all パラメータを制限しない場合true。
	 */
	merge(params: Object, all: boolean = false): void {
		// statusとか自由に上書きされると困るので、渡された値のうち許可された値だけコピー
		const includes = ["name", 'password', "comment"];
		if (all) {
			includes.push("status");
		}
		objectUtils.copy(this, params, includes);
	}

	/**
	 * 渡されたパスワードをハッシュ値に変換する。
	 * @function passwordToHash
	 * @param {string} password 変換するパスワード。
	 * @param {string} salt 変換に用いるsalt。未指定時は内部で乱数から生成。
	 * @returns {string} saltとハッシュ値を結合した文字列。
	 */
	static passwordToHash(password: string, salt: string = undefined): string {
		if (salt == undefined) {
			salt = random.string(<any>4, <any>'0123456789ABCDEF');
		}
		const hashGenerator = crypto.createHash(config['password']['algorithm']);
		hashGenerator.update(salt);
		hashGenerator.update(password);
		return salt + ";" + hashGenerator.digest('hex');
	}

	/**
	 * ユーザーとその関連情報をすべてまとめて取得する。
	 * @function findByIdWithAllInfo
	 * @param {number} userId 参照するユーザーのID。
	 * @returns {Promise.<Object>} 検索結果。
	 */
	static findByIdWithAllInfo(userId: number): Bluebird<User> {
		// ※ 外側でredisをrequireすると循環参照で死ぬっぽいのでここでやる
		const redis = require('./redis');

		return User.findById<User>(userId)
			.then((user) => {
				if (!user) return user;

				// モデルのインスタンスに直接値を詰めるとJSONにしたとき出てこないので、
				// 普通のオブジェクトに詰め替えて返す
				const result = user.toJSON();
				result.info = { tried: 0, score: 0, cleared: 0, created: 0 };

				// ステージの統計情報
				return Playlog.reportByUserIds(userId)
					.then((reports) => {
						for (let r of reports) {
							result.info.tried = r['tried'];
							result.info.score = r['score'];
							result.info.cleared = r['cleared'];
						}
					})
					// 登録ステージ数
					.then(() => StageHeader.countByUserIds(userId))
					.then((reports) => {
						for (let r of reports) {
							result.info.created = r['created'];
						}
					})
					// レーティング（平均）
					.then(() => new redis.UserRatingRanking().getAsync(userId))
					.then((score) => result.info.rating = score)
					.then(() => result);
			});
	}
}

/**
 * パスワードをハッシュ化する。
 * @function beforeSave
 * @param {User} user 更新されるユーザー。
 * @param {Object} options 更新処理のオプション。
 */
function beforeSave(user: User, options: Object): void {
	// 新しいパスワードが設定されている場合、自動でハッシュ化する
	if (user.password != undefined && user.password != "" && user.password != user.previous("password")) {
		user.hashPassword();
	}
}
