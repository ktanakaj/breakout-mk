/**
 * @file ヘッダーナビコンポーネント。
 */
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '../users/user.model';
import { UserService } from '../users/user.service';

/**
 * ヘッダーナビコンポーネントクラス。
 */
@Component({
	selector: 'header-navi',
	templateUrl: 'app/core/header-navi.component.html',
})
export class HeaderNaviComponent {
	/** ナビの折り畳み状態 */
	isCollapsed: boolean = true;
	/** ナビ定義 */
	navi: { title: string, href: string, option?: string }[] = [];

	/**
	 * サービスをDIしてコンポーネントを生成する。
	 * @param router ルートサービス。
	 * @param userService ユーザー関連サービス。
	 */
	constructor(
		private router: Router,
		private userService: UserService) { }

	/**
	 * コンポーネント起動時の処理。
	 */
	async ngOnInit(): Promise<void> {
		// ナビを初期化&認証時に更新するよう設定
		this.updateNavi();
		this.userService.on('login', () => this.updateNavi());
		this.userService.on('logout', () => this.updateNavi());

		// ページ移動時はナビを折りたたむ（スマホ対応）
		this.router.events.subscribe(() => {
			this.isCollapsed = true;
		});
	}

	/**
	 * ナビを現在の状態に更新する。
	 */
	updateNavi(): void {
		this.navi = this.makeNavi(this.userService.me || <any>{ name: '', status: "nouser" });
	}

	/**
	 * ユーザーに応じたナビリンクを生成する。
	 * @param user ユーザー情報。
	 * @returns タブ配列。
	 */
	makeNavi(user: User): { title: string, href: string, option?: string }[] {
		return [
			// 未認証
			{
				title: "HEADER_NAVI.STAGES",
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
				title: "HEADER_NAVI.STAGES_USER",
				href: "/stages",
				auth: "user",
			},
			{
				title: "HEADER_NAVI.BLOCKS",
				href: "/blocks",
				auth: "user",
			},
			{
				title: "HEADER_NAVI.USER_ME",
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
				title: "HEADER_NAVI.STAGES_ADMIN",
				href: "/stages",
				auth: "admin",
			},
			{
				title: "HEADER_NAVI.BLOCKS_ADMIN",
				href: "/blocks",
				auth: "admin",
			},
			{
				title: "HEADER_NAVI.USERS_ADMIN",
				href: "/users",
				auth: "admin",
			},
			{
				title: "HEADER_NAVI.USER_ME",
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
