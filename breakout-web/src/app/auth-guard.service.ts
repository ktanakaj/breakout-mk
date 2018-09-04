/**
 * @file ブロックくずしメーカー認証アクセス制限モジュール。
 */
import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { UserService } from './users/user.service';

/**
 * 認証アクセス制限クラス。
 */
@Injectable()
export class AuthGuard implements CanActivate {
	/**
	 * サービスをDIしてコンポーネントを生成する。
	 * @param authService 認証サービス。
	 * @param route ルート情報。
	 */
	constructor(
		private userService: UserService,
		private router: Router) {
	}

	/**
	 * 認証チェック処理。
	 * @param route 現在のルート情報。
	 * @param state 遷移先のルート情報。
	 * @return チェックOKの場合true。
	 */
	async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
		// 認証チェック実施
		const isLogin = await this.checkLogin();
		if (isLogin) {
			return true;
		}
		// 未認証は遷移先をバックアップしてログイン画面に転送
		this.userService.backupUrl = state.url;
		this.router.navigate(['/users/login']);
		return false;
	}

	/**
	 * ログイン状態チェック。
	 * @returns 認証OKの場合true。
	 */
	private async checkLogin(): Promise<boolean> {
		// 管理者として認証済みならOK
		if (this.userService.me) {
			return true;
		}

		// 未認証の場合は、セッションから認証可能か確認
		return await this.userService.checkSession();
	}
}
