/**
 * ブロックコントローラのNode.jsモジュール。
 *
 * ブロックくずしのブロックマスタ定義のRESTアクセスに対応する。
 * @module ./routes/api/blocks
 */
/**
 * @swagger
 * tags:
 *   name: blocks
 *   description: ブロック関連API
 *
 * parameters:
 *   blockKeyPathParam:
 *     in: path
 *     name: key
 *     description: ブロックキー
 *     required: true
 *     type: string
 *
 * definitions:
 *   EditBlock:
 *     type: object
 *     description: ブロック情報
 *     required:
 *       - key
 *       - name
 *       - status
 *       - hp
 *       - score
 *       - xsize
 *       - ysize
 *       - color
 *     properties:
 *       key:
 *         type: string
 *         description: ブロックキー
 *         minLength: 1
 *       name:
 *         type: string
 *         description: ブロック名
 *         minLength: 1
 *       status:
 *         type: string
 *         description: ステータス (enable/disable)
 *         enum:
 *           - enable
 *           - disable
 *       hp:
 *         type: integer
 *         description: HP
 *       score:
 *         type: integer
 *         description: 得点
 *       xsize:
 *         type: integer
 *         description: X方向サイズ
 *       ysize:
 *         type: integer
 *         description: Y方向サイズ
 *       color:
 *         type: integer
 *         description: RGB色
 *   Block:
 *     allOf:
 *       - $ref: '#/definitions/EditBlock'
 *       - properties:
 *           createdAt:
 *             type: string
 *             format: date-time
 *             description: 登録日時
 *           updatedAt:
 *             type: string
 *             format: date-time
 *             description: 更新日時
 */
// ↓なぜか↑のswaggerコメントがコンパイル時に消されるので対策
const DUMMY = 0;

import * as express from 'express';
import expressPromiseRouter from 'express-promise-router';
import passportManager from '../../core/passport-manager';
import validationUtils from '../../core/utils/validation-utils';
import Block from '../../models/block';
const router = expressPromiseRouter();

/**
 * @swagger
 * /blocks:
 *   get:
 *     tags:
 *       - blocks
 *     summary: ブロック一覧
 *     description: ブロックの一覧を取得する。
 *     responses:
 *       200:
 *         description: 取得成功
 *         schema:
 *           type: array
 *           items:
 *             $ref: '#/definitions/Block'
 */
router.get('/', async function (req: express.Request, res: express.Response): Promise<void> {
	const blocks = await Block.findAll<Block>();
	res.json(blocks);
});

/**
 * @swagger
 * /blocks:
 *   post:
 *     tags:
 *       - blocks
 *     summary: ブロック新規作成
 *     description: ブロックを新規作成する。
 *     security:
 *       - SessionId: []
 *     parameters:
 *       - in: body
 *         name: body
 *         description: ブロック情報
 *         required: true
 *         schema:
 *           $ref: '#/definitions/EditBlock'
 *     responses:
 *       200:
 *         description: 登録成功
 *         schema:
 *           $ref: '#/definitions/Block'
 *       400:
 *         $ref: '#/responses/BadRequest'
 *       403:
 *         $ref: '#/responses/Forbidden'
 */
router.post('/', passportManager.isAuthenticated('admin'), async function (req: express.Request, res: express.Response): Promise<void> {
	const block = await Block.create<Block>(req.body);
	res.json(block);
});

/**
 * @swagger
 * /blocks/{key}:
 *   get:
 *     tags:
 *       - blocks
 *     summary: ブロック取得
 *     description: 指定されたブロックを取得する。
 *     parameters:
 *       - $ref: '#/parameters/blockKeyPathParam'
 *     responses:
 *       200:
 *         description: 取得成功
 *         schema:
 *           $ref: '#/definitions/Block'
 *       404:
 *         $ref: '#/responses/NotFound'
 */
router.get('/:key', async function (req: express.Request, res: express.Response): Promise<void> {
	const block = await Block.findById<Block>(req.params.key);
	validationUtils.notFound(block);
	res.json(block);
});

/**
 * @swagger
 * /blocks/{key}:
 *   put:
 *     tags:
 *       - blocks
 *     summary: ブロック更新
 *     description: ブロックを更新する。
 *     security:
 *       - SessionId: []
 *     parameters:
 *       - $ref: '#/parameters/blockKeyPathParam'
 *       - in: body
 *         name: body
 *         description: ブロック情報
 *         required: true
 *         schema:
 *           $ref: '#/definitions/EditBlock'
 *     responses:
 *       200:
 *         description: 更新成功
 *         schema:
 *           $ref: '#/definitions/Block'
 *       400:
 *         $ref: '#/responses/BadRequest'
 *       403:
 *         $ref: '#/responses/Forbidden'
 *       404:
 *         $ref: '#/responses/NotFound'
 */
router.put('/:key', passportManager.isAuthenticated('admin'), async function (req: express.Request, res: express.Response): Promise<void> {
	let block = await Block.findById<Block>(req.params.key);
	validationUtils.notFound(block);
	block.merge(req.body);
	block = await block.save();
	res.json(block);
});

export default router;