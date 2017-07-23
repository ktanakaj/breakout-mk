/**
 * @file ブロックくずしメーカールートコンポーネント。
 */
import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import browserHelper from './core/browser-helper';

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
	 * @param translate 国際化サービス。
	 */
	constructor(
		private translate: TranslateService) { }

	/**
	 * コンポーネント起動時の処理。
	 */
	async ngOnInit(): Promise<void> {
		// アプリで使用する言語を設定
		this.translate.setDefaultLang('en');
		this.translate.use(browserHelper.getLanguage());

		// ナビを読み込み
		this.navi = this.makeNavi('nouser', '');
		// TODO: ナビの認証・ページ移動時の折り畳み対応
	}

	/**
	 * ユーザーに応じたナビリンクを生成する。
	 * @param auth ユーザーの権限。
	 * @param name ユーザー名。
	 * @returns タブ配列。
	 */
	makeNavi(auth: string, name: string): { title: string, href: string, option?: string }[] {
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
				option: "(" + name + ")",
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
				option: "(" + name + ")",
				href: "/users/me",
				auth: "admin",
			},
			{
				title: "LOGOUT",
				href: "/users/logout",
				auth: "admin",
			},
		].filter((v) => !v.auth || v.auth == auth);
	}
}
