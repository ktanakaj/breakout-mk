"use strict";
/**
 * ユーザーコントローラのNode.jsモジュール。
 *
 * ブロックくずしのプレイヤーor作者のRESTアクセスに対応する。
 * @module ./routes/api/users
 */
/**
 * @swagger
 * tags:
 *   name: users
 *   description: ユーザー関連API
 *
 * parameters:
 *   userIdPathParam:
 *     in: path
 *     name: id
 *     description: ユーザーID
 *     required: true
 *     type: integer
 *     format: int32
 *
 * definitions:
 *   UserStage:
 *     allOf:
 *       - $ref: '#/definitions/Stage'
 *       - properties:
 *           info:
 *             type: object
 *             properties:
 *               tried:
 *                 type: integer
 *                 description: 挑まれた回数
 *               score:
 *                 type: integer
 *                 description: ハイスコア
 *               cleared:
 *                 type: integer
 *                 description: クリアされた回数
 *               rating:
 *                 type: integer
 *                 description: 平均評価
 *               favorites:
 *                 type: integer
 *                 description: お気に入り数
 *               comments:
 *                 type: integer
 *                 description: コメント数
 */
// ↓なぜか↑のswaggerコメントがコンパイル時に消されるので対策
const DUMMY = 0;

import * as express from 'express';
import expressPromiseRouter from 'express-promise-router';
import passportManager from '../../core/passport-manager';
import validationUtils from '../../core/utils/validation-utils';
import User from '../../models/user';
import Stage from '../../models/stage';
import StageFavorite from '../../models/stage-favorite';
import Playlog from '../../models/playlog';
const router = expressPromiseRouter();

/**
 * @swagger
 * /users:
 *   get:
 *     tags:
 *       - users
 *     summary: ユーザー一覧
 *     description: ユーザーの一覧を取得する（管理者限定）。
 *     security:
 *       - SessionId: []
 *     responses:
 *       200:
 *         description: 取得成功
 *         schema:
 *           type: array
 *           items:
 *             $ref: '#/definitions/User'
 *       401:
 *         $ref: '#/responses/Unauthorized'
 *       403:
 *         $ref: '#/responses/Forbidden'
 */
router.get('/', passportManager.isAuthenticated('admin'), async function (req: express.Request, res: express.Response): Promise<void> {
	const users = await User.findAll();
	res.json(users);
});

/**
 * @swagger
 * /users:
 *   post:
 *     tags:
 *       - users
 *     summary: ユーザー新規登録
 *     description: ユーザーを新規登録する。
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
 *         description: 登録成功
 *         schema:
 *           $ref: '#/definitions/User'
 *       400:
 *         $ref: '#/responses/BadRequest'
 */
router.post('/', async function (req: express.Request, res: express.Response): Promise<void> {
	let user = User.build<User>();
	user.merge(req.body);
	user = await user.save();
	// 認証状態にする
	await new Promise((resolve, reject) => {
		req.login(user, (err) => {
			if (err) {
				return reject(err);
			}
			res.json(user);
			resolve();
		});
	});
});

/**
 * @swagger
 * /users/me:
 *   get:
 *     tags:
 *       - users
 *     summary: 自分の情報取得
 *     description: ログインユーザー自身の情報を取得する。
 *     security:
 *       - SessionId: []
 *     responses:
 *       200:
 *         description: 取得成功
 *         schema:
 *           $ref: '#/definitions/User'
 *       401:
 *         $ref: '#/responses/Unauthorized'
 */
router.get('/me', passportManager.isAuthenticated(), function (req: express.Request, res: express.Response): void {
	res.json(req.user);
});

/**
 * @swagger
 * /users/me/stages:
 *   get:
 *     tags:
 *       - users
 *     summary: 自分が登録したステージの一覧
 *     description: 自分が登録したステージの一覧を取得する。
 *     security:
 *       - SessionId: []
 *     responses:
 *       200:
 *         description: 取得成功
 *         schema:
 *           type: array
 *           items:
 *             $ref: '#/definitions/UserStage'
 *       401:
 *         $ref: '#/responses/Unauthorized'
 */
router.get('/me/stages', passportManager.isAuthenticated(), async function (req: express.Request, res: express.Response): Promise<void> {
	const stages = await Stage.findUserStagesWithAccessibleAllInfo(req.user.id, true);
	res.json(stages);
});

/**
 * @swagger
 * /users/me/playlogs:
 *   get:
 *     tags:
 *       - users
 *     summary: 自分のプレイログ一覧
 *     description: 自分のプレイログの一覧を取得する。
 *     responses:
 *       200:
 *         description: 取得成功
 *         schema:
 *           type: array
 *           items:
 *             allOf:
 *               - $ref: '#/definitions/Playlog'
 *               - properties:
 *                   stage:
 *                     $ref: '#/definitions/Stage'
 *       400:
 *         $ref: '#/responses/BadRequest'
 */
router.get('/me/playlogs', passportManager.isAuthenticated(), async function (req: express.Request, res: express.Response): Promise<void> {
	const playlogs = await Playlog.scope(<any>[{ method: ['user', req.user.id] }, "withstage"]).findAll<Playlog>();
	res.json(playlogs);
});

