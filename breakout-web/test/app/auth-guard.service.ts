/**
 * @file auth-guard.service.tsのテスト。
 */
import * as assert from 'power-assert';
import { AuthGuard } from '../../public/app/auth-guard.service';

describe('AuthGuard', () => {
	describe('#canActivate', () => {
		it('should check authorization success by the `me` API', async () => {
			let guard = new AuthGuard(<any>{
				checkSession: () => true,
			}, <any>{
				navigate: () => { },
			});

			const result = await guard.canActivate(<any>{}, <any>{});
			assert.strictEqual(result, true);
		});

		it('should check authorization failed by the `me` API', async () => {
			let guard = new AuthGuard(<any>{
				checkSession: () => false,
			}, <any>{
				navigate: () => { },
			});

			const result = await guard.canActivate(<any>{}, <any>{});
			assert.strictEqual(result, false);
		});

		it('should check authorization success by cache', async () => {
			let guard = new AuthGuard(<any>{
				me: {},
				checkSession: () => false,
			}, <any>{
				navigate: () => { },
			});

			const result = await guard.canActivate(<any>{}, <any>{});
			assert.strictEqual(result, true);
		});
	});
});