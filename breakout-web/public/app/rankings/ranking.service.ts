/**
 * ゲームのランキング関連サービスモジュール。
 * @module ./app/blocks/block.service
 */
import { Injectable } from '@angular/core';
import { Http, URLSearchParams } from '@angular/http';
import { ResponseError } from '../core/response-error';

/**
 * ゲームのランキング関連サービスクラス。
 */
@Injectable()
export class RankingService {
	/**
	 * モジュールをDIしてコンポーネントを生成する。
	 * @param http HTTPモジュール。
	 */
	constructor(private http: Http) { }

	/**
	 * ページング用のクエリーを生成する。
	 * @param offset 検索開始位置。
	 * @param limit 検索件数。
	 * @returns get絞り込み用のパラメータ。
	 */
	private makePagingQuery(offset: number, limit: number): URLSearchParams {
		const params = new URLSearchParams();
		if (offset !== undefined) {
			params.set('offset', String(offset));
		}
		if (limit !== undefined) {
			params.set('limit', String(limit));
		}
		return params;
	}

	/**
	 * 年・月の配列をパスに変換する。
	 * @param keys [年, 月]。
	 * @returns パス。
	 */
	private makeKeysToPath(keys: string[]): string {
		return keys.filter((key) => key).join("/");
	}

	/**
	 * ステージプレイ数ランキングを取得する。
	 * @param keys 検索キー。
	 * @param offset 検索開始位置。
	 * @param limit 検索件数。
	 * @returns 検索結果。
	 */
	//TODO: 戻り値の型修正
	findStagePlayRanking(keys: string[], offset: number, limit: number): Promise<{}> {
		return this.http.get('/api/rankings/play/' + this.makeKeysToPath(keys), { search: this.makePagingQuery(offset, limit) })
			.toPromise()
			.then((res) => res.json())
			.catch(ResponseError.throwError);
	}

	/**
	 * ステージプレイ数ランキングの全てのキーを取得する。
	 * @returns 検索結果。
	 */
	//TODO: 戻り値の型修正
	findStagePlayRankingKeys(): Promise<{}> {
		return this.http.get('/api/rankings/play/keys')
			.toPromise()
			.then((res) => res.json())
			.catch(ResponseError.throwError);
	}

	/**
	 * 各ステージの獲得スコアランキングを取得する。
	 * @param id ステージID。
	 * @param keys 検索キー。
	 * @param offset 検索開始位置。
	 * @param limit 検索件数。
	 * @returns 検索結果。
	 */
	//TODO: 戻り値の型修正
	findStageScoreRanking(id: number, keys: string[], offset: number, limit: number): Promise<{}> {
		return this.http.get('/api/stages/' + id + '/rankings/score/' + this.makeKeysToPath(keys), { search: this.makePagingQuery(offset, limit) })
			.toPromise()
			.then((res) => res.json())
			.catch(ResponseError.throwError);
	}

	/**
	 * 各ステージの獲得スコアランキングの全てのキーを取得する。
	 * @param id ステージID。
	 * @returns 検索結果。
	 */
	//TODO: 戻り値の型修正
	findStageScoreRankingKeys(id: number): Promise<{}> {
		return this.http.get('/api/stages/' + id + '/rankings/score/keys')
			.toPromise()
			.then((res) => res.json())
			.catch(ResponseError.throwError);
	}

	/**
	 * ステージ平均評価ランキングを取得する。
	 * @param offset 検索開始位置。
	 * @param limit 検索件数。
	 * @returns 検索結果。
	 */
	//TODO: 戻り値の型修正
	findStageRatingRanking(offset: number, limit: number): Promise<{}> {
		return this.http.get('/api/rankings/rating/', { search: this.makePagingQuery(offset, limit) })
			.toPromise()
			.then((res) => res.json())
			.catch(ResponseError.throwError);
	}

	/**
	 * ステージお気に入り数ランキングを取得する。
	 * @param offset 検索開始位置。
	 * @param limit 検索件数。
	 * @returns 検索結果。
	 */
	//TODO: 戻り値の型修正
	findStageFavoriteRanking(offset: number, limit: number): Promise<{}> {
		return this.http.get('/api/rankings/favorite/', { search: this.makePagingQuery(offset, limit) })
			.toPromise()
			.then((res) => res.json())
			.catch(ResponseError.throwError);
	}

	/**
	 * ユーザープレイ回数ランキングを取得する。
	 * @param key 検索キー。
	 * @param offset 検索開始位置。
	 * @param limit 検索件数。
	 * @returns 検索結果。
	 */
	//TODO: 戻り値の型修正
	findUserPlayRanking(key: string, offset: number, limit: number): Promise<{}> {
		return this.http.get('/api/rankings/player/' + key, { search: this.makePagingQuery(offset, limit) })
			.toPromise()
			.then((res) => res.json())
			.catch(ResponseError.throwError);
	}

	/**
	 * ユーザープレイ回数ランキングの全てのキーを取得する。
	 * @returns 検索結果。
	 */
	//TODO: 戻り値の型修正
	findUserPlayRankingKeys(): Promise<{}> {
		return this.http.get('/api/rankings/player/keys')
			.toPromise()
			.then((res) => res.json())
			.catch(ResponseError.throwError);
	}

	/**
	 * ユーザー平均評価ランキングを取得する。
	 * @param offset 検索開始位置。
	 * @param limit 検索件数。
	 * @returns 検索結果。
	 */
	//TODO: 戻り値の型修正
	findUserRatingRanking(offset: number, limit: number): Promise<{}> {
		return this.http.get('/api/rankings/creator/', { search: this.makePagingQuery(offset, limit) })
			.toPromise()
			.then((res) => res.json())
			.catch(ResponseError.throwError);
	}
}