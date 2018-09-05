/**
 * ブラウザ関連のヘルパーモジュール。
 * @module ./app/core/browser-helper
 */

/**
 * ブラウザのロケールを取得する。
 * @returns ロケールコード。
 */
function getLocale(): string {
	// 取得失敗時はデフォルトとしてアメリカを返す
	try {
		return navigator.language;
	} catch (e) {
		return 'en-US';
	}
}

/**
 * ページをリダイレクトする。
 * @param url URL。
 */
function redirect(url: string): void {
	// ※ ブラウザの素のリダイレクト。Angularのルートは呼ばれない
	window.location.href = url;
}

/**
 * ページを再読み込みする。
 */
function reload(): void {
	// ※ ブラウザの素の再読み込み。Angularのルートは呼ばれない
	window.location.reload(true);
}

export default {
	getLocale,
	redirect,
	reload,
};
