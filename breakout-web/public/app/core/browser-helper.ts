/**
 * ブラウザ関連のヘルパーモジュール。
 * @module ./app/core/browser-helper
 */

/**
 * ページの言語設定を取得する。
 * @returns 2文字の言語コード。
 */
function getLanguage(): string {
	// ※ サーバー側でブラウザの対応言語を見て動的にHTMLを生成している前提のコード
	//    その仕組みがない場合は、getLocale() の前2文字を使う
	// <html lang="ja"> の言語を返す。デフォルトは英語
	const element = document.documentElement;
	return element.getAttribute('lang') || 'en';
}

/**
 * ブラウザのロケールを取得する。
 * @returns ロケールコード。
 */
function getLocale(): string {
	// 取得失敗時はデフォルトとしてアメリカを返す
	try {
		return navigator.language;
	} catch (e) {
		return "en-US";
	}
}

/**
 * ページをリダイレクトする。
 * @param url URL。
 */
function redirect(url: string): void {
	// ※ ブラウザの素のリダイレクト。Angular2のルートは呼ばれない
	window.location.href = url;
}

/**
 * ページを再読み込みする。
 */
function reload(): void {
	// ※ ブラウザの素の再読み込み。Angular2のルートは呼ばれない
	window.location.reload(true);
}

export default {
	getLanguage,
	getLocale,
	redirect,
	reload,
};