/**
 * @swagger
 * /users/me/favorites:
 *   get:
 *     tags:
 *       - users
 *     summary: 自分がお気に入りしたステージの一覧
 *     description: 自分がお気に入りしたステージの一覧を取得する。
 *     security:
 *       - SessionId: []
 *     responses:
 *       200:
 *         description: 取得成功
 *         schema:
 *           type: array
 *           items:
 *             allOf:
 *               - $ref: '#/definitions/Stage'
 *               - properties:
 *                   info:
 *                     type: object
 *                     properties:
 *                       tried:
 *                         type: integer
 *                         description: プレイ回数
 *                       score:
 *                         type: integer
 *                         description: ハイスコア
 *                       cleared:
 *                         type: integer
 *                         description: クリア回数
 *                       comments:
 *                         type: integer
 *                         description: コメント数
 *       401:
 *         $ref: '#/responses/Unauthorized'
 */
router.get('/me/favorites', passportManager.isAuthenticated(), async function (req: express.Request, res: express.Response): Promise<void> {
	const stages = await StageFavorite.findStagesWithAccessibleAllInfo(req.user.id);
	res.json(stages);
});

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     tags:
 *       - users
 *     summary: ユーザー情報取得
 *     description: 指定されたユーザーの情報を取得する。
 *     parameters:
 *       - $ref: '#/parameters/userIdPathParam'
 *       - in: query
 *         name: fields
 *         description: 取得対象。all の場合infoを含めて取得
 *         type: string
 *     responses:
 *       200:
 *         description: 取得成功
 *         schema:
 *           allOf:
 *             - $ref: '#/definitions/User'
 *             - properties:
 *                 info:
 *                   type: object
 *                   properties:
 *                     tried:
 *                       type: integer
 *                       description: 総プレイ回数
 *                     score:
 *                       type: integer
 *                       description: ハイスコア
 *                     cleared:
 *                       type: integer
 *                       description: 総クリア回数
 *                     created:
 *                       type: integer
 *                       description: 作成ステージ数
 *                     rating:
 *                       type: integer
 *                       description: 平均評価
 *       400:
 *         $ref: '#/responses/BadRequest'
 *       404:
 *         $ref: '#/responses/NotFound'
 */
router.get('/:id', async function (req: express.Request, res: express.Response): Promise<void> {
	let userId = validationUtils.toNumber(req.params.id);
	let user: User;
	if (req.query.fields === "all") {
		user = await User.findByIdWithAllInfo(userId);
	} else {
		user = await User.findById<User>(userId);
	}
	validationUtils.notFound(user);
	res.json(user);
});

/**
 * @swagger
 * /users/{id}:
 *   put:
 *     tags:
 *       - users
 *     summary: ユーザー情報更新
 *     description: 指定されたユーザーの情報を更新する（自分または管理者のみ可）。
 *     security:
 *       - SessionId: []
 *     parameters:
 *       - $ref: '#/parameters/userIdPathParam'
 *       - in: body
 *         name: body
 *         description: ユーザー情報。statusは管理者のみ変更可
 *         required: true
 *         schema:
 *           type: object
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
 *             status:
 *               type: string
 *               description: ステータス (user/admin/disable)
 *               enum:
 *                 - user
 *                 - admin
 *                 - disable
 *             comment:
 *               type: string
 *               description: コメント
 *     responses:
 *       200:
 *         description: 更新成功
 *         schema:
 *           $ref: '#/definitions/User'
 *       400:
 *         $ref: '#/responses/BadRequest'
 *       401:
 *         $ref: '#/responses/Unauthorized'
 *       403:
 *         $ref: '#/responses/Forbidden'
 */
router.put('/:id', passportManager.isAuthenticated(), async function (req: express.Request, res: express.Response): Promise<void> {
	// 自分または管理者のみ更新可
	passportManager.validateUserIdOrAdmin(req, req.params.id);

	let user = await User.findById<User>(validationUtils.toNumber(req.params.id));
	validationUtils.notFound(user);

	// 管理者は全ての項目が変更可能
	user.merge(req.body, req.user.status === "admin");
	user = await user.save();

	// パスワードは隠す
	user.password = "";
	res.json(user);
});

/**
 * @swagger
 * /users/{id}/stages:
 *   get:
 *     tags:
 *       - users
 *     summary: ユーザーが登録したステージの一覧
 *     description: 指定されたユーザーが登録したステージの一覧を取得する（ログイン中の自分の場合、privateも含めて全件）。
 *     security:
 *       - SessionId: []
 *     parameters:
 *       - $ref: '#/parameters/userIdPathParam'
 *     responses:
 *       200:
 *         description: 取得成功
 *         schema:
 *           type: array
 *           items:
 *             $ref: '#/definitions/UserStage'
 *       400:
 *         $ref: '#/responses/BadRequest'
 */
router.get('/:id/stages', async function (req: express.Request, res: express.Response): Promise<void> {
	const userId = validationUtils.toNumber(req.params.id);
	const stages = await Stage.findUserStagesWithAccessibleAllInfo(userId, req.user && userId === req.user.id);
	res.json(stages);
});

export default router;