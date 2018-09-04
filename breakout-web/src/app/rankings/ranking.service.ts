/**
 * ゲームのランキング関連サービスモジュール。
 * @module ./app/blocks/block.service
 */
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import {
	PlayRankingEntry, RatingRankingEntry, FavoriteRankingEntry, ScoreRankingEntry, PlayerRankingEntry, CreatorRankingEntry
} from './ranking.model';

/**
 * ゲームのランキング関連サービスクラス。
 */
@Injectable()
export class RankingService {
	/**
	 * モジュールをDIしてコンポーネントを生成する。
	 * @param http HTTPモジュール。
	 */
	constructor(private http: HttpClient) { }

	/**
	 * ページング用のクエリーを生成する。
	 * @param offset 検索開始位置。
	 * @param limit 検索件数。
	 * @returns get絞り込み用のパラメータ。
	 */
	private makePagingQuery(offset: number, limit: number): HttpParams {
		let params = new HttpParams();
		if (offset !== undefined) {
			params = params.set('offset', String(offset));
		}
		if (limit !== undefined) {
			params = params.set('limit', String(limit));
		}
		return params;
	}

	/**
	 * 年・月の配列をパスに変換する。
	 * @param keys [年, 月]。
	 * @returns パス。
	 */
	private makeKeysToPath(keys: string[]): string {
		return keys.filter((key) => key).join('/');
	}

	/**
	 * ステージプレイ数ランキングを取得する。
	 * @param keys 検索キー。
	 * @param offset 検索開始位置。
	 * @param limit 検索件数。
	 * @returns 検索結果。
	 */
	findStagePlayRanking(keys: string[], offset: number, limit: number): Promise<PlayRankingEntry[]> {
		return this.http.get<PlayRankingEntry[]>(
			'/api/rankings/play/' + this.makeKeysToPath(keys), { params: this.makePagingQuery(offset, limit) })
			.toPromise();
	}

	/**
	 * ステージプレイ数ランキングの全てのキーを取得する。
	 * @returns 検索結果。
	 */
	findStagePlayRankingKeys(): Promise<string[][]> {
		return this.http.get<string[][]>('/api/rankings/play/keys')
			.toPromise();
	}

	/**
	 * 各ステージの獲得スコアランキングを取得する。
	 * @param id ステージID。
	 * @param keys 検索キー。
	 * @param offset 検索開始位置。
	 * @param limit 検索件数。
	 * @returns 検索結果。
	 */
	findStageScoreRanking(id: number, keys: string[], offset: number, limit: number): Promise<ScoreRankingEntry[]> {
		return this.http.get<ScoreRankingEntry[]>(
			'/api/stages/' + id + '/rankings/score/' + this.makeKeysToPath(keys), { params: this.makePagingQuery(offset, limit) })
			.toPromise();
	}

	/**
	 * 各ステージの獲得スコアランキングの全てのキーを取得する。
	 * @param id ステージID。
	 * @returns 検索結果。
	 */
	findStageScoreRankingKeys(id: number): Promise<string[][]> {
		return this.http.get<string[][]>('/api/stages/' + id + '/rankings/score/keys')
			.toPromise();
	}

	/**
	 * ステージ平均評価ランキングを取得する。
	 * @param offset 検索開始位置。
	 * @param limit 検索件数。
	 * @returns 検索結果。
	 */
	findStageRatingRanking(offset: number, limit: number): Promise<RatingRankingEntry[]> {
		return this.http.get<RatingRankingEntry[]>('/api/rankings/rating/', { params: this.makePagingQuery(offset, limit) })
			.toPromise();
	}

	/**
	 * ステージお気に入り数ランキングを取得する。
	 * @param offset 検索開始位置。
	 * @param limit 検索件数。
	 * @returns 検索結果。
	 */
	findStageFavoriteRanking(offset: number, limit: number): Promise<FavoriteRankingEntry[]> {
		return this.http.get<FavoriteRankingEntry[]>('/api/rankings/favorite/', { params: this.makePagingQuery(offset, limit) })
			.toPromise();
	}

	/**
	 * ユーザープレイ回数ランキングを取得する。
	 * @param keys 検索キー。
	 * @param offset 検索開始位置。
	 * @param limit 検索件数。
	 * @returns 検索結果。
	 */
	findUserPlayRanking(keys: string[], offset: number, limit: number): Promise<PlayerRankingEntry[]> {
		return this.http.get<PlayerRankingEntry[]>(
			'/api/rankings/player/' + this.makeKeysToPath(keys), { params: this.makePagingQuery(offset, limit) })
			.toPromise();
	}

	/**
	 * ユーザープレイ回数ランキングの全てのキーを取得する。
	 * @returns 検索結果。
	 */
	findUserPlayRankingKeys(): Promise<string[][]> {
		return this.http.get<string[][]>('/api/rankings/player/keys')
			.toPromise();
	}

	/**
	 * ユーザー平均評価ランキングを取得する。
	 * @param offset 検索開始位置。
	 * @param limit 検索件数。
	 * @returns 検索結果。
	 */
	findUserRatingRanking(offset: number, limit: number): Promise<CreatorRankingEntry[]> {
		return this.http.get<CreatorRankingEntry[]>('/api/rankings/creator/', { params: this.makePagingQuery(offset, limit) })
			.toPromise();
	}
}
