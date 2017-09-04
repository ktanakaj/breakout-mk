/**
 * ユーザー一覧ページコンポーネント。
 * @module ./app/users/user-list.component
 */
import { Component, OnInit } from '@angular/core';
import { User } from './user.model';
import { UserService } from './user.service';

/**
 * ユーザー一覧ページコンポーネントクラス。
 */
@Component({
	templateUrl: 'app/users/user-list.component.html',
})
export class UserListComponent implements OnInit {
	/** ユーザー一覧 */
	users: User[] = [];

	/**
	 * サービスをDIしてコンポーネントを生成する。
	 * @param userService ユーザー関連サービス。
	 */
	constructor(
		private userService: UserService) { }

	/**
	 * コンポーネント起動時の処理。
	 * @returns 処理状態。
	 */
	async ngOnInit(): Promise<void> {
		this.users = await this.userService.findAll();
	}
}
