/**
 * ステージ情報モデルモジュール。
 * @module ./app/shared/stage.model
 */
import { User } from '../users/user.model';
import { Playlog } from '../users/playlog.model';

/**
 * ステージヘッダー情報。
 */
export interface StageHeader {
	/** ステージヘッダーID */
	id: number;
	/** ユーザーID */
	userId: number;
	/** ステータス */
	status: string;
	/** 登録日時 */
	createdAt: Date;
	/** 更新日時 */
	updatedAt: Date;
	/** 削除日時 */
	deletedAt: Date;

	/** ユーザー */
	user?: User;
	/** ステージ */
	stages?: Stage;
	/** ステージコメント */
	comments?: StageComment;
	/** ステージお気に入り */
	favorites?: StageFavorite;
	/** ステージレーティング */
	ratings?: StageRating;
}

/**
 * ステージ情報。
 */
export interface Stage {
	/** ステージID */
	id: number;
	/** ステージヘッダーID */
	headerId: number;
	/** ステージ名 */
	name: string;
	/** ステータス */
	status: string;
	/** ステージデータ */
	map: string;
	/** ステージ名 */
	comment: string;
	/** 登録日時 */
	createdAt: Date;
	/** 更新日時 */
	updatedAt: Date;

	/** ステージヘッダー */
	header?: StageHeader;
	/** ステージプレイログ */
	playlogs?: Playlog[];
}

/**
 * ステージコメント情報。
 */
export interface StageComment {
	/** ステージコメントID */
	id: number;
	/** ステージヘッダーID */
	headerId: number;
	/** ユーザーID */
	userId: number;
	/** IPアドレス */
	ipAddress: string;
	/** ステータス */
	status: string;
	/** ステージコメント */
	comment: string;
	/** 登録日時 */
	createdAt: Date;
	/** 更新日時 */
	updatedAt: Date;
	/** 削除日時 */
	deletedAt: Date;

	/** ユーザー */
	user?: User;
	/** ステージヘッダー */
	header?: StageHeader;
}

/**
 * ステージお気に入り情報。
 */
export interface StageFavorite {
	/** ステージお気に入りID */
	id: number;
	/** ステージヘッダーID */
	headerId: number;
	/** ユーザーID */
	userId: number;
	/** 登録日時 */
	createdAt: Date;

	/** ユーザー */
	user?: User;
	/** ステージヘッダー */
	header?: StageHeader;
}

/**
 * ステージ評価情報。
 */
export interface StageRating {
	/** ステージ評価ID */
	id: number;
	/** ステージヘッダーID */
	headerId: number;
	/** ユーザーID */
	userId: number;
	/** レーティング */
	rating: number;
	/** 登録日時 */
	createdAt: Date;
	/** 更新日時 */
	updatedAt: Date;

	/** ユーザー */
	user?: User;
	/** ステージヘッダー */
	header?: StageHeader;
}

/**
 * ステージ情報+詳細情報。
 */
export interface StageWithInfo extends Stage {
	// ステージ詳細情報
	info: { tried: number, score: number, cleared: number, rating: number, user: { tried: number, score: number, cleared: number, rating: number, favorited: boolean } };
}
