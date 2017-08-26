/**
 * ステージプレイ回数順ランキングページコンポーネント。
 * @module ./app/stages/latest-stages.component
 */
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { PlayRanking } from './ranking.model';
import { UserService } from '../users/user.service';
import { RankingService } from './ranking.service';

/**
 * ステージプレイ回数順ランキングページコンポーネントクラス。
 */
@Component({
	templateUrl: 'app/rankings/ranking-play.component.html',
	providers: [
		RankingService,
	],
})
export class RankingPlayComponent implements OnInit {
	/** 選択中のキー */
	selected = [];
	/** ランキング一覧 */
	rankings: PlayRanking[] = [];
	/** キー一覧 */
	keys: string[] = [];

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

		this.rankings = await this.rankingService.findStagePlayRanking(this.selected, 0, 50);
		this.keys = await this.rankingService.findStagePlayRankingKeys();
	}
}
