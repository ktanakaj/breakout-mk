/**
 * ユーザー登録ページコンポーネント。
 * @module ./app/users/user-new.component
 */
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { User } from './user.model';
import { UserService } from './user.service';

/**
 * ユーザー登録ページコンポーネントクラス。
 */
@Component({
	templateUrl: './user-new.component.html',
})
export class UserNewComponent {
	/** 新規ユーザー */
	user: User = { id: null, name: '', password: '', status: 'user', comment: '' };
	/** エラー情報 */
	error = '';

	/**
	 * サービスをDIしてコンポーネントを生成する。
	 * @param router ルートサービス。
	 * @param userService ユーザー関連サービス。
	 */
	constructor(
		private router: Router,
		private userService: UserService) { }

	/**
	 * ユーザーを登録する。
	 * @returns 処理状態。
	 */
	async signup(): Promise<void> {
		try {
			// ユーザーを登録。認証も行われる
			await this.userService.signup(this.user);
			this.router.navigate(['/']);
		} catch (e) {
			if (!(e instanceof HttpErrorResponse) || e.status !== 400) {
				throw e;
			}
			this.error = `ERROR.${e.error}`;
		}
	}
}
