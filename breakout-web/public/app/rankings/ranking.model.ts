/**
 * ランキング情報モデルモジュール。
 * @module ./app/shared/ranking.model
 */
import { Stage } from '../stages/stage.model';
import { User } from '../users/user.model';

/**
 * ステージプレイ回数順ランキング情報。
 */
export interface PlayRankingEntry {
	/** 順位 */
	no: number;
	/** ステージID */
	member: string;
	/** 挑まれた回数 */
	score: number;
	/** ステージ */
	stage: Stage;
	/** ランキング詳細情報 */
	info: { stageId: number, tried: number, score: number, cleared: number };
}

/**
 * ステージ評価ランキング情報。
 */
export interface RatingRankingEntry {
	/** 順位 */
	no: number;
	/** ステージID */
	member: string;
	/** 平均評価 */
	score: number;
	/** ステージ */
	stage: Stage;
}

/**
 * お気に入り数順ランキング情報。
 */
export interface FavoriteRankingEntry {
	/** 順位 */
	no: number;
	/** ステージID */
	member: string;
	/** お気に入り数 */
	score: number;
	/** ステージ */
	stage: Stage;
}

/**
 * ユーザーステージプレイ回数順ランキング情報。
 */
export interface PlayerRankingEntry {
	/** 順位 */
	no: number;
	/** ユーザーID */
	member: string;
	/** プレイ回数 */
	score: number;
	/** ユーザー */
	user: User;
	/** ランキング詳細情報 */
	info: { userId: number, tried: number, score: number, cleared: number };
}

/**
 * ユーザー作成ステージ評価ランキング情報。
 */
export interface CreatorRankingEntry {
	/** 順位 */
	no: number;
	/** ユーザーID */
	member: string;
	/** 平均評価 */
	score: number;
	/** ユーザー */
	user: User;
	/** ランキング詳細情報 */
	info: { userId: number, created: number };
}

/**
 * 獲得スコアランキング情報。
 */
export interface ScoreRankingEntry {
	/** 順位 */
	no: number;
	/** ユーザーID */
	member: string;
	/** ハイスコア */
	score: number;
	/** ユーザー */
	user: User;
}
