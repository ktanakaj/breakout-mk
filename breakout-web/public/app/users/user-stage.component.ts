/**
 * ユーザーのステージ一覧ページコンポーネント。
 * @module ./app/users/user-stage.component
 */
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Stage } from '../stages/stage.model';
import { User } from './user.model';
import { StageService } from '../stages/stage.service';
import { UserService } from './user.service';

/**
 * ユーザーのステージ一覧ページコンポーネントクラス。
 */
@Component({
	templateUrl: 'app/users/user-stage.component.html',
	providers: [
		StageService,
	],
})
export class UserStageComponent implements OnInit {
	/** ユーザー */
	user: User;
	/** ステージ一覧 */
	stages: Stage[] = [];

	/**
	 * サービスをDIしてコンポーネントを生成する。
	 * @param route ルート情報。
	 * @param userService ユーザー関連サービス。
	 * @param stageService ステージ関連サービス。
	 */
	constructor(
		private route: ActivatedRoute,
		private userService: UserService,
		private stageService: StageService) { }

	/**
	 * コンポーネント起動時の処理。
	 * @returns 処理状態。
	 */
	async ngOnInit(): Promise<void> {
		// パラメータからユーザーID取得
		let userId = this.route.snapshot.params['id'];
		if (!userId && this.userService.me) {
			userId = this.userService.me.id;
		}

		// ユーザーとステージを読み込み
		this.user = await this.userService.findById(userId);
		this.stages = await this.stageService.findByUser(userId);
	}
}
