"use strict";
/**
 * ステージコントローラのNode.jsモジュール。
 *
 * ブロックくずしの一つの面のRESTアクセスに対応する。
 * @module ./routes/api/stages
 */
/**
 * @swagger
 * tags:
 *   name: stages
 *   description: ステージ関連API
 *
 * parameters:
 *   stageIdPathParam:
 *     in: path
 *     name: id
 *     description: ステージID
 *     required: true
 *     type: integer
 *     format: int32
 *   stageCommentIdPathParam:
 *     in: path
 *     name: commentId
 *     description: コメントID
 *     required: true
 *     type: integer
 *     format: int32
 *
 * definitions:
 *   StageComment:
 *     type: object
 *     description: コメント情報
 *     required:
 *       - id
 *       - headerId
 *       - userId
 *       - status
 *       - comment
 *     properties:
 *       id:
 *         type: integer
 *         description: コメントID
 *         format: int32
 *       headerId:
 *         type: integer
 *         description: ステージヘッダーID
 *         format: int32
 *       userId:
 *         type: integer
 *         description: ユーザーID
 *         format: int32
 *       ipAddress:
 *         type: string
 *         description: IPアドレス
 *       status:
 *         type: string
 *         description: ステータス (private/public)
 *       comment:
 *         type: string
 *         description: コメント
 *   StageFavorite:
 *     type: object
 *     description: お気に入り情報
 *     required:
 *       - id
 *       - headerId
 *       - userId
 *     properties:
 *       id:
 *         type: integer
 *         description: お気に入りID
 *         format: int32
 *       headerId:
 *         type: integer
 *         description: ステージヘッダーID
 *         format: int32
 *       userId:
 *         type: integer
 *         description: ユーザーID
 *         format: int32
 *   StageRating:
 *     type: object
 *     description: レーティング情報
 *     required:
 *       - id
 *       - headerId
 *       - userId
 *       - rating
 *     properties:
 *       id:
 *         type: integer
 *         description: ステージ評価ID
 *         format: int32
 *       headerId:
 *         type: integer
 *         description: ステージヘッダーID
 *         format: int32
 *       userId:
 *         type: integer
 *         description: ユーザーID
 *         format: int32
 *       rating:
 *         type: integer
 *         description: レーティング
 *         format: int32
 */

import * as express from 'express';
import passportManager from '../../core/passport-manager';
import { HttpError } from '../../core/http-error';
import validationUtils from '../../core/utils/validation-utils';
import { Stage } from '../../models/stage';
import { StageComment } from '../../models/stage-comment';
import * as redis from '../../models/redis';
const StageScoreRanking = redis['StageScoreRanking'];
const router = express.Router();

/**
 * @swagger
 * /stages:
 *   get:
 *     tags:
 *       - stages
 *     summary: アクセス可能なステージ一覧
 *     description: 自分がアクセス可能なステージの一覧を取得する。
 *     security:
 *       - AuthToken: []
 *     responses:
 *       200:
 *         description: 取得成功
 *         schema:
 *           type: array
 *           items:
 *             $ref: '#/definitions/Stage'
 */
router.get('/', function (req, res, next) {
	Stage.scope("latest").scope({ method: ['accessible', req.user ? req.user.id : null] }).findAll<Stage>()
		.then(res.json.bind(res))
		.catch(next);
});

/**
 * @swagger
 * /stages:
 *   post:
 *     tags:
 *       - stages
 *     summary: ステージ新規作成
 *     description: ステージを新規作成する。
 *     security:
 *       - AuthToken: []
 *     parameters:
 *       - in: body
 *         name: body
 *         description: ステージ情報
 *         required: true
 *         schema:
 *           type: object
 *           required:
 *             - name
 *             - map
 *             - header
 *           properties:
 *             name:
 *               type: string
 *               description: ステージ名
 *             map:
 *               type: string
 *               description: ステージデータ
 *             comment:
 *               type: string
 *               description: ステージコメント
 *             header:
 *               type: object
 *               required:
 *                 - status
 *               properties:
 *                 status:
 *                   type: string
 *                   description: ステータス (private/public)
 *     responses:
 *       200:
 *         description: 登録成功
 *         schema:
 *           $ref: '#/definitions/Stage'
 *       400:
 *         $ref: '#/responses/BadRequest'
 *       401:
 *         $ref: '#/responses/Unauthorized'
 */
