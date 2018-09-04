/**
 * ユーザー評価順ランキングページコンポーネント。
 * @module ./app/rankings/ranking-creator.component
 */
import { Component, OnInit } from '@angular/core';
import { CreatorRankingEntry } from './ranking.model';
import { UserService } from '../users/user.service';
import { RankingService } from './ranking.service';

/**
 * ユーザー評価順ランキングページコンポーネントクラス。
 */
@Component({
	templateUrl: './ranking-creator.component.html',
	providers: [
		RankingService,
	],
})
export class RankingCreatorComponent implements OnInit {
	/** ランキング一覧 */
	rankings: CreatorRankingEntry[] = [];

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
		this.rankings = await this.rankingService.findUserRatingRanking(0, 50);
	}
}
