import { AppPage } from './app.po';

describe('breakout-web', () => {
	let page: AppPage;

	beforeEach(() => {
		page = new AppPage();
	});

	it('should display top page', () => {
		page.navigateTo();
		expect(page.getParagraphText()).toEqual('Breakout Maker');
	});
});
