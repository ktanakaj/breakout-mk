/**
 * ユーザー関連サービスモジュール。
 * @module ./app/users/user.service
 */
import { EventEmitter } from 'events';
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { User, UserWithInfo } from './user.model';
import { Playlog } from './playlog.model';

/** 通信失敗時のリトライ回数。 */
const MAX_RETRY = 3;

/**
 * ユーザー関連サービスクラス。
 */
@Injectable()
export class UserService extends EventEmitter {
	/** 認証済みユーザー情報 */
	me: User;
	/** 認証処理遷移先URL */
	backupUrl: string;

	/**
	 * モジュールをDIしてコンポーネントを生成する。
	 * @param http HTTPモジュール。
	 */
	constructor(private http: HttpClient) {
		super();
		// 認証状態を復元
		this.checkSession();
	}

	/**
	 * 全ユーザーの参照。
	 * @param page ページ番号（先頭ページが1）。
	 * @param max 1ページ辺りの最大件数。
	 * @returns 検索結果。
	 */
	findAllAndCount(page: number, max: number): Promise<{ count: number, rows: User[] }> {
		const params = new HttpParams()
			.set('page', String(page))
			.set('max', String(max));
		return this.http.get<{ count: number, rows: User[] }>('/api/users', { params })
			.retry(MAX_RETRY)
			.toPromise();
	}

	/**
	 * 指定されたユーザーIDのユーザーの検索。
	 * @param id 検索するユーザーID。
	 * @returns 検索結果。
	 */
	findById(id: number): Promise<User> {
		return this.http.get<User>('/api/users/' + id)
			.retry(MAX_RETRY)
			.toPromise();
	}

	/**
	 * 指定されたユーザーIDのユーザーの検索。
	 * @param id 検索するユーザーID。
	 * @returns 検索結果。
	 */
	findByIdWithAllInfo(id: number): Promise<UserWithInfo> {
		// ※ 関連情報も一緒に取得
		const params = new HttpParams()
			.set('fields', 'all');
		return this.http.get<UserWithInfo>('/api/users/' + id, { params })
			.retry(MAX_RETRY)
			.toPromise();
	}

	/**
	 * 自分自身の情報を取得する。
	 * @returns 検索結果。
	 * @throws 未認証状態、または通信エラーの場合。
	 */
	findMe(): Promise<User> {
		return this.http.get<User>('/api/users/me')
			.toPromise();
	}

	/**
	 * 渡されたユーザー情報の上書き。
	 * @param user 保存するユーザー情報。
	 * @returns 更新結果。
	 * @throws 権限がない、または通信エラーの場合。
	 */
	update(user: User): Promise<User> {
		return this.http.put<User>("/api/users/" + user.id, user)
			.toPromise();
	}

	/**
	 * ユーザーの新規登録。
	 * @param user 保存するユーザー情報。
	 * @returns 登録結果。
	 * @throws 登録失敗、または通信エラーの場合。
	 */
	signup(user: User): Promise<User> {
		// ※ 登録成功時はセッションが開始される
		return this.http.post<User>('/api/users', user)
			.toPromise()
			.then((me) => {
				// プロパティに認証情報を持たせる
				this.me = me;
				this.emit('login', this.me);
				return this.me;
			});
	}

	/**
	 * ログインする。
	 * @param name ユーザー名。
	 * @param password パスワード。
	 * @returns 認証成功時はユーザー情報。
	 * @throws 認証失敗、または通信エラーの場合。
	 */
	login(name: string, password: string): Promise<User> {
		// ※ 認証成功時はセッションが開始される
		return this.http.post<User>('/api/authenticate', { name, password })
			.toPromise()
			.then((me) => {
				// プロパティに認証情報を持たせる
				this.me = me;
				this.emit('login', this.me);
				return this.me;
			});
	}

	/**
	 * ログアウトする。
	 * @returns 処理状態。
	 */
	logout(): Promise<void> {
		// ※ ログアウト成功時はセッションが終了される
		return this.http.post('/api/authenticate/logout', {})
			.toPromise()
			.then(() => {
				// プロパティの認証情報を解除
				const user = this.me;
				this.me = null;
				this.emit('logout', user);
			});
	}

	/**
	 * 認証情報の復元。
	 * @returns 認証中の場合true、それ以外はfalse。
	 */
	async checkSession(): Promise<boolean> {
		// 認証しているかチェックのため自分を読み込み
		try {
			const user = await this.findMe();
			this.me = user;
			this.emit('login', user);
			return true;
		} catch (e) {
			if (e instanceof HttpErrorResponse && e.status === 401) {
				return false;
			}
			throw e;
		}
	}

	/**
	 * プレイログの検索。
	 * @returns 検索結果。
	 * @throws 未認証、または通信エラーの場合。
	 */
	findPlaylogs(): Promise<Playlog[]> {
		return this.http.get<Playlog[]>('/api/users/me/playlogs')
			.retry(MAX_RETRY)
			.toPromise();
	}

	// イベント定義
	on(event: 'login' | 'logout', listener: (user: User) => void): this {
		return super.on(event, listener);
	}
	removeListener(event: 'login' | 'logout', listener: (user: User) => void): this {
		return super.removeListener(event, listener);
	}
}
