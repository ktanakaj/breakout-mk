/**
 * WebGLインゲームページコンポーネント。
 * @module ./app/games/game.component
 */
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import browserHelper from '../core/browser-helper';

/**
 * WebGLインゲームページコンポーネントクラス。
 */
@Component({
	templateUrl: 'app/games/game.component.html',
})
export class GameComponent implements OnInit {
	/** インゲームのURL */
	gameUrl: SafeResourceUrl;

	/**
	 * サービスをDIしてコンポーネントを生成する。
	 * @param route ルート情報。
	 * @param sanitizer サニタイズサービス。
	 */
	constructor(
		private route: ActivatedRoute,
		private sanitizer: DomSanitizer) { }

	/**
	 * コンポーネント起動時の処理。
	 */
	ngOnInit(): void {
		// ステージIDが指定された場合インゲームに引き継ぐ
		let url = "../webgl/index.html?lang=" + browserHelper.getLanguage();
		const stageId = this.route.snapshot.params['id'];
		if (stageId) {
			url += "&stage_id=" + stageId;
		}
		this.gameUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
	}
}
