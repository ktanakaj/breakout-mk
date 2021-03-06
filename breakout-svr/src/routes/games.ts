/**
 * ゲームコントローラのNode.jsモジュール。
 *
 * ブロックくずしのゲームに関するAPIに対応する。
 * @module ./routes/game
 */
/**
 * @swagger
 * tags:
 *   name: games
 *   description: ゲーム関連API
 */
import * as express from 'express';
import expressPromiseRouter from 'express-promise-router';
import * as log4js from 'log4js';
import { BadRequestError } from '../core/utils/http-error';
import Stage from '../models/stage';
import Playlog from '../models/playlog';
const logger = log4js.getLogger('debug');
const router = expressPromiseRouter();

/**
 * @swagger
 * /games/start:
 *   post:
 *     tags:
 *       - games
 *     summary: ゲーム開始
 *     description: ゲームを開始する。
 *     security:
 *       - SessionId: []
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
router.post('/start', async function (req: express.Request, res: express.Response): Promise<void> {
	// ステージのアクセス可否チェック、ゲーム開始ログを保存
	const userId = req.user ? req.user.id : null;
	const stage = await (<typeof Stage>Stage.scope({ method: ['accessible', userId] })).findOrFail(req.body.stageId);
	const playlog = await Playlog.create({ stageId: stage.id, userId });
	res.json(playlog);
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
 *       - SessionId: []
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
router.post('/end', async function (req: express.Request, res: express.Response): Promise<void> {
	// プレイログの整合性をチェック。OKなら保存
	const playlog = await (<typeof Playlog>Playlog.scope("playing")).findOrFail(req.body.id);
	playlog.merge(req.body);
	if (playlog.hash() !== req.body.hash) {
		logger.info("Invalid Hash: " + req.body.hash + " !== " + playlog.hash());
		throw new BadRequestError(`hash=${req.body.hash} is not valid`);
	}
	await playlog.save();
	res.json(playlog);
});

export default router;