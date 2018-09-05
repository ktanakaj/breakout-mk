/**
 * ロケール関連のヘルパーモジュール。
 * @module ./app/core/locale-helper
 */
import browserHelper from './browser-helper';

// ※ 以下Angular内でやっていないのは、Angular初期化のタイミングなどでも使いたかったため

/**
 * アプリの言語設定を取得する。
 * @returns 2文字の言語コード。
 */
function getLanguage(): string {
	// クエリー→Cookie→ブラウザ設定の順に言語設定を取得する
	// （クエリーは特定言語版のページにリンクできるように、またユーザーが設定を変更できるように）
	let lang = getLanguageFromQuery();
	if (!lang) {
		lang = getLanguageFromCookie();
	}
	if (lang) {
		// Cookieに言語設定を保存or延長する
		setLanguageToCookie(lang);
		return lang;
	}
	return browserHelper.getLocale().substr(0, 2);
}

/**
 * クエリーパラメータの lang=en 等から言語設定を取得する。
 * @returns 言語設定、存在しない場合はnull。
 */
function getLanguageFromQuery(): string {
	const m = /[?$]lang=([^?$]+)/.exec(window.location.search);
	return m ? m[1] : null;
}

/**
 * Cookieの lang=en 等から言語設定を取得する。
 * @returns 言語設定、存在しない場合はnull。
 */
function getLanguageFromCookie(): string {
	const m = /(^|[\s;])lang=([^\s;]+)/.exec(document.cookie);
	return m ? m[2] : null;
}

/**
 * Cookieに lang=en のように言語設定を保存する。
 * @param lang 言語設定。
 */
function setLanguageToCookie(lang: string): void {
	document.cookie = `lang=${lang}; path=/; max-age=604800`;
}

/**
 * アプリのロケールを取得する。
 * @returns ロケールコード。
 */
function getLocale(): string {
	// ※ 現状はアプリのロケール=ブラウザのロケール
	return browserHelper.getLocale();
}

export default {
	getLanguage,
	getLocale,
};
