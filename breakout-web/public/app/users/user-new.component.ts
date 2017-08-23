/**
 * ユーザー登録ページコンポーネント。
 * @module ./app/users/user-new.component
 */
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { User } from './user.model';
import { UserService } from './user.service';

/**
 * ユーザー登録ページコンポーネントクラス。
 */
@Component({
	templateUrl: 'app/users/user-new.component.html',
})
export class UserNewComponent {
	/** 新規ユーザー */
	user: User = { id: null, name: '', password: '', status: 'user', comment: '' };
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
	 * ユーザーを登録する。
	 * @returns 処理状態。
	 */
	async signup(): Promise<void> {
		try {
			// ユーザーを登録。認証も行われる
			await this.userService.insert(this.user);
			this.router.navigate(['/']);
		} catch (e) {
			this.error = e ? e.message : e;
		}
	}
}
