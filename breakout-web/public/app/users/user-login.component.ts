/**
 * ログインページコンポーネント。
 * @module ./app/users/user-login.component
 */
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from './user.service';

/**
 * ログインページコンポーネントクラス。
 */
@Component({
	templateUrl: 'app/users/user-login.component.html',
})
export class UserLoginComponent implements OnInit {
	/** ログインユーザー */
	user: { name: string, password: string } = { name: '', password: '' };
	/** エラー情報 */
	error: string = '';

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
	ngOnInit(): void {
		// 認証済みの場合トップページに飛ばす
		if (this.userService.me) {
			this.router.navigate(['/']);
		}
	}

	/**
	 * ログインする。
	 * @returns 処理状態。
	 */
	async login(): Promise<void> {
		try {
			await this.userService.login(this.user.name, this.user.password);
			this.router.navigate([this.userService.backupUrl || '/']);
		} catch (e) {
			if (e.name === 'UnauthorizedError') {
				// TODO: 専用のメッセージに変える
				return this.error = e.message;
			}
			throw e;
		}
	}
}
