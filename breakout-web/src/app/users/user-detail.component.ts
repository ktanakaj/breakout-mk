/**
 * ユーザー情報の表示ページコンポーネント。
 * @module ./app/users/user-detail.component
 */
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { User } from './user.model';
import { UserService } from './user.service';

/**
 * ユーザー情報の表示ページコンポーネントクラス。
 */
@Component({
	templateUrl: './user-detail.component.html',
})
export class UserDetailComponent implements OnInit {
	/** ユーザー */
	user: User;

	/**
	 * サービスをDIしてコンポーネントを生成する。
	 * @param route ルート情報。
	 * @param userService ユーザー関連サービス。
	 */
	constructor(
		private route: ActivatedRoute,
		private userService: UserService) { }

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

		// ユーザーを読み込み
		this.user = await this.userService.findByIdWithAllInfo(userId);
	}
}
