"use strict";
/**
 * ゲームコントローラのNode.jsモジュール。
 *
 * ブロックくずしのゲームに関するAPIに対応する。
 * @module ./routes/api/game
 */
/**
 * @swagger
 * tags:
 *   name: games
 *   description: ゲーム関連API
 */
import * as express from 'express';
import * as log4js from 'log4js';
import passportManager from '../../core/passport-manager';
import { HttpError } from '../../core/http-error';
import validationUtils from '../../core/utils/validation-utils';
import { Stage } from '../../models/stage';
import { Playlog } from '../../models/playlog';
const logger = log4js.getLogger('debug');
const router = express.Router();

/**
 * @swagger
 * /games/start:
 *   post:
 *     tags:
 *       - games
 *     summary: ゲーム開始
 *     description: ゲームを開始する。
 *     security:
 *       - AuthToken: []
 *     parameters:
 *       - in: body
 *         name: body
 *         description: ゲーム情報
 *         required: true
 *         schema:
 *           type: object
 *           required:
 *             - stageId
 *           properties:
 *             stageId:
 *               type: integer
 *               description: ステージID
 *               format: int32
 *     responses:
 *       200:
 *         description: 開始成功
 *         schema:
 *           $ref: '#/definitions/Playlog'
 *       404:
 *         $ref: '#/responses/NotFound'
 */
router.post('/start', passportManager.authorize(), function (req, res, next) {
	// ステージのアクセス可否チェック、ゲーム開始ログを保存
	const userId = req.user.id;
	Stage.scope({ method: ['accessible', userId] }).findById(validationUtils.toNumber(req.body.stageId))
		.then(validationUtils.notFound)
		.then((stage) => {
			return Playlog.create({ stageId: stage.id, userId: userId });
		})
		.then(res.json.bind(res))
		.catch(next);
});

/**
 * @swagger
 * /games/end:
 *   post:
 *     tags:
 *       - games
 *     summary: ゲーム終了
 *     description: ゲームを終了する。
 *     security:
 *       - AuthToken: []
 *     parameters:
 *       - in: body
 *         name: body
 *         description: ゲーム結果
 *         required: true
 *         schema:
 *           type: object
 *           required:
 *             - id
 *             - score
 *             - cleared
 *             - hash
 *           properties:
 *             id:
 *               type: integer
 *               description: プレイログID
 *               format: int64
 *             score:
 *               type: integer
 *               description: 獲得スコア
 *               format: int32
 *             cleared:
 *               type: boolean
 *               description: クリアしたか？
 *             hash:
 *               type: string
 *               description: 整合性検証用のプレイログハッシュ値
 *     responses:
 *       200:
 *         description: 終了成功
 *         schema:
 *           $ref: '#/definitions/Playlog'
 *       400:
 *         $ref: '#/responses/BadRequest'
 *       404:
 *         $ref: '#/responses/NotFound'
 */
router.post('/end', function (req, res, next) {
	// プレイログの整合性をチェック。OKなら保存
	Playlog.scope("playing").findById<Playlog>(validationUtils.toNumber(req.body.id))
		.then(validationUtils.notFound)
		.then((playlog) => {
			playlog.merge(req.body);
			if (playlog.hash() !== req.body.hash) {
				logger.info(playlog.hash() + " !== " + req.body.hash);
				throw new HttpError(400);
			}
			return playlog.save();
		})
		.then((playlog) => res.json(playlog))
		.catch(next);
});

module.exports = router;