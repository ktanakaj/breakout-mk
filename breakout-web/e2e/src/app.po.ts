/**
 * ブロックくずしメーカーアプリページオブジェクト。
 * @module ./app.po
 */
import { browser, by, element } from 'protractor';

/**
 * ブロックくずしメーカーアプリページクラス。
 */
export class AppPage {
	navigateTo() {
		return browser.get('/');
	}

	getHeaderTitle() {
		return element(by.css('header .navbar-brand')).getText();
	}

	getUnityFrame() {
		return element(by.id('unity-frame'));
	}
}
