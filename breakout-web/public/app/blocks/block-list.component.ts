/**
 * ブロック一覧ページコンポーネント。
 * @module ./app/blocks/block-list.component
 */
import { Component, OnInit } from '@angular/core';
import { Block } from './block.model';
import { UserService } from '../users/user.service';
import { BlockService } from './block.service';

/**
 * ブロック一覧ページコンポーネントクラス。
 */
@Component({
	templateUrl: 'app/blocks/block-list.component.html',
	providers: [
		BlockService,
	],
})
export class BlockListComponent implements OnInit {
	/** ブロック一覧 */
	blocks: Block[] = [];

	/**
	 * サービスをDIしてコンポーネントを生成する。
	 * @param userService ユーザー関連サービス。
	 * @param blockService ブロック関連サービス。
	 */
	constructor(
		private userService: UserService,
		private blockService: BlockService) { }

	/**
	 * コンポーネント起動時の処理。
	 */
	async ngOnInit(): Promise<void> {
		this.blocks = await this.blockService.findAll();
	}
}