router.post('/', passportManager.authorize(), function (req, res, next) {
	const stage = Stage.buildAll(req.body);
	stage.header.userId = req.user.id;
	stage.saveAll()
		.then(res.json.bind(res))
		.catch(next);
});

/**
 * @swagger
 * /stages/latest:
 *   get:
 *     tags:
 *       - stages
 *     summary: 最新ステージ一覧
 *     description: 最新ステージ一覧を取得する。
 *     security:
 *       - AuthToken: []
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
 *                       rating:
 *                         type: integer
 *                         description: 平均評価
 */
router.get('/latest', function (req, res, next) {
	Stage.findLatestStagesWithAccessibleAllInfo(req.user ? req.user.id : null)
		.then(res.json.bind(res))
		.catch(next);
});

/**
 * @swagger
 * /stages/{id}:
 *   get:
 *     tags:
 *       - stages
 *     summary: ステージ取得
 *     description: 指定されたステージを取得する。
 *     security:
 *       - AuthToken: []
 *     parameters:
 *       - $ref: '#/parameters/stageIdPathParam'
 *       - in: query
 *         name: fields
 *         description: 取得対象。all の場合infoを含めて取得
 *         type: string
 *     responses:
 *       200:
 *         description: 取得成功
 *         schema:
 *           allOf:
 *             - $ref: '#/definitions/Stage'
 *             - properties:
 *                 info:
 *                   type: object
 *                   properties:
 *                     tried:
 *                       type: integer
 *                       description: 挑まれた回数
 *                     score:
 *                       type: integer
 *                       description: ハイスコア
 *                     cleared:
 *                       type: integer
 *                       description: クリアされた回数
 *                     rating:
 *                       type: integer
 *                       description: 平均評価
 *                     user:
 *                       type: object
 *                       description: ユーザー別情報
 *                       properties:
 *                         tried:
 *                           type: integer
 *                           description: プレイ回数
 *                         score:
 *                           type: integer
 *                           description: ハイスコア
 *                         cleared:
 *                           type: integer
 *                           description: クリア回数
 *                         rating:
 *                           type: integer
 *                           description: 評価
 *                         favorited:
 *                           type: boolean
 *                           description: お気に入り登録有無
 */
router.get('/:id', function (req, res, next) {
	let stageId = validationUtils.toNumber(req.params.id);
	let userId = req.user ? req.user.id : null;
	let promise = null;
	if (req.query.fields == "all") {
		promise = Stage.findByIdWithAccessibleAllInfo(stageId, userId);
	} else {
		promise = Stage.scope({ method: ['accessible', userId] }).findById(stageId);
	}
	promise
		.then(validationUtils.notFound)
		.then(res.json.bind(res))
		.catch(next);
});

/**
 * @swagger
 * /stages/{id}:
 *   put:
 *     tags:
 *       - stages
 *     summary: ステージ更新
 *     description: ステージを更新する。
 *     security:
 *       - AuthToken: []
 *     parameters:
 *       - $ref: '#/parameters/stageIdPathParam'
 *       - in: body
 *         name: body
 *         description: ステージ情報
 *         required: true
 *         schema:
 *           type: object
 *           required:
 *             - name
 *             - map
 *             - header
 *           properties:
 *             name:
 *               type: string
 *               description: ステージ名
 *             map:
 *               type: string
 *               description: ステージデータ
 *             comment:
 *               type: string
 *               description: ステージコメント
 *             header:
 *               type: object
 *               required:
 *                 - status
 *               properties:
 *                 status:
 *                   type: string
 *                   description: ステータス (private/public)
 *     responses:
 *       200:
 *         description: 更新成功
 *         schema:
 *           $ref: '#/definitions/Stage'
 *       400:
 *         $ref: '#/responses/BadRequest'
 *       401:
 *         $ref: '#/responses/Unauthorized'
 *       403:
 *         $ref: '#/responses/Forbidden'
 *       404:
 *         $ref: '#/responses/NotFound'
 */
