/**
 * ステージ編集ページコンポーネント。
 * @module ./app/stages/stage-edit.component
 */
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Block } from '../blocks/block.model';
import { Stage } from './stage.model';
import { BlockService } from '../blocks/block.service';
import { StageService } from './stage.service';

/**
 * ステージ編集ページコンポーネントクラス。
 */
@Component({
	templateUrl: 'app/stages/stage-edit.component.html',
	providers: [
		StageService,
		BlockService,
	],
})
export class StageEditComponent implements OnInit {
	/** ステージ */
	stage: Stage;
	/** ブロックマスタ */
	blocks: Block[] = [];
	/** エラー情報 */
	error: string;

	/**
	 * サービスをDIしてコンポーネントを生成する。
	 * @param router ルートサービス。
	 * @param route ルート情報。
	 * @param stageService ステージ関連サービス。
	 * @param blockService ブロック関連サービス。
	 */
	constructor(
		private router: Router,
		private route: ActivatedRoute,
		private stageService: StageService,
		private blockService: BlockService, ) { }

	/**
	 * コンポーネント起動時の処理。
	 * @returns 処理状態。
	 */
	async ngOnInit(): Promise<void> {
		// ブロック情報を読み込み
		this.blocks = await this.blockService.findAll();

		// 初期表示ではリセットを呼び出し
		this.reset();
	}

	/**
	 * 初期表示への状態リセット。
	 * @returns 処理状態。
	 */
	async reset(): Promise<void> {
		// 一旦新規作成のデータで初期化
		this.stage = <any>{ header: { status: "private" } };

		// IDが指定された場合は、そのIDのデータを初期表示
		let stageId = this.route.snapshot.params['id'];
		if (stageId) {
			this.stage = await this.stageService.findById(stageId);
		}
	}

	/**
	 * 新規作成／更新処理。
	 * @returns 処理状態。
	 */
	async put(): Promise<void> {
		try {
			await this.stageService.save(this.stage);
			this.router.navigate(['/stages']);
		} catch (e) {
			this.error = e;
		}
	}

	/**
	 * 削除確認処理。
	 */
	confirmDelete() {
		/*
		$scope.dialogTitle = "DELETE_CONFIRMING_TITLE";
		$scope.dialogBody = "DELETE_CONFIRMING_BODY";
		let modalInstance = $uibModal.open({
			animation: true,
			ariaLabelledBy: 'modal-title',
			ariaDescribedBy: 'modal-body',
			templateUrl: 'views/confirming_dialog.html',
			size: "sm",
			scope: $scope,
		});
		modalInstance.result.then(() => this.delete());
		*/
	}

	/**
	 * 削除処理。
	 * @returns 処理状態。
	 */
	async delete(): Promise<void> {
		// IDがある場合のみ
		if (this.stage.id == undefined) {
			this.router.navigate(['/stages']);
		}
		try {
			await this.stageService.deleteById(this.stage.id);
			this.router.navigate(['/stages']);
		} catch (e) {
			this.error = e;
		}
	}

	/**
	 * ブロックの追加。
	 * @param {string} 追加する文字列。
	 */
	addBlock(word): void {
		/*
		let textarea = angular.element(document.getElementById('stage.map'));
		let p = textarea.prop("selectionStart");
		let text = this.stage.map || "";
		this.stage.map = text.slice(0, p) + word + text.slice(p);
		// カーソルを追加した文字列の後ろに移動。だがbind前にやると戻ってしまうため、時間をおいて実行
		$timeout(() => {
			textarea.prop("selectionStart", p + word.length);
			textarea.prop("selectionEnd", p + word.length);
		}, 100);
		*/
	}
}
