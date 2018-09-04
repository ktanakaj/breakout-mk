/**
 * @file auth-guard.service.tsのテスト。
 */
import { AuthGuard } from './auth-guard.service';

describe('AuthGuard', () => {
	describe('#canActivate', () => {
		it('should check authorization success by the `me` API', async () => {
			const guard = new AuthGuard(<any>{
				checkSession: () => true,
			}, <any>{
				navigate: () => { },
			});

			const result = await guard.canActivate(<any>{}, <any>{});
			expect(result).toEqual(true);
		});

		it('should check authorization failed by the `me` API', async () => {
			const guard = new AuthGuard(<any>{
				checkSession: () => false,
			}, <any>{
				navigate: () => { },
			});

			const result = await guard.canActivate(<any>{}, <any>{});
			expect(result).toEqual(false);
		});

		it('should check authorization success by cache', async () => {
			const guard = new AuthGuard(<any>{
				me: {},
				checkSession: () => false,
			}, <any>{
				navigate: () => { },
			});

			const result = await guard.canActivate(<any>{}, <any>{});
			expect(result).toEqual(true);
		});
	});
});
