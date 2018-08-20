/**
 * ランキングデータベース用Redisモジュール。
 * @module ./models/rankings/redis
 */
import * as log4js from 'log4js';
import * as config from 'config';
import * as redis from 'redis-promisify';
import { IRedisClientAsync } from '../../core/redis/redis-async-interface';
const redisconfig = config['redis']['ranking'];
const logger = log4js.getLogger('debug');

// Redisコマンドログ出力の設定
// ※ monitorで実行しているため、アプリ外のRedisコマンドのログも全て出力される
if (config['debug']['redisLog']) {
	let mclient = redis.createClient(redisconfig);
	mclient.monitor();
	mclient.on("monitor", (time, args, raw_reply) => {
		logger.debug("Executing (redis): " + args.join(" "));
	});
}

/**
 * ランキング用のRedisクライアントを生成する。
 * @returns Redisクライアント。
 */
function createClient(): IRedisClientAsync {
	return redis.createClient(redisconfig);
}

let client = createClient();

/**
 * ランキング用のRedisクライアントを取得する。
 * @returns Redisクライアント。
 */
function getClient(): IRedisClientAsync {
	return client;
}

export default {
	createClient,
	getClient,
};