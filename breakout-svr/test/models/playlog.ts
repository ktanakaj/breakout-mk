/**
 * @file playlog.jsのテスト。
 */
import * as assert from 'power-assert';
import Playlog from '../../src/models/playlog';

describe('Playlog', () => {
	describe('#hash()', () => {
		it('should return hashed value', () => {
			let playlog = Playlog.build<Playlog>({ id: 1, stageId: 2, userId: 3, score: 1000, cleared: true, createdAt: "2016-08-07T10:30:10.000Z", updatedAt: "2016-08-07T10:31:55.000Z" });
			assert.equal(playlog.hash(), "f86cbba6b6284cd08cbd18059b917b7d1b4e8f3c");
			playlog = Playlog.build<Playlog>({ id: 6, stageId: 1, userId: 1, score: 400, cleared: false, createdAt: "2016-08-07T11:55:58.000Z", updatedAt: "2016-08-07T11:55:58.000Z" });
			assert.equal(playlog.hash(), "5f9485b1efe65bbb239f9c702d9e607545c2a706");
		});
	});
});