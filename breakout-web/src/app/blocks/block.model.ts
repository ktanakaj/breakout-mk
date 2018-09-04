/**
 * ブロック情報モデルモジュール。
 * @module ./app/blocks/block.model
 */

/**
 * ブロック情報。
 */
export interface Block {
	/** ブロックキー */
	key: string;
	/** ブロック名 */
	name: string;
	/** ステータス */
	status: string;
	/** HP */
	hp: number;
	/** 得点 */
	score: number;
	/** X方向サイズ */
	xsize: number;
	/** Y方向サイズ */
	ysize: number;
	/** RGB色 */
	color: number | string;
	/** 登録日時 */
	createdAt?: Date;
	/** 更新日時 */
	updatedAt?: Date;
}