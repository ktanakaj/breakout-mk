/**
 * ステージプレビューコンポーネント。
 * @module ./app/stages/stage-previre.component
 */
import { Component, Input, OnInit } from '@angular/core';
import modelUtils from '../core/model-utils';
import { Block } from '../blocks/block.model';
import { StageService } from './stage.service';

/**
 * ステージプレビューコンポーネントクラス。
 */
@Component({
	selector: 'stage-preview',
	templateUrl: './stage-preview.component.html',
})
export class StagePreviewComponent implements OnInit {
	/** マップ文字列 */
	map = '';
	/** X方向のサイズ */
	@Input() xmax = 0;
	/** Y方向のサイズ */
	@Input() ymax = 0;

	/** 表示用のマップデータ */
	mapData: Block[][] = [];
	/** 処理用のブロックマスタ */
	blockMap: Object = {};

	/**
	 * サービスをDIしてコンポーネントを生成する。
	 * @param stageService ユーザー関連サービス。
	 */
	constructor(
		private stageService: StageService) { }

	/**
	 * マップ文字列を設定する。
	 * @param map マップ文字列。
	 */
	@Input('map')
	set setMap(map: string) {
		// 画面が編集されたらプレビューも更新する
		this.map = map;
		this.stageService.updateMapData(this.mapData, map, this.blockMap);
	}

	/**
	 * ブロックマスタを設定する。
	 * @param blocks ブロックマスタ。
	 */
	@Input('blocks')
	set setBlocks(blocks: Block[]) {
		this.blockMap = modelUtils.modelsToMap(blocks, "key");
		this.stageService.updateMapData(this.mapData, this.map, this.blockMap);
	}

	/**
	 * コンポーネント起動時の処理。
	 */
	ngOnInit(): void {
		// 高速化のため、最初にマップデータを作って以後はそこに差分を反映する
		this.mapData = modelUtils.makeEmptyTable(this.xmax, this.ymax);
		this.stageService.updateMapData(this.mapData, this.map, this.blockMap);
	}
}
