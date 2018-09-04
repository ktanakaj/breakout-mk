/**
 * ユーザーのプレイログの表示ページコンポーネント。
 * @module ./app/users/user-playlog.component
 */
import { Component, OnInit } from '@angular/core';
import { Playlog } from './playlog.model';
import { UserService } from './user.service';

/**
 * ユーザーのプレイログの表示ページコンポーネントクラス。
 */
@Component({
	templateUrl: './user-playlog.component.html',
})
export class UserPlaylogComponent implements OnInit {
	/** プレイログ一覧 */
	playlogs: Playlog[] = [];

	/**
	 * サービスをDIしてコンポーネントを生成する。
	 * @param route ルート情報。
	 * @param userService ユーザー関連サービス。
	 */
	constructor(
		private userService: UserService) { }

	/**
	 * コンポーネント起動時の処理。
	 * @returns 処理状態。
	 */
	async ngOnInit(): Promise<void> {
		// プレイログを読み込み
		this.playlogs = await this.userService.findPlaylogs();
	}
}
