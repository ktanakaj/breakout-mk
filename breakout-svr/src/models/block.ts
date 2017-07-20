/**
 * ブロックモデルクラスモジュール。
 *
 * ブロックくずしの一つのブロックのマスタに対応する。
 * @module ./models/block
 */
import { Table, Column, Model, DataType, AllowNull, Unique, CreatedAt, DefaultScope } from 'sequelize-typescript';
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
	@AllowNull(false)
	@Column({
		comment: 'ブロックキー',
		primaryKey: true,
		type: DataType.STRING(6),
	})
	key: string;

	/** ブロック名 */
	@AllowNull(false)
	@Column({
		comment: 'ブロック名',
	})
	name: string;

	/** ステータス */
	@AllowNull(false)
	@Column({
		comment: 'ステータス',
		type: DataType.ENUM,
		values: ['enable', 'disable'],
		defaultValue: 'enable',
	})
	status: string;

	/** HP */
	@AllowNull(false)
	@Column({
		comment: 'HP',
		type: DataType.INTEGER(3),
		defaultValue: 1,
		validate: { min: 0 },
	})
	hp: number;

	/** 得点 */
	@AllowNull(false)
	@Column({
		comment: '得点',
		type: DataType.INTEGER(6),
	})
	score: number;

	/** X方向サイズ */
	@AllowNull(false)
	@Column({
		comment: 'X方向サイズ',
		type: DataType.INTEGER(3),
		validate: { min: 1 },
	})
	xsize: number;

	/** Y方向サイズ */
	@AllowNull(false)
	@Column({
		comment: 'Y方向サイズ',
		type: DataType.INTEGER(3),
		validate: { min: 1 },
	})
	ysize: number;

	/** RGB色 */
	@AllowNull(false)
	@Column({
		comment: 'RGB色',
		type: DataType.INTEGER,
		validate: { min: 0 },
	})
	color: number;

	/**
	 * 渡されたパラメータを更新用に設定する。
	 * @function merge
	 * @param {Object} params 更新用のパラメータ。
	 */
	merge(params: Object): void {
		// keyとか上書きされると困るので必要な値だけコピー
		objectUtils.copy(this, params, ["name", "status", "hp", "score", "xsize", "ysize", "color"]);
	}
}