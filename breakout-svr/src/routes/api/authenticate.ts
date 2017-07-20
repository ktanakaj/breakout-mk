"use strict";
/**
 * 認証コントローラのNode.jsモジュール。
 * @module ./routes/api/authenticate
 */
/**
 * @swagger
 * tags:
 *   name: authenticate
 *   description: 認証API
 */
import * as express from 'express';
import * as passport from 'passport';
import passportManager from '../../core/passport-manager';
import { HttpError } from '../../core/http-error';
import User from '../../models/user';
const router = express.Router();

/**
 * @swagger
 * /authenticate:
 *   post:
 *     tags:
 *       - authenticate
 *     summary: ユーザー認証
 *     description: ユーザー名とパスワードで認証を行う。
 *     parameters:
 *       - in: body
 *         name: body
 *         description: ユーザー情報
 *         required: true
 *         schema:
 *           type: object
 *           required:
 *             - name
 *             - password
 *           properties:
 *             name:
 *               type: string
 *               description: ユーザー名
 *             password:
 *               type: string
 *               format: password
 *               description: パスワード
 *     responses:
 *       200:
 *         description: 認証OK
 *         schema:
 *           type: object
 *           properties:
 *             token:
 *               type: string
 *               description: 認証トークン
 *       400:
 *         description: 認証NG
 *         schema:
 *           type: string
 */
router.post('/', passport.authenticate('local'), function (req: express.Request, res: express.Response): void {
	// パスワードは返さない（deleteで何故か消せないのでnullで上書き）
	req.user.password = null;
	res.json(req.user);
});

/**
 * @swagger
 * /authenticate/logout:
 *   post:
 *     tags:
 *       - authenticate
 *     summary: ログアウト
 *     description: ログアウトする。
 *     security:
 *       - AdminSessionId: []
 *     responses:
 *       200:
 *         description: ログアウト成功
 *       401:
 *         $ref: '#/responses/Unauthorized'
 */
router.post('/logout', passportManager.authorize(), function (req: express.Request, res: express.Response): void {
	req.logout();
	res.end();
});

module.exports = router;