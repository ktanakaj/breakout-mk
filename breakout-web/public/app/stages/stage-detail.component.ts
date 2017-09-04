/**
 * ステージ詳細ページコンポーネント。
 * @module ./app/stages/stage-detail.component
 */
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Block } from '../blocks/block.model';
import { ScoreRankingEntry } from '../rankings/ranking.model';
import { StageWithInfo, StageComment } from './stage.model';
import { UserService } from '../users/user.service';
import { BlockService } from '../blocks/block.service';
import { RankingService } from '../rankings/ranking.service';
import { StageService } from './stage.service';

/**
 * ステージ詳細ページコンポーネントクラス。
 */
@Component({
	templateUrl: 'app/stages/stage-detail.component.html',
	providers: [
		StageService,
		BlockService,
		RankingService,
	],
})
export class StageDetailComponent implements OnInit {
	/** ステージ */
	stage: StageWithInfo;
	/** ブロックマスタ */
	blocks: Block[] = [];
	/** ステージのハイスコアランキング */
	rankings: ScoreRankingEntry[] = [];
	/** ハイスコアランキングのキー情報 */
	keys: string[][] = [];
	/** 選択中のランキングキー */
	selected: string[];
	/** ステージコメント */
	comment: StageComment;
	// { status: "public" }
	/** エラー情報 */
	error: string;

	/**
	 * サービスをDIしてコンポーネントを生成する。
	 * @param router ルートサービス。
	 * @param route ルート情報。
	 * @param userService ユーザー関連サービス。
	 * @param stageService ステージ関連サービス。
	 * @param blockService ブロック関連サービス。
	 * @param rankingService ランキング関連サービス。
	 */
	constructor(
		private router: Router,
		private route: ActivatedRoute,
		private userService: UserService,
		private stageService: StageService,
		private blockService: BlockService,
		private rankingService: RankingService) { }

	/**
	 * コンポーネント起動時の処理。
	 * @returns 処理状態。
	 */
	async ngOnInit(): Promise<void> {
		// パラメータからキー生成
		const params = this.route.snapshot.params;
		this.selected = [params['year'], params['month']];

		// ステージIDから画面表示に必要な情報を取得
		const id = params['id'];
		this.stage = await this.stageService.findByIdWithAllInfo(id);
		this.blocks = await this.blockService.findAll();
		this.rankings = await this.rankingService.findStageScoreRanking(id, this.selected, 0, 50);
		this.keys = await this.rankingService.findStageScoreRankingKeys(id);
	}

	/**
	 * コメント新規投稿／更新処理。
	 * @returns 処理状態。
	 */
	async postComment(): Promise<void> {
		try {
			await this.stageService.saveComment(this.stage.id, this.comment)
			this.router.navigate([`/stages/${this.stage.id}`]);
		} catch (e) {
			this.error = e;
		}
	};

	/**
	 * コメント削除確認処理。
	 * @param commentId 削除するコメントのID。
	 */
	confirmDeleteComment(commentId: number) {
		/*
		$scope.dialogTitle = "DELETE_CONFIRMING_TITLE";
		$scope.dialogBody = "DELETE_CONFIRMING_BODY";
		let modalInstance = $uibModal.open({
			animation: true,
			ariaLabelledBy: 'modal-title',
			ariaDescribedBy: 'modal-body',
			templateUrl: 'parts/confirming_dialog.html',
			size: "sm",
			scope: $scope,
		});
		modalInstance.result.then(() => this.deleteComment(commentId));
		*/
	};

	/**
	 * コメント削除処理。
	 * @param commentId 削除するコメントのID。
	 * @returns 処理状態。
	 */
	async deleteComment(commentId: number): Promise<void> {
		try {
			await this.stageService.deleteCommentById(this.stage.id, commentId);
			this.router.navigate([`/stages/${this.stage.id}`]);
		} catch (e) {
			this.error = e;
		}
	};

	/**
	 * レーティング設定。
	 * @returns 処理状態。
	 */
	async rate(): Promise<void> {
		// TODO: レーティングの動作は見直し
		if (this.stage.info.user.rating) {
			try {
				await this.stageService.rate(this.stage.id, this.stage.info.user.rating);
			} catch (e) {
				this.error = e;
			}
		}
	};

	/**
	 * レーティング表示更新。
	 * @param $value レーティング値。
	 */
	hoveringOver(value: number): void {
		// TODO: レーティングの動作は見直し
		this.stage.info.user.rating = value;
	};

	/**
	 * お気に入り登録。
	 * @returns 処理状態。
	 */
	async addFavorite(): Promise<void> {
		try {
			await this.stageService.addFavorite(this.stage.id);
			this.stage.info.user.favorited = true;
		} catch (e) {
			this.error = e;
		}
	};

	/**
	 * お気に入り削除。
	 * @returns 処理状態。
	 */
	async removeFavorite(): Promise<void> {
		try {
			await this.stageService.removeFavorite(this.stage.id);
			this.stage.info.user.favorited = false;
		} catch (e) {
			this.error = e;
		}
	};
}
