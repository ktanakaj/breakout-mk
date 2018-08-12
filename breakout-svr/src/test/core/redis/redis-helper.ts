/**
 * @file redis-helper.tsのテスト。
 */
import * as assert from 'power-assert';
import redisHelper from '../../../core/redis/redis-helper';

describe('redis-helper', () => {
	describe('#yearAndMonthKeyToNumber()', () => {
		it('should convert number value for sorting', () => {
			// デフォルトは降順のソート用
			assert.strictEqual(redisHelper.yearAndMonthKeyToNumber(""), 999999);
			assert.strictEqual(redisHelper.yearAndMonthKeyToNumber("2016"), 201699);
			assert.strictEqual(redisHelper.yearAndMonthKeyToNumber("2016:8"), 201608);
			assert.strictEqual(redisHelper.yearAndMonthKeyToNumber("2016:08"), 201608);
			assert.strictEqual(redisHelper.yearAndMonthKeyToNumber("2016:12"), 201612);
			assert.strictEqual(redisHelper.yearAndMonthKeyToNumber("16:8"), 1608);

			// 引数を指定すると昇順用にもなる
			assert.strictEqual(redisHelper.yearAndMonthKeyToNumber("", true), 0);
			assert.strictEqual(redisHelper.yearAndMonthKeyToNumber("2016", true), 201600);
			assert.strictEqual(redisHelper.yearAndMonthKeyToNumber("2016:8", true), 201608);
			assert.strictEqual(redisHelper.yearAndMonthKeyToNumber("2016:12", true), 201612);
		});
	});
});