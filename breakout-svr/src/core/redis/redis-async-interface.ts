/**
 * promisefyされたRedisのインタフェース。
 * （redis-promisifyを使っているが、@typesがないので独自に定義）
 * @module ./core/redis/redis-async-interface
 */
import * as redis from 'redis';

export interface IRedisClientAsync extends redis.RedisClient {
	// ※ 現状一部しか定義されていません。
	// ※ 配列などで渡しても動くが、現状は単純な引数のみ対応。
	multi(): IRedisMultiAsync;
	quitAsync(): Promise<void>;
	echoAsync(): Promise<string>;
	existsAsync(key: string): Promise<number>;
	delAsync(key: string): Promise<number>;
	typeAsync(key: string): Promise<string>;
	keysAsync(pattern: string): Promise<string[]>;
	expireAsync(key: string, seconds: number): Promise<number>;
	flushdbAsync(): Promise<string>;
	zaddAsync(key: string, score: number, member: string): Promise<number>;
	zremAsync(key: string, member: string): Promise<number>;
	zcardAsync(key: string): Promise<number>;
	zcountAsync(key: string, min: number | string, max: number | string): Promise<number>;
	zincrbyAsync(key: string, increment: number, member: string): Promise<number>;
	zrangeAsync(key: string, start: number, stop: number, withscores?: 'WITHSCORES'): Promise<string[]>;
	zrevrangeAsync(key: string, start: number, stop: number, withscores?: 'WITHSCORES'): Promise<string[]>;
	zrankAsync(key: string, member: string): Promise<number | void>;
	zrevrankAsync(key: string, member: string): Promise<number | void>;
	zscoreAsync(key: string, member: string): Promise<string>;
	hsetAsync(key: string, field: string, value: string): Promise<number>;
	hsetnxAsync(key: string, field: string, value: string): Promise<number>;
	hgetAsync(key: string, field: string): Promise<string>;
	hdelAsync(key: string, field: string): Promise<number>;
	hgetallAsync(key: string): Promise<{ [key: string]: string }>;
	monitorAsync(): Promise<void>;
}

export interface IRedisMultiAsync extends redis.Multi {
	execAsync(): Promise<any[]>;
}
