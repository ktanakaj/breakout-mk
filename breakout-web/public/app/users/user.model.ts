/**
 * ユーザー情報モデルモジュール。
 * @module ./app/shared/user.model
 */
import { StageHeader, StageComment, StageFavorite, StageRating } from '../stages/stage.model';
import { Playlog } from './playlog.model';

/**
 * ユーザー情報。
 */
export interface User {
	/** ユーザーID */
	id: number;
	/** ユーザー名 */
	name: string;
	/** パスワード */
	password?: string;
	/** ステータス */
	status: string;
	/** ユーザーコメント */
	comment: string;
	/** 登録日時 */
	createdAt?: Date;
	/** 更新日時 */
	updatedAt?: Date;

	/** ユーザー作成ステージ */
	headers?: StageHeader[];
	/** ユーザープレイログ */
	playlogs?: Playlog[];
	/** ステージコメント */
	comments?: StageComment[];
	/** ステージお気に入り */
	favorites?: StageFavorite[];
	/** ステージレーティング */
	ratings?: StageRating[];
}
