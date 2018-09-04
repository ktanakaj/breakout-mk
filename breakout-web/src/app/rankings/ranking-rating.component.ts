/**
 * 評価順ランキングページコンポーネント。
 * @module ./app/rankings/ranking-rating.component
 */
import { Component, OnInit } from '@angular/core';
import { RatingRankingEntry } from './ranking.model';
import { UserService } from '../users/user.service';
import { RankingService } from './ranking.service';

/**
 * 評価順ランキングページコンポーネントクラス。
 */
@Component({
	templateUrl: './ranking-rating.component.html',
	providers: [
		RankingService,
	],
})
export class RankingRatingComponent implements OnInit {
	/** ランキング一覧 */
	rankings: RatingRankingEntry[] = [];

	/**
	 * サービスをDIしてコンポーネントを生成する。
	 * @param userService ユーザー関連サービス。
	 * @param rankingService ステージ関連サービス。
	 */
	constructor(
		private userService: UserService,
		private rankingService: RankingService) { }

	/**
	 * コンポーネント起動時の処理。
	 * @returns 処理状態。
	 */
	async ngOnInit(): Promise<void> {
		this.rankings = await this.rankingService.findStageRatingRanking(0, 50);
	}
}
