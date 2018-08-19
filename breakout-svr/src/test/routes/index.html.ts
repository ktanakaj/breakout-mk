/**
 * @file index.html.tsのテスト。
 */
import * as assert from 'power-assert';
import * as httpMocks from "node-mocks-http";
import testHelper from '../test-helper';
import router from '../../routes/index.html';

describe('/index.html', () => {
	it('should render default top page', async () => {
		const req = httpMocks.createRequest({
			method: 'GET',
			url: '/',
		});
		const res = await testHelper.callRequestHandler(router, req);

		assert.strictEqual(res._getRenderView(), 'index');
		const data = res._getRenderData();
		assert.strictEqual(data['lang'], 'en');
		assert.strictEqual(data['base'], '/');
		assert.strictEqual(data['appName'], 'Breakout Maker');
	});

	it('should render japanese top page', async () => {
		const headers = {};
		headers['accept-language'] = 'ja,en-US;q=0.9,en;q=0.8';
		const req = httpMocks.createRequest({
			method: 'GET',
			url: '/',
			headers,
		});
		const res = await testHelper.callRequestHandler(router, req);

		assert.strictEqual(res._getRenderView(), 'index');
		const data = res._getRenderData();
		assert.strictEqual(data['lang'], 'ja');
		assert.strictEqual(data['base'], '/');
		assert.strictEqual(data['appName'], 'ブロックくずしメーカー');
	});

	it('should render default top page for not japanese users', async () => {
		const headers = {};
		headers['accept-language'] = 'de,en-US;q=0.9,en;q=0.8';
		const req = httpMocks.createRequest({
			method: 'GET',
			url: '/',
			headers,
		});
		const res = await testHelper.callRequestHandler(router, req);

		assert.strictEqual(res._getRenderView(), 'index');
		const data = res._getRenderData();
		assert.strictEqual(data['lang'], 'en');
		assert.strictEqual(data['base'], '/');
		assert.strictEqual(data['appName'], 'Breakout Maker');
	});
});