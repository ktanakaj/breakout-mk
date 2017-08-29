/**
 * ユーザーのプレイログの表示ページコンポーネント。
 * @module ./app/users/user-playlog.component
 */
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { User } from './user.model';
import { Playlog } from './playlog.model';
import { UserService } from './user.service';

/**
 * ユーザーのプレイログの表示ページコンポーネントクラス。
 */
@Component({
	templateUrl: 'app/users/user-playlog.component.html',
})
export class UserPlaylogComponent implements OnInit {
	/** ユーザー */
	user: User;
	/** プレイログ一覧 */
	playlogs: Playlog[] = [];

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
	 */
	async ngOnInit(): Promise<void> {
		this.route.params.subscribe(async (params: Params) => {
			// パラメータからユーザーID取得
			const id = Number(params['id']);

			// ユーザーとプレイログを読み込み
			this.user = await this.userService.findById(id);
			this.playlogs = await this.userService.findPlaylogs(id);
		});
	}
}
