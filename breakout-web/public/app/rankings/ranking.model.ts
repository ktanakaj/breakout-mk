/**
 * ランキング情報モデルモジュール。
 * @module ./app/shared/ranking.model
 */
import { Stage } from '../stages/stage.model';

/**
 * ステージプレイ回数順ランキング詳細情報。
 */
export interface PlayRankingInfo {
	/** ステージID */
	stageId: number;
	/** 挑まれた回数 */
	tried: number;
	/** ハイスコア */
	score: number;
	/** クリアされた回数 */
	cleared: number;
}

/**
 * ステージプレイ回数順ランキング情報。
 */
export interface PlayRanking {
	/** 順位 */
	no: number;
	/** ステージID */
	member: string;
	/** 挑まれた回数 */
	score: string;
	/** ステージ */
	stage: Stage;
	/** ランキング詳細情報 */
	info: PlayRankingInfo;
}
