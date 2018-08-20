/**
 * RedisのSortedSetを扱うコレクションクラス。
 * @module ./core/redis/sorted-set
 */
import { IRedisClientAsync, IRedisMultiAsync } from './redis-async-interface';

export interface Entry {
	no: number;
	member: string;
	score: number;
}

/**
 * RedisのSortedSetを扱うコレクションクラス。
 *
 * member (key) と score (value) が格納可能で、score の値で自動的にソートされる。
 * （Set と言いつつ SortedMap に近い。）
 * Asyncが付かないメソッドは、commit() のタイミングで保存される。
 */
export class SortedSet {
	/** コレクションと対応するRedisのZセットのキー */
	protected key: string;
	/** Redisクライアント */
	protected client: IRedisClientAsync;
	/** Redis multiクライアント */
	protected multi: IRedisMultiAsync;

	/**
	 * コレクションインスタンスを生成する。
	 * @param key SortedSetのRedisキー。
	 * @param client 参照するclientインスタンス。
	 * @param multi 参照するmultiインスタンス。
	 */
	constructor(key: string, client: IRedisClientAsync, multi: IRedisMultiAsync = null) {
		// キーに加え、一部だけトランザクション分けられるようにmultiをプロパティで持つ
		this.key = key;
		this.client = client;
		this.multi = multi || this.client.multi();
	}

	/**
	 * 指定されたメンバーとスコアを登録する。※要コミット
	 * @param member キー。
	 * @param score 値。
	 * @returns SortedSetオブジェクト。
	 */
	set(member: string, score: number): SortedSet {
		this.multi.zadd(this.key, [score, member]);
		return this;
	}

	/**
	 * 指定されたメンバーを削除する。※要コミット
	 * @param member キー。
	 */
	delete(member: string): void {
		this.multi.zrem(this.key, [member]);
	}

	/**
	 * 指定されたメンバーをインクリメントする。※要コミット
	 * @param member キー。
	 * @param add 増分。減らす場合はマイナスする。
	 */
	increment(member: string, add: number = 1): void {
		this.multi.zincrby(this.key, add, member);
	}

	/**
	 * 全てのメンバーを削除する。※要コミット
	 */
	clear(): void {
		this.multi.del(this.key);
	}

	/**
	 * このコレクションの未コミットのデータをRedisに反映する。
	 * @returns 反映結果。
	 */
	async commit(): Promise<void> {
		await this.multi.execAsync();
	}

	/**
	 * 指定されたメンバーのスコアを取得する。
	 * @param member キー。
	 * @returns 検索結果。
	 */
	async getAsync(member: string): Promise<number> {
		// スコアは通常数値なので変換
		const score = await this.client.zscoreAsync(this.key, member);
		return Number(score);
	}

	/**
	 * 指定されたメンバーとスコアを登録する。
	 * @param member キー。
	 * @param score 値。
	 * @returns 保存結果。
	 */
	async setAsync(member: string, score: number): Promise<void> {
		await this.client.zaddAsync(this.key, [score, member]);
	}

	/**
	 * 指定されたメンバーを削除する。
	 * @param member キー。
	 * @returns 削除結果。
	 */
	async deleteAsync(member: string): Promise<void> {
		await this.client.zremAsync(this.key, [member]);
	}

	/**
	 * 指定されたメンバーのスコアをインクリメントする。
	 * @param member キー。
	 * @param add 増分。減らす場合はマイナスする。
	 * @returns 保存結果。
	 */
	async incrementAsync(member: string, add: number = 1): Promise<void> {
		await this.client.zincrbyAsync(this.key, add, member);
	}

	/**
	 * 全てのメンバーを削除する。
	 * @returns 削除結果。
	 */
	async clearAsync(): Promise<void> {
		await this.client.delAsync(this.key);
	}

	/**
	 * コレクションの要素を取得する。
	 * @param start 取得開始位置。デフォルトは先頭。
	 * @param end 取得終了位置。デフォルトは末尾。
	 * @param desc 降順に取得する場合true。
	 * @returns 検索結果。
	 */
	async entriesAsync(start: number = 0, end: number = -1, desc: boolean = false): Promise<Entry[]> {
		let results;
		if (desc) {
			results = await this.client.zrevrangeAsync(this.key, start, end, "withscores");
		} else {
			results = await this.client.zrangeAsync(this.key, start, end, "withscores");
		}
		return this.withscoresToObjs(start, results);
	}

	/**
	 * withscoresでmember,scoreの順に2件で来るのをまとめる。
	 * @param start 検索開始位置。
	 * @param results withscoresでの検索結果。
	 * @returns 検索結果オブジェクトの配列。
	 */
	private withscoresToObjs(start: number, results: string[]): Entry[] {
		const objs: Entry[] = [];
		for (let i = 0; i + 1 < results.length; i += 2) {
			objs.push({
				// スコアは通常数値なので変換
				no: start + Math.floor(i / 2) + 1,
				member: results[i],
				score: Number(results[i + 1]),
			});
		}
		return objs;
	}

	/**
	 * 指定されたメンバーとスコアがもし登録済みのスコアより大きければ登録する。※要コミット
	 * @param member キー。
	 * @param score 値。
	 * @returns 登録有無。
	 */
	async setIfGreater(member: string, score: number): Promise<boolean> {
		const s = await this.client.zscoreAsync(this.key, member);
		if (!s || +score > +s) {
			this.set(member, score);
			return true;
		} else {
			return false;
		}
	}
}