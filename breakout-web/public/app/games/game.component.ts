/**
 * WebGLインゲームページコンポーネント。
 * @module ./app/games/game.component
 */
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import browserHelper from '../core/browser-helper';

/**
 * WebGLインゲームページコンポーネントクラス。
 */
@Component({
	templateUrl: 'app/games/game.component.html',
})
export class GameComponent implements OnInit {
	/** インゲームのURL */
	gameUrl: string;

	/**
	 * サービスをDIしてコンポーネントを生成する。
	 * @param route ルート情報。
	 */
	constructor(
		private route: ActivatedRoute) { }

	/**
	 * コンポーネント起動時の処理。
	 */
	async ngOnInit(): Promise<void> {
		// ステージIDが指定された場合インゲームに引き継ぐ
		this.gameUrl = "../webgl/index.html?lang=" + browserHelper.getLanguage();
		const stageId = this.route.snapshot.params['id'];
		if (stageId) {
			this.gameUrl += "&stage_id=" + stageId;
		}
	}
}
