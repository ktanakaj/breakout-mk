/**
 * @file object-utils.tsのテスト。
 */
import * as assert from 'power-assert';
import objectUtils from '../../../src/core/utils/object-utils';

describe('object-utils', () => {
	describe('#mergeArray()', () => {
		it('should merge two object arrays', () => {
			let objs1 = [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }];
			let objs2 = [{ uid: 3 }, { uid: 5 }, { uid: 1 }];
			objectUtils.mergeArray(objs1, objs2, "id", "uid", "sub");
			assert.deepStrictEqual(objs1, [{ id: 1, sub: { uid: 1 } }, { id: 2 }, { id: 3, sub: { uid: 3 } }, { id: 4 }]);

			objs1 = [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }];
			let objs3 = [{ uid: 2, data: { value: 30 } }, { uid: 3 }, { uid: 1, data: { value: 10 } }];
			objectUtils.mergeArray(objs1, objs3, "id", "uid", "value", "data.value");
			assert.deepStrictEqual(objs1, [{ id: 1, value: 10 }, { id: 2, value: 30 }, { id: 3, value: undefined }, { id: 4 }]);
		});
	});

	describe('#mergePushArray()', () => {
		it('should merge two object arrays', () => {
			let objs1 = [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }];
			let objs2 = [{ uid: 3 }, { uid: 5 }, { uid: 1 }, { uid: 1, hoge: "" }];
			objectUtils.mergePushArray(objs1, objs2, "id", "uid", "sub");
			assert.deepStrictEqual(objs1, [{ id: 1, sub: [{ uid: 1 }, { uid: 1, hoge: "" }] }, { id: 2 }, { id: 3, sub: [{ uid: 3 }] }, { id: 4 }]);

			let objs3 = [{ id: 1 }, { id: 2, values: [15] }, { id: 3 }, { id: 4 }];
			let objs4 = [{ uid: 2, data: { value: 30 } }, { uid: 3 }, { uid: 1, data: { value: 10 } }];
			objectUtils.mergePushArray(objs3, objs4, "id", "uid", "values", "data.value");
			assert.deepStrictEqual(objs3, [{ id: 1, values: [10] }, { id: 2, values: [15, 30] }, { id: 3, values: [undefined] }, { id: 4 }]);
		});
	});
});