router.put('/:id', passportManager.authorize(), function (req, res, next) {
	Stage.scope(["latest", "withuser"]).findById<Stage>(validationUtils.toNumber(req.params.id))
		.then(validationUtils.notFound)
		.then((stage) => {
			// 自分の登録したステージまたは管理者のみ変更可
			passportManager.validateUserIdOrAdmin(req, stage.header.userId);
			stage.mergeAll(req.body);
			return stage.saveAll();
		})
		.then(res.json.bind(res))
		.catch(next);
});

/**
 * @swagger
 * /stages/{id}:
 *   delete:
 *     tags:
 *       - stages
 *     summary: ステージ削除
 *     description: ステージを削除する。
 *     security:
 *       - AuthToken: []
 *     parameters:
 *       - $ref: '#/parameters/stageIdPathParam'
 *     responses:
 *       200:
 *         description: 削除成功
 *         schema:
 *           $ref: '#/definitions/Stage'
 *       400:
 *         $ref: '#/responses/BadRequest'
 *       401:
 *         $ref: '#/responses/Unauthorized'
 *       403:
 *         $ref: '#/responses/Forbidden'
 *       404:
 *         $ref: '#/responses/NotFound'
 */
router.delete('/:id', passportManager.authorize(), function (req, res, next) {
	Stage.scope("withuser").findById<Stage>(validationUtils.toNumber(req.params.id))
		.then(validationUtils.notFound)
		.then((stage) => {
			// 自分の登録したステージまたは管理者のみ削除可
			passportManager.validateUserIdOrAdmin(req, stage.header.userId);
			return stage.header.destroy();
		})
		.then(res.json.bind(res))
		.catch(next);
});

/**
 * @swagger
 * /stages/{id}/rankings/score/keys:
 *   get:
 *     tags:
 *       - stages
 *     summary: ステージ別獲得スコアランキングの全キー取得
 *     description: ステージ別獲得スコアランキングの全キー一覧を取得する。
 *     parameters:
 *       - $ref: '#/parameters/stageIdPathParam'
 *     responses:
 *       200:
 *         $ref: '#/responses/RankingKeys'
 *       400:
 *         $ref: '#/responses/BadRequest'
 */
router.get('/:id/rankings/score/keys', function (req, res, next) {
	StageScoreRanking.yearAndMonthsAsync(validationUtils.toNumber(req.params.id))
		.then(res.json.bind(res))
		.catch(next);
});

/**
 * @swagger
 * /stages/{id}/rankings/score/{year}/{month}/:
 *   get:
 *     tags:
 *       - stages
 *     summary: 累計/年間/月間ステージ別獲得スコアランキング取得
 *     description: 累計/年間/月間ステージ別獲得スコアランキングを取得する。
 *     parameters:
 *       - $ref: '#/parameters/stageIdPathParam'
 *       - $ref: '#/parameters/yearPathParam'
 *       - $ref: '#/parameters/monthPathParam'
 *     responses:
 *       200:
 *         description: 取得成功
 *         schema:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               no:
 *                 type: integer
 *                 description: 順位
 *               member:
 *                 type: string
 *                 description: ユーザーID
 *               score:
 *                 type: integer
 *                 description: ハイスコア
 *               user:
 *                 $ref: '#/definitions/User'
 */
