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
	templateUrl: './ranking-player.component.html',
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
	 * @param rankingService ランキング関連サービス。
	 */
	constructor(
		private route: ActivatedRoute,
		private userService: UserService,
		private rankingService: RankingService) { }

	/**
	 * コンポーネント起動時の処理。
	 * @returns 処理状態。
	 */
	async ngOnInit(): Promise<void> {
		// ランキングキーを読み込み
		this.keys = await this.rankingService.findUserPlayRankingKeys();

		// パラメータから選択中のキーを読み込み、ランキング表示
		this.route.params.subscribe(async (params: Params) => {
			this.selected = [params['year'], params['month']];
			this.rankings = await this.rankingService.findUserPlayRanking(this.selected, 0, 50);
		});
	}
}
