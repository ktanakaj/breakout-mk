/**
 * プレイログ情報モデルモジュール。
 * @module ./app/shared/playlog.model
 */
import { Stage } from '../stages/stage.model';
import { User } from './user.model';

/**
 * プレイログ情報。
 */
export interface Playlog {
	/** プレイログID */
	id: number;
	/** ステージID */
	stageId: number;
	/** ユーザーID */
	userId: number;
	/** 獲得スコア */
	score: number;
	/** クリアしたか？ */
	cleared: boolean;
	/** 登録日時 */
	createdAt: Date;
	/** 更新日時 */
	updatedAt: Date;

	/** ユーザー */
	user?: User;
	/** ステージ */
	stage?: Stage;
}
