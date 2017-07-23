/**
 * 最新ステージ一覧ページコンポーネント。
 * @module ./app/stages/latest-stages.component
 */
import { Component, OnInit } from '@angular/core';
import { Stage } from './stage.model';
import { StageService } from './stage.service';

/**
 * 最新ステージ一覧ページコンポーネントクラス。
 */
@Component({
	templateUrl: 'app/stages/latest-stages.component.html',
	providers: [
		StageService,
	],
})
export class LatestStagesComponent implements OnInit {
	/** ステージ一覧 */
	stages: Stage[] = [];

	/**
	 * サービスをDIしてコンポーネントを生成する。
	 * @param stageService ステージ関連サービス。
	 */
	constructor(
		private stageService: StageService) { }

	/**
	 * コンポーネント起動時の処理。
	 */
	async ngOnInit(): Promise<void> {
		this.stages = await this.stageService.findLatest();
	}
}
