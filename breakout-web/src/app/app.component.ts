/**
 * @file ブロックくずしメーカールートコンポーネント。
 */
import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import localeHelper from './core/locale-helper';

/**
 * ブロックくずしメーカーコンポーネントクラス。
 */
@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
	/**
	 * サービスをDIしてコンポーネントを生成する。
	 * @param titleService タイトルサービス。
	 * @param translate 国際化サービス。
	 */
	constructor(
		private titleService: Title,
		private translate: TranslateService) { }

	/**
	 * コンポーネント起動時の処理。
	 */
	ngOnInit(): void {
		// アプリで使用する言語を設定
		this.translate.setDefaultLang('en');
		this.translate.use(localeHelper.getLanguage());

		// タイトルを言語に応じて切り替え
		// ※ titleはテンプレート側では変更不可 https://angular.io/guide/set-document-title
		this.translate.onLangChange.subscribe(() => {
			this.translate.get('APP_NAME').subscribe((res: string) => {
				this.titleService.setTitle(res);
			});
		});
	}
}
