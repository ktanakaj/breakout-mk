/**
 * ユーザー情報の編集ページコンポーネント。
 * @module ./app/users/user-edit.component
 */
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { User } from './user.model';
import { UserService } from './user.service';

/**
 * ユーザー情報の編集ページコンポーネントクラス。
 */
@Component({
	templateUrl: 'app/users/user-edit.component.html',
})
export class UserEditComponent implements OnInit {
	/** ユーザー */
	user: User;
	/** エラー情報 */
	error: string;

	/**
	 * サービスをDIしてコンポーネントを生成する。
	 * @param route ルート情報。
	 * @param router ルートサービス。
	 * @param userService ユーザー関連サービス。
	 */
	constructor(
		private route: ActivatedRoute,
		private router: Router,
		private userService: UserService) { }

	/**
	 * コンポーネント起動時の処理。
	 * @returns 処理状態。
	 */
	async ngOnInit(): Promise<void> {
		await this.reset();
	}

	/**
	 * 初期表示への状態リセット。
	 * @returns 処理状態。
	 */
	async reset(): Promise<void> {
		let userId = this.route.snapshot.params['id'];
		this.user = await this.userService.findById(userId);
	}

	/**
	 * 更新処理。
	 * @returns 処理状態。
	 */
	async put(): Promise<void> {
		try {
			await this.userService.update(this.user);
			// 管理者は一覧画面へ、それ以外は自分を変更したはずなので自分の情報へ戻る
			if (this.userService.me.status === 'admin') {
				this.router.navigate(['/users']);
			} else {
				this.router.navigate(['/users/me']);
			}
		} catch (e) {
			if (!(e instanceof HttpErrorResponse) || e.status !== 400) {
				throw e;
			}
			this.error = `ERROR.${e.error}`;
		}
	}
}
