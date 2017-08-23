/**
 * ステージ一覧メニューコンポーネント。
 * @module ./app/stages/stage-navi.component
 */
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UserService } from '../users/user.service';

/**
 * ステージ一覧メニューコンポーネントクラス。
 */
@Component({
	selector: 'stage-navi',
	templateUrl: 'app/stages/stage-navi.component.html',
})
export class StageNaviComponent implements OnInit {
	/** ステージナビ */
	stageNavi: { title: string, href: string, auth?: string }[][] = [];

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
		this.stageNavi = this.makeNavi(this.userService.me ? this.userService.me.status : "nouser");
		this.activateNavi(this.stageNavi);
	}

	/**
	 * ユーザーに応じたナビリンクを生成する。
	 * @param auth ユーザーの権限。
	 * @returns タブ配列。
	 */
	makeNavi(auth: string): { title: string, href: string }[][] {
		let now = new Date();
		let navi = [
			[{
				title: "LATEST",
				href: "/stages",
			}],
			[{
				title: "TOP_ACCESS_TOTAL",
				href: "/rankings/play",
			}, {
				title: "TOP_ACCESS_LAST_MONTH",
				href: "/rankings/play/" + now.getFullYear() + "/" + (now.getMonth() + 1),
			}],
			[{
				title: "TOP_RATING",
				href: "/rankings/rating",
			}, {
				title: "TOP_FAVORITE",
				href: "/rankings/favorite",
			}],
			[{
				title: "TOP_ACTIVE",
				href: "/rankings/player/" + now.getFullYear() + "/" + (now.getMonth() + 1),
			}, {
				title: "TOP_CREATORS",
				href: "/rankings/creator",
			}],
			[{
				title: "FAVORITE_STAGES",
				href: "/users/me/favorites",
				auth: "user",
			}, {
				title: "FAVORITE_STAGES",
				href: "/users/me/favorites",
				auth: "admin",
			}, {
				title: "MY_STAGES",
				href: "/users/me/stages",
				auth: "user",
			}, {
				title: "MY_STAGES",
				href: "/users/me/stages",
				auth: "admin",
			}],
		];

		for (let i = 0; i < navi.length; i++) {
			navi[i] = (<any>navi[i]).filter((v) => !v.auth || v.auth == auth);
		}
		return navi.filter((sub) => sub.length > 0);
	}

	/**
	 * 選択中のナビをアクティブにする。
	 * @param navi ナビ配列。
	 */
	activateNavi(navi: { href: string, active?: boolean }[][]): void {
		this.route.url.subscribe((urls) => {
			let path = '/';
			if (urls.length > 0) {
				path += urls[0].path;
			}
			for (let i = 0; i < navi.length; i++) {
				for (let j = 0; j < navi[i].length; j++) {
					navi[i][j].active = navi[i][j].href == path;
				}
			}
		});
	}
}
