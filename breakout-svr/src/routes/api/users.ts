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

import * as express from 'express';
import passportManager from '../../core/passport-manager';
import { HttpError } from '../../core/http-error';
import validationUtils from '../../core/utils/validation-utils';
import User from '../../models/user';
import Stage from '../../models/stage';
import StageFavorite from '../../models/stage-favorite';
import Playlog from '../../models/playlog';
const router = express.Router();

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
router.get('/', passportManager.authorize('admin'), function (req, res, next) {
	User.findAll()
		.then(res.json.bind(res))
		.catch(next);
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
 *             password:
 *               type: string
 *               format: password
 *               description: パスワード
 *     responses:
 *       200:
 *         description: 登録成功
 *         schema:
 *           type: object
 *           properties:
 *             token:
 *               type: string
 *               description: 認証トークン
 *       400:
 *         $ref: '#/responses/BadRequest'
 */
router.post('/', function (req, res, next) {
	const user = User.build<User>();
	user.merge(req.body);
	user.save()
		.then((user) => {
			// 認証状態にする
			req.login(user, (err) => {
				if (err) {
					next(err);
				} else {
					res.end();
				}
			});
		})
		.catch(next);
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
router.get('/me', passportManager.authorize(), function (req, res) {
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
router.get('/me/stages', passportManager.authorize(), function (req, res, next) {
	Stage.findUserStagesWithAccessibleAllInfo(req.user.id, true)
		.then(res.json.bind(res))
		.catch(next);
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
router.get('/me/favorites', passportManager.authorize(), function (req, res, next) {
	StageFavorite.findStagesWithAccessibleAllInfo(req.user.id)
		.then(res.json.bind(res))
		.catch(next);
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
router.get('/:id', function (req, res, next) {
	let userId = validationUtils.toNumber(req.params.id);
	let promise = null;
	if (req.query.fields == "all") {
		promise = User.findByIdWithAllInfo(userId);
	} else {
		promise = User.findById(userId);
	}
	promise
		.then(validationUtils.notFound)
		.then(res.json.bind(res))
		.catch(next);
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
 *             password:
 *               type: string
 *               format: password
 *               description: パスワード
 *             status:
 *               type: string
 *               description: ステータス (user/admin/disable)
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
router.put('/:id', passportManager.authorize(), function (req, res, next) {
	// 自分または管理者のみ更新可
	passportManager.validateUserIdOrAdmin(req, req.params.id);

	User.findById<User>(validationUtils.toNumber(req.params.id))
		.then(validationUtils.notFound)
		.then((user) => {
			// 管理者は全ての項目が変更可能
			user.merge(req.body, req.user.status == "admin");
			return user.save();
		})
		.then((user) => {
			// パスワードは隠す
			user.password = "";
			res.json(user);
		})
		.catch(next);
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
router.get('/:id/stages', function (req, res, next) {
	Stage.findUserStagesWithAccessibleAllInfo(validationUtils.toNumber(req.params.id), req.user && req.params.id == req.user.id)
		.then(res.json.bind(res))
		.catch(next);
});

/**
 * @swagger
 * /users/{id}/playlogs:
 *   get:
 *     tags:
 *       - users
 *     summary: ユーザーのプレイログ一覧
 *     description: 指定されたユーザーのプレイログの一覧を取得する。
 *     parameters:
 *       - $ref: '#/parameters/userIdPathParam'
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
router.get('/:id/playlogs', function (req, res, next) {
	Playlog.scope({ method: ['user', validationUtils.toNumber(req.params.id)] }).scope("withstage").findAll<Playlog>()
		.then(res.json.bind(res))
		.catch(next);
});

module.exports = router;