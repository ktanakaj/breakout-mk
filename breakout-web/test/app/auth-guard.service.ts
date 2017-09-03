/**
 * @file authGuard.service.tsのテスト。
 */
import { AuthGuard } from '../../public/app/authGuard.service';

describe('AuthGuard', () => {
	describe('#canActivate', () => {
		it('should check authorization success by the `me` API', (done) => {
			let guard = new AuthGuard(<any>{
				me: () => Promise.resolve(),
			}, <any>{});

			guard.canActivate(<any>{}, <any>{})
				.toPromise()
				.then((result) => expect(result).toEqual(true))
				.then(done)
				.catch(done);
		});

		it('should check authorization failed by the `me` API', (done) => {
			let guard = new AuthGuard(<any>{
				me: () => Promise.reject(new Error()),
			}, <any>{});

			guard.canActivate(<any>{}, <any>{})
				.toPromise()
				.then((result) => expect(result).toEqual(false))
				.then(done)
				.catch(done);
		});

		it('should check authorization success by cache', (done) => {
			let guard = new AuthGuard(<any>{
				admin: {},
				me: () => Promise.reject(new Error()),
			}, <any>{});

			guard.canActivate(<any>{}, <any>{})
				.toPromise()
				.then((result) => expect(result).toEqual(true))
				.then(done)
				.catch(done);
		});
	});
});