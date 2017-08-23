/**
 * ログアウト処理コンポーネント。
 * @module ./app/users/user-logout.component
 */
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from './user.service';

/**
 * ログアウト処理コンポーネントクラス。
 */
@Component({
	template: "",
})
export class UserLogoutComponent implements OnInit {
	/**
	 * サービスをDIしてコンポーネントを生成する。
	 * @param router ルートサービス。
	 * @param userService ユーザー関連サービス。
	 */
	constructor(
		private router: Router,
		private userService: UserService) { }

	/**
	 * コンポーネント起動時の処理。
	 */
	async ngOnInit(): Promise<void> {
		await this.userService.logout();
		this.router.navigate(['/']);
	}
}
