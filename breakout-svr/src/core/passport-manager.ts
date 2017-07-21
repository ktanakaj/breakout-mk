/**
 * Passport認証を管理する共通処理モジュール。
 * @module ./core/passport-manager
 */
import * as passport from 'passport';
import * as passportLocal from 'passport-local';
import * as express from 'express';
import * as config from 'config';
import * as log4js from 'log4js';
import { HttpError } from './http-error';
import User from '../models/user';
const logger = log4js.getLogger('debug');

/**
 * Passportの初期化を行う。
 * @param app Expressインスタンス。
 */
function initialize(app: express.Express): void {
	// パスポートの初期化を実行
	app.use(passport.initialize());
	app.use(passport.session());

	// ユーザー認証設定
	passport.use(new passportLocal.Strategy(
		async function (username, password, done) {
			// ユーザー名の存在とパスワードの一致をチェック
			let user;
			try {
				user = await User.scope("login").findOne<User>({ where: { name: username } });
			} catch (e) {
				return done(e);
			}
			if (!user || !user.comparePassword(password)) {
				return done(null, false, { message: 'user name or password is incorrect' });
			}
			return done(null, user);
		}
	));

	// 認証成功時のシリアライズ
	passport.serializeUser((user, done) => done(null, user));

	// 認証中のユーザー情報デシリアライズ
	passport.deserializeUser((user, done) => done(null, user));
}

/**
 * ユーザーor管理者の認証チェック。
 * @param status 権限までチェックする場合、'admin'などユーザーの権限。
 * @returns チェック関数。
 */
function authorize(status: string = null): express.RequestHandler {
	return (req: express.Request, res: express.Response, next: express.NextFunction) => {
		let error = null;
		if (!req.isAuthenticated()) {
			error = new HttpError(401);
		} else if (status && req.user.status !== status) {
			error = new HttpError(403);
		}
		return next(error);
	};
}

/**
 * 渡されたユーザーIDをHTTPリクエスト内の認証ユーザーから検証する。
 * ※ 管理者は不一致でもOK
 * @param req HTTPリクエスト。
 * @param id 比較するユーザーID。
 * @throws 検証NG。
 */
function validateUserIdOrAdmin(req: express.Request, id: number): void {
	if (!req.user || (req.user.id != id && req.user.status != "admin")) {
		throw new HttpError(403);
	}
}

export default {
	initialize: initialize,
	authorize: authorize,
	validateUserIdOrAdmin: validateUserIdOrAdmin,
};