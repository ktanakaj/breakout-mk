"use strict";
/**
 * RedisのSortedSetを扱うコレクションクラス。
 * @module ./libs/sorted-set
 */
import * as redis from 'redis';
import redisHelper from './redis-helper';

/**
 * RedisのSortedSetを扱うコレクションクラス。
 *
 * member (key) と score (value) が格納可能で、score の値で自動的にソートされる。
 * （Set と言いつつ SortedMap に近い。）
 * Asyncが付かないメソッドは、commit() のタイミングで保存される。
 */
export class SortedSet {
	key: string;
	client: redis.RedisClient | any;
	multi: redis.Multi | any;

	/**
	 * コレクションインスタンスを生成する。
	 * @param {string} key SortedSetのRedisキー。
	 * @param {Object} multi 参照するmultiインスタンス。
	 */
	constructor(key: string, multi: redis.Multi = null) {
		// キーに加え、一部だけトランザクション分けられるようにmultiをプロパティで持つ
		this.key = key;
		this.client = redisHelper.client;
		this.multi = multi || this.client.multi();
	}

	/**
	 * 指定されたメンバーとスコアを登録する。※要コミット
	 * @param {string} member キー。
	 * @param {number} score 値。
	 * @returns {SortedSet} SortedSetオブジェクト。
	 */
	set(member, score) {
		this.multi.zadd(this.key, [score, member]);
		return this;
	}

	/**
	 * 指定されたメンバーを削除する。※要コミット
	 * @param {string} member キー。
	 */
	delete(member) {
		this.multi.zrem(this.key, [member]);
	}

	/**
	 * 指定されたメンバーをインクリメントする。※要コミット
	 * @param {string} member キー。
	 * @param {number} add 増分。減らす場合はマイナスする。
	 */
	increment(member, add = 1) {
		this.multi.zincrby(this.key, add, member);
	}

	/**
	 * 全てのメンバーを削除する。※要コミット
	 */
	clear() {
		this.multi.del(this.key);
	}

	/**
	 * このコレクションの未コミットのデータをRedisに反映する。
	 * @returns {Promise} 反映結果。
	 */
	commit() {
		return this.multi.execAsync();
	}

	/**
	 * 指定されたメンバーのスコアを取得する。
	 * @param {string} member キー。
	 * @returns {Promise.<number>} 検索結果。
	 */
	getAsync(member) {
		// スコアは通常数値なので変換
		return this.client.zscoreAsync(this.key, member)
			.then((score) => Number(score));
	}

	/**
	 * 指定されたメンバーとスコアを登録する。
	 * @param {string} member キー。
	 * @param {number} score 値。
	 * @returns {Promise} 保存結果。
	 */
	setAsync(member, score) {
		return this.client.zaddAsync(this.key, [score, member]);
	}

	/**
	 * 指定されたメンバーを削除する。
	 * @param {string} member キー。
	 * @returns {Promise} 削除結果。
	 */
	deleteAsync(member) {
		return this.client.zremAsync(this.key, [member]);
	}

	/**
	 * 指定されたメンバーのスコアをインクリメントする。
	 * @param {number} add 増分。減らす場合はマイナスする。
	 * @returns {Promise} 保存結果。
	 */
	incrementAsync(member, add = 1) {
		return this.client.zincrbyAsync(this.key, [add, member]);
	}

	/**
	 * 全てのメンバーを削除する。
	 * @returns {Promise} 削除結果。
	 */
	clearAsync() {
		return this.client.delAsync(this.key);
	}

	/**
	 * コレクションの要素を取得する。
	 * @param {number} start 取得開始位置。デフォルトは先頭。
	 * @param {number} end 取得終了位置。デフォルトは末尾。
	 * @param {boolean} desc 降順に取得する場合true。
	 * @returns {Promise.<Array>} 検索結果。
	 */
	entriesAsync(start = 0, end = -1, desc = false) {
		let promise;
		if (desc) {
			promise = this.client.zrevrangeAsync(this.key, start, end, "withscores");
		} else {
			promise = this.client.zrangeAsync(this.key, start, end, "withscores");
		}
		return promise.then((results) => this.withscoresToObjs(start, results));
	}

	/**
	 * withscoresでmember,scoreの順に2件で来るのをまとめる。
	 * @private
	 * @param {number} start 検索開始位置。
	 * @param {Array} results withscoresでの検索結果。
	 * @returns {Array} 検索結果オブジェクトの配列。
	 */
	withscoresToObjs(start, results) {
		const objs = [];
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
	 * @param {string} member キー。
	 * @param {number} score 値。
	 * @returns {Promise.<boolean>} 登録有無。
	 */
	setIfGreater(member, score) {
		return this.client.zscoreAsync(this.key, member)
			.then((s) => {
				if (!s || +score > +s) {
					this.set(member, score);
					return true;
				} else {
					return false;
				}
			});
	}
}