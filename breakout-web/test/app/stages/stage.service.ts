/**
 * @file stage.tsのテスト。
 */
import * as assert from 'power-assert';
import { StageService } from '../../../public/app/stages/stage.service';
const service = new StageService(null);

describe('StageService', () => {
	describe('#mapStrToTable()', () => {
		it('should convert map data', () => {
			const table = service.mapStrToTable("[R] [G][G] [GOLD][GOLD] [R]\n\n[R2][R2]  [G2][G2]");
			assert.deepStrictEqual(table, [
				["[R]", null, "[G]", "[G]", null, "[GOLD]", "[GOLD]", null, "[R]"],
				[],
				["[R2]", "[R2]", null, null, "[G2]", "[G2]"]
			]);
		});
	});
});