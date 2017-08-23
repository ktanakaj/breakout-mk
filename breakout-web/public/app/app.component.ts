/**
 * @file ブロックくずしメーカールートコンポーネント。
 */
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import browserHelper from './core/browser-helper';
import { UserService } from './users/user.service';

/**
 * ブロックくずしメーカーコンポーネントクラス。
 */
@Component({
	selector: 'app-root',
	templateUrl: 'app/app.component.html',
})
export class AppComponent {
	/** ナビの折り畳み状態 */
	isCollapsed: boolean = true;
	/** ナビ定義 */
	navi: { title: string, href: string, option?: string }[] = [];

	/**
	 * サービスをDIしてコンポーネントを生成する。
	 * @param router ルートサービス。
	 * @param translate 国際化サービス。
	 * @param userService ユーザー関連サービス。
	 */
	constructor(
		private router: Router,
		private translate: TranslateService,
		private userService: UserService) { }

	/**
	 * コンポーネント起動時の処理。
	 */
	async ngOnInit(): Promise<void> {
		// アプリで使用する言語を設定
		this.translate.setDefaultLang('en');
		this.translate.use(browserHelper.getLanguage());

		// ナビを読み込み&認証時に更新するよう設定
		this.navi = this.makeNavi();
		this.userService.on('login', () => { this.navi = this.makeNavi(); });
		this.userService.on('logout', () => { this.navi = this.makeNavi(); });

		// ページ移動時はナビを折りたたむ（スマホ）
		this.router.events.subscribe(() => {
			this.isCollapsed = true;
		});
	}

	/**
	 * ユーザーに応じたナビリンクを生成する。
	 * @returns タブ配列。
	 */
	makeNavi(): { title: string, href: string, option?: string }[] {
		let user = this.userService.me || { name: '', status: "nouser" };
		return [
			// 未認証
			{
				title: "STAGES",
				href: "/stages",
				auth: "nouser",
			},
			{
				title: "SIGN_UP",
				href: "/users/new",
				auth: "nouser",
			},
			{
				title: "LOGIN",
				href: "/users/login",
				auth: "nouser",
			},
			// 認証済
			{
				title: "STAGES_USER",
				href: "/stages",
				auth: "user",
			},
			{
				title: "BLOCKS",
				href: "/blocks",
				auth: "user",
			},
			{
				title: "USER_ME",
				option: "(" + user.name + ")",
				href: "/users/me",
				auth: "user",
			},
			{
				title: "LOGOUT",
				href: "/users/logout",
				auth: "user",
			},
			// 管理者
			{
				title: "STAGES_ADMIN",
				href: "/stages",
				auth: "admin",
			},
			{
				title: "BLOCKS_ADMIN",
				href: "/blocks",
				auth: "admin",
			},
			{
				title: "USERS_ADMIN",
				href: "/users",
				auth: "admin",
			},
			{
				title: "USER_ME",
				option: "(" + user.name + ")",
				href: "/users/me",
				auth: "admin",
			},
			{
				title: "LOGOUT",
				href: "/users/logout",
				auth: "admin",
			},
		].filter((v) => !v.auth || v.auth == user.status);
	}
}
