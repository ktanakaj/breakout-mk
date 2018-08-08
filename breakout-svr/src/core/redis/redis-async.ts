/**
 * BluebirdでpromisefyAllされたRedisのインタフェース。
 * @module ./core/redis/redis-async
 */
import * as redis from 'redis';

export const redisAsync = require('redis-promisify');

export interface IRedisClientAsync extends redis.RedisClient {
	multi(): IRedisMultiAsync;
	flushallAsync(): Promise<string>;
	echoAsync(): Promise<string>;
	keysAsync(pattern: string): Promise<string[]>;
	// TODO: 全部ちゃんと定義する
	delAsync;
	zaddAsync;
	zremAsync;
	zcardAsync(key: string): Promise<number>;
	zcountAsync(key: string, min: number | string, max: number | string): Promise<number>;
	zincrbyAsync(key: string, increment: number, member: string): Promise<number>;
	zrangeAsync(key: string, start: number, stop: number): Promise<string[]>;
	zrangeAsync(key: string, start: number, stop: number, withscores: string): Promise<string[]>;
	zrevrangeAsync(key: string, start: number, stop: number): Promise<string[]>;
	zrevrangeAsync(key: string, start: number, stop: number, withscores: string): Promise<string[]>;
	zrankAsync(key: string, member: string): Promise<number | void>;
	zscoreAsync(key: string, member: string): Promise<string>;
}

export interface IRedisMultiAsync extends redis.Multi {
	execAsync(): Promise<any[]>;
}
