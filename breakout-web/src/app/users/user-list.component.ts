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
	templateUrl: './user-list.component.html',
})
export class UserListComponent implements OnInit {
	/** ユーザー総数 */
	count: number;
	/** ユーザー一覧 */
	rows: User[];
	/** 選択中のページ */
	currentPage = 1;
	/** 1ページの表示件数 */
	pageMax = 60;
	/** ページングのページ数の表示最大値 */
	maxSize = 10;

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
		await this.load(this.currentPage);
	}

	/**
	 * ユーザー一覧を検索する。
	 * @param page ページ番号。
	 * @returns 処理状態。
	 */
	async load(page: number): Promise<void> {
		const info = await this.userService.findAllAndCount(page, this.pageMax);
		this.count = info.count;
		this.rows = info.rows;
	}
}
