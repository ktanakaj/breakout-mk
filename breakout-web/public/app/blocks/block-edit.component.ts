/**
 * ブロック編集ページコンポーネント。
 * @module ./app/blocks/block-edit.component
 */
import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Block } from './block.model';
import { BlockService } from './block.service';

/** ブロックの初期値 */
const DEFAULT_BLOCK: Block = { key: '', name: '', status: "enable", hp: 1, score: 1, xsize: 2, ysize: 1, color: '#000000' };

/**
 * ブロック編集ページコンポーネントクラス。
 */
@Component({
	templateUrl: 'app/blocks/block-edit.component.html',
	providers: [
		BlockService,
	],
})
export class BlockEditComponent implements OnInit {
	/** 編集中のブロック */
	block: Block = DEFAULT_BLOCK;
	/** エラー情報 */
	error: string = '';

	/**
	 * サービスをDIしてコンポーネントを生成する。
	 * @param router ルートサービス。
	 * @param route ルート情報。
	 * @param blockService ブロック関連サービス。
	 */
	constructor(
		private router: Router,
		private route: ActivatedRoute,
		private blockService: BlockService) { }

	/**
	 * コンポーネント起動時の処理。
	 * @returns 処理状態。
	 */
	async ngOnInit(): Promise<void> {
		// 初期表示ではリセットを呼び出し
		await this.reset();
	}

	/**
	 * 初期表示への状態リセット。
	 * @returns 処理状態。
	 */
	async reset(): Promise<void> {
		// 一旦新規作成のデータで初期化
		// ※ 現状インゲームが未対応のため、ブロックのサイズは固定
		// TODO: サイズを可変に戻す
		this.block = Object.assign({}, DEFAULT_BLOCK);

		// キーが指定された場合は、そのIDのデータを初期表示
		const key = this.route.snapshot.params['key'];
		if (key) {
			this.block = await this.blockService.findById(key);
		}
	}

	/**
	 * 新規作成／更新処理。
	 * @returns 処理状態。
	 */
	async put(): Promise<void> {
		try {
			await this.blockService.save(this.block);
			this.router.navigate(['/blocks/']);
		} catch (e) {
			if (e.name === 'BadRequestError') {
				return this.error = e.message;
			}
			throw e;
		}
	}
}