"use strict";
/**
 * ランキングコントローラのNode.jsモジュール。
 *
 * ブロックくずしの全体のランキングに関するAPIに対応する。
 * @module ./routes/api/rankings
 */
import * as express from 'express';
import expressPromiseRouter from 'express-promise-router';
import StagePlayRanking from '../../models/rankings/stage-play-ranking';
import StageRatingRanking from '../../models/rankings/stage-rating-ranking';
import StageFavoriteRanking from '../../models/rankings/stage-favorite-ranking';
import UserPlayRanking from '../../models/rankings/user-play-ranking';
import UserRatingRanking from '../../models/rankings/user-rating-ranking';
const router = expressPromiseRouter();

/**
 * @swagger
 * tags:
 *   name: rankings
 *   description: ランキング関連API
 */
/**
 * @swagger
 * /rankings/play/keys:
 *   get:
 *     tags:
 *       - rankings
 *     summary: ステージプレイ数ランキングの全キー取得
 *     description: ステージプレイ数ランキングの全キー一覧を取得する。
 *     responses:
 *       200:
 *         $ref: '#/responses/RankingKeys'
 */
router.get('/play/keys', async function (req: express.Request, res: express.Response): Promise<void> {
	const rankings = await StagePlayRanking.yearAndMonthsAsync();
	res.json(rankings);
});

/**
 * @swagger
 * /rankings/play/{year}/{month}/:
 *   get:
 *     tags:
 *       - rankings
 *     summary: 累計/年間/月間ステージプレイ数ランキング取得
 *     description: 累計/年間/月間ステージプレイ数ランキングを取得する。
 *     parameters:
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
 *                 description: ステージID
 *               score:
 *                 type: integer
 *                 description: 挑まれた回数
 *               stage:
 *                 $ref: '#/definitions/Stage'
 *               info:
 *                 type: object
 *                 properties:
 *                   stageId:
 *                     type: integer
 *                     description: ステージID
 *                   tried:
 *                     type: integer
 *                     description: 挑まれた回数
 *                   score:
 *                     type: integer
 *                     description: ハイスコア
 *                   cleared:
 *                     type: integer
 *                     description: クリアされた回数
 */
router.get(/\/play\/([0-9]*)\/?([0-9]*)/, async function (req: express.Request, res: express.Response): Promise<void> {
	const rankings = await new StagePlayRanking(req.params[0], req.params[1]).findRankingAsync();
	res.json(rankings);
});

/**
 * @swagger
 * /rankings/rating/:
 *   get:
 *     tags:
 *       - rankings
 *     summary: ステージ評価ランキング取得
 *     description: ステージ評価ランキングを取得する。
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
 *                 description: ステージID
 *               score:
 *                 type: integer
 *                 description: 平均評価
 *               stage:
 *                 $ref: '#/definitions/Stage'
 */
router.get('/rating/', async function (req: express.Request, res: express.Response): Promise<void> {
	const rankings = await new StageRatingRanking().findRankingAsync();
	res.json(rankings);
});

/**
 * @swagger
 * /rankings/favorite/:
 *   get:
 *     tags:
 *       - rankings
 *     summary: ステージお気に入り数ランキング取得
 *     description: ステージお気に入り数ランキング取得する。
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
 *                 description: ステージID
 *               score:
 *                 type: integer
 *                 description: お気に入り数
 *               stage:
 *                 $ref: '#/definitions/Stage'
 */
router.get('/favorite/', async function (req: express.Request, res: express.Response): Promise<void> {
	const rankings = await new StageFavoriteRanking().findRankingAsync();
	res.json(rankings);
});

/**
 * @swagger
 * /rankings/player/keys:
 *   get:
 *     tags:
 *       - rankings
 *     summary: アクティブプレイヤーランキングの全キー取得
 *     description: アクティブプレイヤーランキングの全キー一覧を取得する。
 *     responses:
 *       200:
 *         $ref: '#/responses/RankingKeys'
 */
router.get('/player/keys', async function (req: express.Request, res: express.Response): Promise<void> {
	const keys = await UserPlayRanking.yearAndMonthsAsync();
	res.json(keys);
});

/**
 * @swagger
 * /rankings/player/{year}/{month}/:
 *   get:
 *     tags:
 *       - rankings
 *     summary: 累計/年間/月間アクティブプレイヤーランキング取得
 *     description: 累計/年間/月間アクティブプレイヤーランキングを取得する。
 *     parameters:
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
 *                 description: プレイ回数
 *               user:
 *                 $ref: '#/definitions/User'
 *               info:
 *                 type: object
 *                 properties:
 *                   userId:
 *                     type: integer
 *                     description: ユーザーID
 *                   tried:
 *                     type: integer
 *                     description: プレイ回数
 *                   score:
 *                     type: integer
 *                     description: ハイスコア
 *                   cleared:
 *                     type: integer
 *                     description: クリア回数
 */
router.get(/\/player\/([0-9]*)\/?([0-9]*)/, async function (req: express.Request, res: express.Response): Promise<void> {
	const rankings = await new UserPlayRanking(req.params[0], req.params[1]).findRankingAsync();
	res.json(rankings);
});

/**
 * @swagger
 * /rankings/creator/:
 *   get:
 *     tags:
 *       - rankings
 *     summary: ユーザー作成ステージ評価ランキング取得
 *     description: ユーザー作成ステージ評価ランキングを取得する。
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
 *                 description: 平均評価
 *               user:
 *                 $ref: '#/definitions/User'
 *               info:
 *                 type: object
 *                 properties:
 *                   userId:
 *                     type: integer
 *                     description: ユーザーID
 *                   created:
 *                     type: integer
 *                     description: 作成ステージ数
 */
router.get('/creator/', async function (req: express.Request, res: express.Response): Promise<void> {
	const rankings = await new UserRatingRanking().findRankingAsync();
	res.json(rankings);
});

module.exports = router;