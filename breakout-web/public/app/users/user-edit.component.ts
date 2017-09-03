/**
 * ユーザー情報の編集ページコンポーネント。
 * @module ./app/users/user-edit.component
 */
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
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
	 * @function reset
	 */
	async reset(): Promise<void> {
		let userId = this.route.snapshot.params['id'];
		this.user = await this.userService.findById(userId);
	};

	/**
	 * 更新処理。
	 * @function put
	 */
	async put(): Promise<void> {
		try {
			await this.userService.update(this.user);
			this.router.navigate(['/users']);
		} catch (e) {
			if (e.name === 'BadRequestError') {
				return this.error = e.message;
			}
			throw e;
		}
	};
}
