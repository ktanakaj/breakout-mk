/**
 * ステージマップバリデーターディレクティブ。
 * @module app/shared/map-format-validator.directive.ts
 */
import { Directive, Input, forwardRef } from '@angular/core';
import { Validator, AbstractControl, NG_VALIDATORS } from '@angular/forms';
import modelUtils from '../core/model-utils';
import { Block } from '../blocks/block.model';
import { StageService } from './stage.service';

/**
 * ステージマップバリデーターディレクティブクラス。
 */
@Directive({
	selector: '[validateMapFormat][formControlName],[validateMapFormat][formControl],[validateMapFormat][ngModel]',
	providers: [
		{ provide: NG_VALIDATORS, useExisting: forwardRef(() => MapFormatValidator), multi: true }
	]
})
export class MapFormatValidator implements Validator {
	/** マップX方向サイズ */
	xmax = 0;
	/** マップY方向サイズ */
	ymax = 0;
	/** ブロックマスタ */
	blockMap: Object = {};
	/** マップデータ */
	mapData: Block[][] = [];

	/**
	 * バリデーターを生成する。
	 * @param stageService ユーザー関連サービス。
	 */
	constructor(
		private stageService: StageService) { }

	/**
	 * マップ文字列を設定する。
	 * @param map マップ文字列。
	 */
	@Input('validateMapFormat')
	set setValidateMapFormat(params: { xmax: number, ymax: number, blocks: Block[] }) {
		this.xmax = params.xmax || 99;
		this.ymax = params.ymax || 99;
		this.blockMap = modelUtils.modelsToMap(params.blocks || [], "key");
		this.mapData = modelUtils.makeEmptyTable(this.xmax, this.ymax);
	}

	/**
	 * バリデーションを行う。
	 * @param c コントロール。
	 * @returns バリデーション結果。
	 */
	validate(c: AbstractControl): { [key: string]: any } {
		// 自身の値
		const v = c.value;

		// 現在の入力値をマップデータに反映
		this.stageService.updateMapData(this.mapData, v, this.blockMap);
		if (!v) {
			// 空はバリデート対象外
			return;
		}

		// サイズオーバーのチェック
		// ※ サイズオーバーがなければループに入らず一瞬で終わるはず
		for (let y = this.mapData.length - 1; y >= this.ymax; y--) {
			for (let x = this.mapData[y].length - 1; x >= 0; x--) {
				if (this.mapData[y][x]) {
					// サイズY MAX以上の位置にオブジェクト有
					return {
						validateMapFormat: true
					};
				}
			}
		}
		for (let y = this.mapData.length - 1; y >= 0; y--) {
			for (let x = this.mapData[y].length - 1; x >= this.xmax; x--) {
				if (this.mapData[y][x]) {
					// サイズX MAX以上の位置にオブジェクト有
					return {
						validateMapFormat: true
					};
				}
			}
		}

		// ブロック発見のチェック
		// ※ ブロックがあれば一瞬で終わるはず
		for (let y = this.mapData.length - 1; y >= 0; y--) {
			for (let x = this.mapData[y].length - 1; x >= 0; x--) {
				if (this.mapData[y][x]) {
					return;
				}
			}
		}
		return {
			validateMapFormat: true
		};
	}
}
