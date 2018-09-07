/**
 * @file auth.guard.tsのテスト。
 */
import { async, inject } from '@angular/core/testing';
import testHelper from '../test-helper';

import { AuthGuard } from './auth.guard';

describe('AuthGuard', () => {
	beforeEach(() => {
		testHelper.configureTestingModule({
			providers: [AuthGuard]
		});
	});

	it('should ...', inject([AuthGuard], (guard: AuthGuard) => {
		expect(guard).toBeTruthy();
	}));

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
