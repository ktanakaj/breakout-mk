/**
 * ユーザー関連サービスモジュール。
 * @module ./app/users/user.service
 */
import { EventEmitter } from 'events';
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { throwErrorByResponse, UnauthorizedError } from '../core/http-error';
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
	 * @returns 検索結果。
	 */
	findAll(): Promise<User[]> {
		return this.http.get<User[]>('/api/users')
			.retry(MAX_RETRY)
			.toPromise()
			.catch(throwErrorByResponse);
	}

	/**
	 * 指定されたユーザーIDのユーザーの検索。
	 * @param id 検索するユーザーID。
	 * @returns 検索結果。
	 */
	findById(id: number): Promise<User> {
		return this.http.get<User>('/api/users/' + id)
			.retry(MAX_RETRY)
			.toPromise()
			.catch(throwErrorByResponse);
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
			.toPromise()
			.catch(throwErrorByResponse);
	}

	/**
	 * 自分自身の情報を取得する。
	 * @returns 検索結果。
	 * @throws 未認証状態、または通信エラーの場合。
	 */
	findMe(): Promise<User> {
		return this.http.get<User>('/api/users/me')
			.toPromise()
			.catch(throwErrorByResponse);
	}

	/**
	 * 渡されたユーザー情報の上書き。
	 * @param user 保存するユーザー情報。
	 * @returns 更新結果。
	 * @throws 権限がない、または通信エラーの場合。
	 */
	update(user: User): Promise<User> {
		return this.http.put<User>("/api/users/" + user.id, user)
			.toPromise()
			.catch(throwErrorByResponse);
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
			})
			.catch(throwErrorByResponse);
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
			})
			.catch(throwErrorByResponse);
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
				let user = this.me;
				this.me = null;
				this.emit('logout', user);
			})
			.catch(throwErrorByResponse);
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
			if (e.name === 'UnauthorizedError') {
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
			.toPromise()
			.catch(throwErrorByResponse);
	}

	// イベント定義
	on(event: 'login', listener: (user: User) => void): this;
	on(event: 'logout', listener: (user: User) => void): this;
	on(event: string | symbol, listener: (...args: any[]) => void): this {
		return super.on(event, listener);
	}
	removeListener(event: 'login', listener: (user: User) => void): this;
	removeListener(event: 'logout', listener: (user: User) => void): this;
	removeListener(event: string | symbol, listener: (...args: any[]) => void): this {
		return super.removeListener(event, listener);
	}
}
