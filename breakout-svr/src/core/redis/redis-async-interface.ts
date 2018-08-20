/**
 * promisefyされたRedisのインタフェース。
 * （redis-promisifyを使っているが、@typesがないので独自に定義）
 * @module ./core/redis/redis-async-interface
 */
import * as redis from 'redis';

export interface IRedisClientAsync extends redis.RedisClient {
	// TODO: 全部ちゃんと定義する
	multi(): IRedisMultiAsync;
	echoAsync(): Promise<string>;
	keysAsync(pattern: string): Promise<string[]>;
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
