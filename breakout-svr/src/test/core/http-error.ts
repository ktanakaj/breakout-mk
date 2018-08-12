/**
 * @file http-error.tsのテスト。
 */
import * as assert from 'power-assert';
import { HttpError } from '../../core/http-error';

describe('http-error', () => {
	describe('#constructor()', () => {
		it('should set default value', () => {
			let e = new HttpError();
			assert.equal(e.status, 500);
			assert.equal(e.message, "Internal Server Error");

			e = new HttpError(400);
			assert.equal(e.status, 400);
			assert.equal(e.message, "Bad Request");

			e = new HttpError(401);
			assert.equal(e.status, 401);
			assert.equal(e.message, "Unauthorized");

			e = new HttpError(403);
			assert.equal(e.status, 403);
			assert.equal(e.message, "Forbidden");

			e = new HttpError(404);
			assert.equal(e.status, 404);
			assert.equal(e.message, "Not Found");

			e = new HttpError(500);
			assert.equal(e.status, 500);
			assert.equal(e.message, "Internal Server Error");

			e = new HttpError(501);
			assert.equal(e.status, 501);
			assert.equal(e.message, "Not Implemented");

			e = new HttpError(503);
			assert.equal(e.status, 503);
			assert.equal(e.message, "Service Unavailable");

			e = new HttpError(999);
			assert.equal(e.status, 999);
			assert.equal(e.message, "Internal Server Error");

			e = new HttpError(404, "id=1 is not found");
			assert.equal(e.status, 404);
			assert.equal(e.message, "id=1 is not found");
		});
	});
});