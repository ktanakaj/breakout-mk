/**
 * ステージプレイ回数順ランキングページコンポーネント。
 * @module ./app/rankings/ranking-play.component
 */
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { PlayRankingEntry } from './ranking.model';
import { UserService } from '../users/user.service';
import { RankingService } from './ranking.service';

/**
 * ステージプレイ回数順ランキングページコンポーネントクラス。
 */
@Component({
	templateUrl: './ranking-play.component.html',
	providers: [
		RankingService,
	],
})
export class RankingPlayComponent implements OnInit {
	/** 選択中のキー */
	selected = [];
	/** ランキング一覧 */
	rankings: PlayRankingEntry[] = [];
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
	 * @returns 処理状態。
	 */
	async ngOnInit(): Promise<void> {
		// ランキングキーを読み込み
		this.keys = await this.rankingService.findStagePlayRankingKeys();

		// パラメータから選択中のキーを読み込み、ランキング表示
		this.route.params.subscribe(async (params: Params) => {
			this.selected = [params['year'], params['month']];
			this.rankings = await this.rankingService.findStagePlayRanking(this.selected, 0, 50);
		});
	}
}
