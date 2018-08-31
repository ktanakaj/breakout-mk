/**
 * ブロックモデルクラスモジュール。
 *
 * ブロックくずしの一つのブロックのマスタに対応する。
 * @module ./models/block
 */
import { Table, Column, Model, DataType, PrimaryKey, AllowNull, Default, Comment, Min, DefaultScope, IFindOptions } from 'sequelize-typescript';
import objectUtils from '../core/utils/object-utils';

/**
 * ブロックモデルクラス。
 */
@DefaultScope({
	order: [
		['status'],
		['key', 'ASC']
	],
})
@Table({
	tableName: 'blocks',
	comment: 'ブロック',
	timestamps: true,
	indexes: [{
		fields: [{ attribute: 'status', order: 'DESC', length: null, collate: null }, "key"]
	}],
})
export default class Block extends Model<Block> {
	/** ブロックキー */
	@Comment('ブロックキー')
	@PrimaryKey
	@AllowNull(false)
	@Column(DataType.STRING(6))
	key: string;

	/** ブロック名 */
	@Comment('ブロック名')
	@AllowNull(false)
	@Column
	name: string;

	/** ステータス */
	@Comment('ステータス')
	@AllowNull(false)
	@Default('enable')
	@Column({
		type: DataType.ENUM,
		values: ['enable', 'disable'],
	})
	status: string;

	/** HP */
	@Comment('HP')
	@AllowNull(false)
	@Default(1)
	@Column(DataType.INTEGER(3).UNSIGNED)
	hp: number;

	/** 得点 */
	@Comment('得点')
	@AllowNull(false)
	@Column(DataType.INTEGER(6))
	score: number;

	/** X方向サイズ */
	@Comment('X方向サイズ')
	@AllowNull(false)
	@Min(1)
	@Column(DataType.INTEGER(3).UNSIGNED)
	xsize: number;

	/** Y方向サイズ */
	@Comment('Y方向サイズ')
	@AllowNull(false)
	@Min(1)
	@Column(DataType.INTEGER(3).UNSIGNED)
	ysize: number;

	/** RGB色 */
	@Comment('RGB色')
	@AllowNull(false)
	@Column(DataType.INTEGER.UNSIGNED)
	color: number;

	/**
	 * 渡されたパラメータを更新用に設定する。
	 * @param params 更新用のパラメータ。
	 */
	merge(params: Object): void {
		// keyとか上書きされると困るので必要な値だけコピー
		objectUtils.copy(this, params, ["name", "status", "hp", "score", "xsize", "ysize", "color"]);
	}

	/**
	 * レコードを主キーで取得する。
	 * @param key テーブルの主キー。
	 * @param options 検索オプション。
	 * @returns レコード。
	 * @throws SequelizeEmptyResultError レコードが存在しない場合。
	 */
	static async findOrFail(key: number, options?: IFindOptions<Block>): Promise<Block> {
		// rejectOnEmptyを有効化したfindByIdのエイリアス
		options = options || {};
		options.rejectOnEmpty = true;
		return await (<any>this).findById(key, options);
	}
}