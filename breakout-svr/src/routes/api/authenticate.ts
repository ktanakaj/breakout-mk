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
 *               minLength: 1
 *             password:
 *               type: string
 *               format: password
 *               description: パスワード
 *               minLength: 1
 *     responses:
 *       200:
 *         description: 認証OK
 *         schema:
 *           $ref: '#/definitions/User'
 *       400:
 *         description: 認証NG
 *         schema:
 *           type: string
 */
router.post('/', passport.authenticate('local'), function (req: express.Request, res: express.Response): void {
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
 *       - SessionId: []
 *     responses:
 *       200:
 *         description: ログアウト成功
 *       401:
 *         $ref: '#/responses/Unauthorized'
 */
router.post('/logout', passportManager.isAuthenticated(), function (req: express.Request, res: express.Response): void {
	req.logout();
	res.end();
});

export default router;