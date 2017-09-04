/**
 * ユーザーのお気に入りステージ一覧ページコンポーネント。
 * @module ./app/users/user-favorite.component
 */
import { Component, OnInit } from '@angular/core';
import { Stage } from '../stages/stage.model';
import { StageService } from '../stages/stage.service';
import { UserService } from './user.service';

/**
 * ユーザーのお気に入りステージ一覧ページコンポーネントクラス。
 */
@Component({
	templateUrl: 'app/users/user-favorite.component.html',
	providers: [
		StageService,
	],
})
export class UserFavoriteComponent implements OnInit {
	/** ステージ一覧 */
	stages: Stage[] = [];

	/**
	 * サービスをDIしてコンポーネントを生成する。
	 * @param userService ユーザー関連サービス。
	 * @param stageService ステージ関連サービス。
	 */
	constructor(
		private userService: UserService,
		private stageService: StageService) { }

	/**
	 * コンポーネント起動時の処理。
	 * @returns 処理状態。
	 */
	async ngOnInit(): Promise<void> {
		this.stages = await this.stageService.findFavoriteByMe();
	}
}
