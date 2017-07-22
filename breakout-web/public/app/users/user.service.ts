/**
 * ユーザー関連サービスモジュール。
 * @module ./app/users/user.service
 */
import { Injectable } from '@angular/core';
import { Http, URLSearchParams } from '@angular/http';
import { ResponseError } from '../core/response-error';
import { User } from './user.model';
import { Playlog } from './playlog.model';

/** 通信失敗時のリトライ回数。 */
const MAX_RETRY = 3;

/**
 * ユーザー関連サービスクラス。
 */
@Injectable()
export class UserService {
	/** 認証済みユーザー情報 */
	me: User;

	/**
	 * モジュールをDIしてコンポーネントを生成する。
	 * @param http HTTPモジュール。
	 */
	constructor(private http: Http) { }

	/**
	 * 全ユーザーの参照。
	 * @returns 検索結果。
	 */
	findAll(): Promise<User[]> {
		return this.http.get('/api/users')
			.retry(MAX_RETRY)
			.toPromise()
			.then((res) => res.json())
			.catch(ResponseError.throwError);
	}

	/**
	 * 指定されたユーザーIDのユーザーの検索。
	 * @param id 検索するユーザーID。
	 * @returns 検索結果。
	 */
	findById(id: number): Promise<User> {
		return this.http.get('/api/users/' + id)
			.retry(MAX_RETRY)
			.toPromise()
			.then((res) => res.json())
			.catch(ResponseError.throwError);
	}

	/**
	 * 指定されたユーザーIDのユーザーの検索。
	 * @param id 検索するユーザーID。
	 * @returns 検索結果。
	 */
	findByIdWithAllInfo(id: number): Promise<User> {
		// ※ 関連情報も一緒に取得
		const params = new URLSearchParams();
		params.set('fields', 'all');
		return this.http.get('/api/users/' + id, { search: params })
			.retry(MAX_RETRY)
			.toPromise()
			.then((res) => res.json())
			.catch(ResponseError.throwError);
	}

	/**
	 * 渡されたユーザー情報の新規登録。
	 * @param user 保存するユーザー情報。
	 * @returns 登録結果。
	 */
	insert(user: User): Promise<User> {
		// ※ 登録成功時はセッションが開始される
		return this.http.post('/api/users', user)
			.toPromise()
			.then((res) => res.json())
			.catch(ResponseError.throwError);
	}

	/**
	 * 渡されたユーザー情報の上書き。
	 * @param user 保存するユーザー情報。
	 * @returns 更新結果。
	 */
	update(user: User): Promise<User> {
		return this.http.put("/api/users/" + user.id, user)
			.toPromise()
			.then((res) => res.json())
			.catch(ResponseError.throwError);
	}

	/**
	 * ログインする。
	 * @param user 認証するユーザー情報。
	 * @returns 認証結果。
	 */
	login(name: string, password: string): Promise<User> {
		// ※ 認証成功時はセッションが開始される
		return this.http.post('/api/authenticate', { name, password })
			.toPromise()
			.then((res) => {
				// プロパティに認証情報を持たせる
				this.me = res.json();
				return this.me;
			})
			.catch(ResponseError.throwError);
	}

	/**
	 * ログアウトする。
	 */
	logout(): Promise<void> {
		// ※ ログアウト成功時はセッションが終了される
		return this.http.post('/api/authenticate/logout', {})
			.toPromise()
			.then(() => {
				// プロパティの認証情報を解除
				this.me = null;
			})
			.catch(ResponseError.throwError);
	}

	/**
	 * 指定されたユーザーIDのユーザーのプレイログの検索。
	 * @param id 検索するユーザーID。
	 * @returns 検索結果。
	 */
	findPlaylogs(id: number): Promise<Playlog[]> {
		return this.http.get('/api/users/' + id + "/playlogs")
			.retry(MAX_RETRY)
			.toPromise()
			.then((res) => res.json())
			.catch(ResponseError.throwError);
	}
}
