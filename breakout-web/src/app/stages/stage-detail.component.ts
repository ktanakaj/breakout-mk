/**
 * ステージ詳細ページコンポーネント。
 * @module ./app/stages/stage-detail.component
 */
import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router, Params } from '@angular/router';
import { ModalDirective } from 'ngx-bootstrap/modal';
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
	templateUrl: './stage-detail.component.html',
	providers: [
		StageService,
		BlockService,
		RankingService,
	],
})
export class StageDetailComponent implements OnInit {
	/** ステージID */
	stageId: number;
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
	commentForm: StageComment = <any>{ status: 'public' };
	/** エラー情報 */
	error: string;

	/** 選択中のコメント */
	selectedComment;
	/** 削除確認モーダル */
	@ViewChild('confirmModal') public confirmModal: ModalDirective;

	/**
	 * サービスをDIしてコンポーネントを生成する。
	 * @param route ルート情報。
	 * @param userService ユーザー関連サービス。
	 * @param stageService ステージ関連サービス。
	 * @param blockService ブロック関連サービス。
	 * @param rankingService ランキング関連サービス。
	 */
	constructor(
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
		// ブロックを読み込み
		this.blocks = await this.blockService.findAll();

		// パラメータからステージID、ランキングキーを読み込み詳細表示
		this.route.params.subscribe(async (params: Params) => {
			this.stageId = params['id'];
			this.selected = [params['year'], params['month']];
			await this.reset();
		});
	}

	/**
	 * ページ表示情報を読み込む。
	 * @returns 処理状態。
	 */
	async reset() {
		this.stage = await this.stageService.findByIdWithAllInfo(this.stageId);
		this.keys = await this.rankingService.findStageScoreRankingKeys(this.stageId);
		this.rankings = await this.rankingService.findStageScoreRanking(this.stageId, this.selected, 0, 50);
	}

	/**
	 * コメント新規投稿／更新処理。
	 * @returns 処理状態。
	 */
	async postComment(): Promise<void> {
		this.error = '';
		try {
			await this.stageService.saveComment(this.stageId, this.commentForm);
			this.commentForm.comment = '';
			await this.reset();
		} catch (e) {
			this.error = e;
		}
	}

	/**
	 * コメント削除確認処理。
	 * @param comment 削除するコメント。
	 */
	confirmDeleteComment(comment: StageComment) {
		this.selectedComment = comment;
		this.confirmModal.show();
	}

	/**
	 * コメント削除処理。
	 * @param comment 削除するコメント。
	 * @returns 処理状態。
	 */
	async deleteComment(comment: StageComment): Promise<void> {
		try {
			await this.stageService.deleteCommentById(this.stageId, comment.id);
			await this.reset();
			this.confirmModal.hide();
		} catch (e) {
			this.error = e;
		}
	}

	/**
	 * レーティング設定。
	 * @returns 処理状態。
	 */
	async rate(): Promise<void> {
		if (this.stage.info.user.rating) {
			try {
				await this.stageService.rate(this.stage.id, this.stage.info.user.rating);
			} catch (e) {
				this.error = e;
			}
		}
	}

	/**
	 * レーティング表示更新。
	 * @param value レーティング値。
	 */
	hoveringOver(value: number): void {
		this.stage.info.user.rating = value;
	}

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
	}

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
	}
}
