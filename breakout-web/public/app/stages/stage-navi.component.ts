/**
 * ステージ一覧メニューコンポーネント。
 * @module ./app/stages/stage-navi.component
 */
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, UrlSegment } from '@angular/router';
import { UserService } from '../users/user.service';

/** 現在日時 */
const NOW = new Date();
/** ナビひな型 */
const NAVI: ReadonlyArray<{ title: string, href: string, auth?: string }[]> = Object.freeze([
	[{
		title: "STAGE_NAVI.LATEST",
		href: "/stages",
	}],
	[{
		title: "STAGE_NAVI.TOP_ACCESS_TOTAL",
		href: "/rankings/play",
	}, {
		title: "STAGE_NAVI.TOP_ACCESS_LAST_MONTH",
		href: "/rankings/play/" + NOW.getFullYear() + "/" + (NOW.getMonth() + 1),
	}],
	[{
		title: "STAGE_NAVI.TOP_RATING",
		href: "/rankings/rating",
	}, {
		title: "STAGE_NAVI.TOP_FAVORITE",
		href: "/rankings/favorite",
	}],
	[{
		title: "STAGE_NAVI.TOP_ACTIVE",
		href: "/rankings/player/" + NOW.getFullYear() + "/" + (NOW.getMonth() + 1),
	}, {
		title: "STAGE_NAVI.TOP_CREATORS",
		href: "/rankings/creator",
	}],
	[{
		title: "STAGE_NAVI.FAVORITE",
		href: "/users/me/favorites",
		auth: "user",
	}, {
		title: "STAGE_NAVI.FAVORITE",
		href: "/users/me/favorites",
		auth: "admin",
	}, {
		title: "STAGE_NAVI.MY_STAGES",
		href: "/users/me/stages",
		auth: "user",
	}, {
		title: "STAGE_NAVI.MY_STAGES",
		href: "/users/me/stages",
		auth: "admin",
	}],
]);

/**
 * ステージ一覧メニューコンポーネントクラス。
 */
@Component({
	selector: 'stage-navi',
	templateUrl: 'app/stages/stage-navi.component.html',
})
export class StageNaviComponent implements OnInit {
	/** ステージナビ */
	stageNavi: { title: string, href: string, active?: boolean }[][] = [];

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
		// ナビを作成
		this.stageNavi = this.makeNavi(this.userService.me ? this.userService.me.status : "nouser");

		// 画面移動に応じて現在値選択
		this.route.url.subscribe(async (url: UrlSegment[]) => {
			this.activateNavi(url);
		});

		// 認証状態変化に応じて再作成
		this.userService.on('login', (user) => {
			this.stageNavi = this.makeNavi(user.status);
			this.activateNavi(this.route.snapshot.url);
		});
		this.userService.on('logout', () => {
			this.stageNavi = this.makeNavi("nouser");
			this.activateNavi(this.route.snapshot.url);
		});
	}

	/**
	 * ユーザーに応じたナビリンクを生成する。
	 * @param auth ユーザーの権限。
	 * @returns タブ配列。
	 */
	makeNavi(auth: string): { title: string, href: string }[][] {
		let navi: { title: string, href: string }[][] = [];
		for (let i = 0; i < NAVI.length; i++) {
			navi[i] = (<any>NAVI[i]).filter((v) => !v.auth || v.auth === auth);
		}
		return navi.filter((sub) => sub.length > 0);
	}

	/**
	 * 選択中のナビをアクティブにする。
	 * @param url 表示中のURL。
	 */
	activateNavi(url: UrlSegment[]): void {
		let path = '/';
		if (url.length > 0) {
			path += url[0].path;
		}
		for (let i = 0; i < this.stageNavi.length; i++) {
			for (let j = 0; j < this.stageNavi[i].length; j++) {
				this.stageNavi[i][j].active = this.stageNavi[i][j].href === path;
			}
		}
	}
}