router.get(/\/([0-9]+)\/rankings\/score\/([0-9]*)\/?([0-9]*)/, function (req, res, next) {
	new StageScoreRanking(req.params[0], req.params[1], req.params[2]).findRankingAsync()
		.then(res.json.bind(res))
		.catch(next);
});

/**
 * @swagger
 * /stages/{id}/comments/:
 *   post:
 *     tags:
 *       - stages
 *     summary: コメント投稿
 *     description: ステージにコメントを投稿する。
 *     security:
 *       - AuthToken: []
 *     parameters:
 *       - $ref: '#/parameters/stageIdPathParam'
 *       - in: body
 *         name: body
 *         description: コメント情報
 *         required: true
 *         schema:
 *           type: object
 *           required:
 *             - comment
 *             - status
 *           properties:
 *             comment:
 *               type: string
 *               description: コメント
 *             status:
 *               type: string
 *               description: ステータス (private/public)
 *     responses:
 *       200:
 *         description: 投稿成功
 *         schema:
 *           $ref: '#/definitions/StageComment'
 *       400:
 *         $ref: '#/responses/BadRequest'
 *       404:
 *         $ref: '#/responses/NotFound'
 */
router.post('/:id/comments/', function (req, res, next) {
	// 参照可能なステージにのみ投稿可能
	const userId = req.user ? req.user.id : null;
	Stage.scope({ method: ['accessible', userId] }).findById<Stage>(validationUtils.toNumber(req.params.id))
		.then(validationUtils.notFound)
		.then((stage) => {
			const comment = StageComment.build<StageComment>(req.body);
			comment.headerId = stage.headerId;
			comment.userId = userId;
			comment.ipAddress = req.ip;
			return comment.save();
		})
		.then(res.json.bind(res))
		.catch(next);
});

/**
 * @swagger
 * /stages/{id}/comments/{commentId}:
 *   put:
 *     tags:
 *       - stages
 *     summary: コメント更新
 *     description: ステージのコメントを更新する。
 *     security:
 *       - AuthToken: []
 *     parameters:
 *       - $ref: '#/parameters/stageIdPathParam'
 *       - $ref: '#/parameters/stageCommentIdPathParam'
 *       - in: body
 *         name: body
 *         description: コメント情報
 *         required: true
 *         schema:
 *           type: object
 *           required:
 *             - comment
 *             - status
 *           properties:
 *             comment:
 *               type: string
 *               description: コメント
 *             status:
 *               type: string
 *               description: ステータス (private/public)
 *     responses:
 *       200:
 *         description: 更新成功
 *         schema:
 *           $ref: '#/definitions/StageComment'
 *       400:
 *         $ref: '#/responses/BadRequest'
 *       403:
 *         $ref: '#/responses/Forbidden'
 *       404:
 *         $ref: '#/responses/NotFound'
 */
router.put('/:stageId/comments/:commentId', passportManager.authorize(), function (req, res, next) {
	StageComment.findById<StageComment>(validationUtils.toNumber(req.params.commentId))
		.then(validationUtils.notFound)
		.then((comment) => {
			// 自分の投稿したコメントまたは管理者のみ変更可
			passportManager.validateUserIdOrAdmin(req, comment.userId);
			comment.merge(req.body);
			return comment.save();
		})
		.then(res.json.bind(res))
		.catch(next);
});

/**
 * @swagger
 * /stages/{id}/comments/{commentId}:
 *   delete:
 *     tags:
 *       - stages
 *     summary: コメント削除
 *     description: ステージのコメントを削除する。
 *     security:
 *       - AuthToken: []
 *     parameters:
 *       - $ref: '#/parameters/stageIdPathParam'
 *       - $ref: '#/parameters/stageCommentIdPathParam'
 *     responses:
 *       200:
 *         description: 削除成功
 *         schema:
 *           $ref: '#/definitions/StageComment'
 *       400:
 *         $ref: '#/responses/BadRequest'
 *       401:
 *         $ref: '#/responses/Unauthorized'
 *       403:
 *         $ref: '#/responses/Forbidden'
 *       404:
 *         $ref: '#/responses/NotFound'
 */
