/**
 * @file stage.tsのテスト。
 */
import { StageService } from './stage.service';
const service = new StageService(null);

describe('StageService', () => {
	describe('#mapStrToTable()', () => {
		it('should convert map data', () => {
			const table = service.mapStrToTable("[R] [G][G] [GOLD][GOLD] [R]\n\n[R2][R2]  [G2][G2]");
			expect(table).toEqual([
				["[R]", null, "[G]", "[G]", null, "[GOLD]", "[GOLD]", null, "[R]"],
				[],
				["[R2]", "[R2]", null, null, "[G2]", "[G2]"]
			]);
		});
	});
});
