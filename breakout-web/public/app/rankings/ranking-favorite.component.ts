/**
 * お気に入り数順ランキングページコンポーネント。
 * @module ./app/rankings/ranking-favorite.component
 */
import { Component, OnInit } from '@angular/core';
import { FavoriteRankingEntry } from './ranking.model';
import { UserService } from '../users/user.service';
import { RankingService } from './ranking.service';

/**
 * お気に入り数順ランキングページコンポーネントクラス。
 */
@Component({
	templateUrl: 'app/rankings/ranking-favorite.component.html',
	providers: [
		RankingService,
	],
})
export class RankingFavoriteComponent implements OnInit {
	/** ランキング一覧 */
	rankings: FavoriteRankingEntry[] = [];

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
	 */
	async ngOnInit(): Promise<void> {
		this.rankings = await this.rankingService.findStageFavoriteRanking(0, 50);
	}
}
