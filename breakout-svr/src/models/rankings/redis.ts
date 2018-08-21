/**
 * ランキングデータベース用Redisモジュール。
 * @module ./models/rankings/redis
 */
import * as log4js from 'log4js';
import * as config from 'config';
import * as redis from 'redis-promisify';
import { IRedisClientAsync } from '../../core/redis/redis-async-interface';
const logger = log4js.getLogger('debug');

/**
 * ランキング用のRedisクライアントを生成する。
 * ※ 使い終わったら必ず client.quit() を実行してください。
 * @returns Redisクライアント。
 */
export function createClient(): IRedisClientAsync {
	return redis.createClient(config['redis']['ranking']);
}

const client = createClient();

/**
 * ランキング用のRedisクライアントを取得する。
 * @returns Redisクライアント。
 */
export function getClient(): IRedisClientAsync {
	return client;
}

// Redisコマンドログ出力の設定
// ※ monitorで実行しているため、アプリ外のRedisコマンドのログも全て出力される
if (config['debug']['redisLog']) {
	const mclient = createClient();
	mclient.monitorAsync()
		.then(() => {
			mclient.on("monitor", (time, args, raw_reply) => {
				logger.debug("Executing (redis): " + args.join(" "));
			});
		}).catch((err) => {
			logger.error(err);
		});
}
