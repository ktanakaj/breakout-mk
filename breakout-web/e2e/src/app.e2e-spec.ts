/**
 * ブロックくずしメーカーe2eテスト。
 * @module ./app.e2e-spec
 */
import { AppPage } from './app.po';

describe('breakout-web', () => {
	let page: AppPage;

	beforeEach(() => {
		page = new AppPage();
	});

	it('should display top page', () => {
		page.navigateTo();
		expect(page.getHeaderTitle()).toMatch(/Breakout Maker Ver[0-9\.]+/);
		expect(page.getUnityFrame()).toBeTruthy();
	});
});
