/**
 * ユーザープレイ回数順ランキングページコンポーネント。
 * @module ./app/rankings/ranking-play.component
 */
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { PlayerRankingEntry } from './ranking.model';
import { UserService } from '../users/user.service';
import { RankingService } from './ranking.service';

/**
 * ユーザープレイ回数順ランキングページコンポーネントクラス。
 */
@Component({
	templateUrl: 'app/rankings/ranking-player.component.html',
	providers: [
		RankingService,
	],
})
export class RankingPlayerComponent implements OnInit {
	/** 選択中のキー */
	selected = [];
	/** ランキング一覧 */
	rankings: PlayerRankingEntry[] = [];
	/** キー一覧 */
	keys: string[][] = [];

	/**
	 * サービスをDIしてコンポーネントを生成する。
	 * @param route ルート情報。
	 * @param userService ユーザー関連サービス。
	 * @param rankingService ステージ関連サービス。
	 */
	constructor(
		private route: ActivatedRoute,
		private userService: UserService,
		private rankingService: RankingService) { }

	/**
	 * コンポーネント起動時の処理。
	 */
	async ngOnInit(): Promise<void> {
		// パラメータからキー生成
		this.route.params.subscribe(async (params: Params) => {
			this.selected = [params['year'], params['month']];
		});

		this.rankings = await this.rankingService.findUserPlayRanking(this.selected, 0, 50);
		this.keys = await this.rankingService.findUserPlayRankingKeys();
	}
}