router.delete('/:stageId/comments/:commentId', passportManager.authorize(), function (req, res, next) {
	StageComment.findById<StageComment>(validationUtils.toNumber(req.params.commentId))
		.then(validationUtils.notFound)
		.then((comment) => {
			// 自分の投稿したコメントまたは自分のステージまたは管理者のみ削除可
			passportManager.validateUserIdOrAdmin(req, comment.userId);
			return comment.destroy();
		})
		.then(res.json.bind(res))
		.catch(next);
});

/**
 * @swagger
 * /stages/{id}/favorite/:
 *   post:
 *     tags:
 *       - stages
 *     summary: お気に入り設定
 *     description: ステージをお気に入りに設定する。
 *     security:
 *       - AuthToken: []
 *     parameters:
 *       - $ref: '#/parameters/stageIdPathParam'
 *     responses:
 *       200:
 *         description: 設定成功
 *         schema:
 *           $ref: '#/definitions/StageFavorite'
 *       400:
 *         $ref: '#/responses/BadRequest'
 *       404:
 *         $ref: '#/responses/NotFound'
 */
router.post('/:id/favorite', passportManager.authorize(), function (req, res, next) {
	// 参照可能なステージにのみ投稿可能
	Stage.scope({ method: ['accessible', req.user.id] }).findById<Stage>(validationUtils.toNumber(req.params.id))
		.then(validationUtils.notFound)
		.then((stage) => stage.header.addFavoriteByUserId(req.user.id))
		.then(res.json.bind(res))
		.catch(next);
});

/**
 * @swagger
 * /stages/{id}/favorite/:
 *   delete:
 *     tags:
 *       - stages
 *     summary: お気に入り解除
 *     description: ステージをお気に入りから解除する。
 *     security:
 *       - AuthToken: []
 *     parameters:
 *       - $ref: '#/parameters/stageIdPathParam'
 *     responses:
 *       200:
 *         description: 解除成功
 *         schema:
 *           $ref: '#/definitions/StageFavorite'
 *       400:
 *         $ref: '#/responses/BadRequest'
 *       404:
 *         $ref: '#/responses/NotFound'
 */
router.delete('/:id/favorite', passportManager.authorize(), function (req, res, next) {
	Stage.scope("withuser").findById<Stage>(validationUtils.toNumber(req.params.id))
		.then(validationUtils.notFound)
		.then((stage) => stage.header.removeFavoriteByUserId(req.user.id))
		.then(res.json.bind(res))
		.catch(next);
});

/**
 * @swagger
 * /stages/{id}/rating/:
 *   post:
 *     tags:
 *       - stages
 *     summary: レーティング指定
 *     description: ステージのレーティングを指定する。
 *     security:
 *       - AuthToken: []
 *     parameters:
 *       - $ref: '#/parameters/stageIdPathParam'
 *       - in: body
 *         name: body
 *         description: レーティング情報
 *         required: true
 *         schema:
 *           type: object
 *           required:
 *             - rating
 *           properties:
 *             rating:
 *               type: integer
 *               description: レーティング
 *     responses:
 *       200:
 *         description: 指定成功
 *         schema:
 *           $ref: '#/definitions/StageRating'
 *       400:
 *         $ref: '#/responses/BadRequest'
 *       404:
 *         $ref: '#/responses/NotFound'
 */
router.post('/:id/rating', passportManager.authorize(), function (req, res, next) {
	// 参照可能なステージにのみ投稿可能
	Stage.scope({ method: ['accessible', req.user.id] }).findById<Stage>(validationUtils.toNumber(req.params.id))
		.then(validationUtils.notFound)
		.then((stage) => stage.header.setRating(req.user.id, req.body.rating))
		.then(res.json.bind(res))
		.catch(next);
});

module.exports = router;