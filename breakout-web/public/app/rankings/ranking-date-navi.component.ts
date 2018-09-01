/**
 * ランキング年月プルダウンコンポーネント。
 * @module ./app/rankings/ranking-date-navi.component
 */
import { Component, Input } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

/**
 * ランキング年月プルダウンコンポーネントクラス。
 */
@Component({
	selector: 'ranking-date-navi',
	templateUrl: 'app/rankings/ranking-date-navi.component.html',
})
export class RankingDateNaviComponent {
	/** ベースのURL */
	href: string = '';
	/** 年月キー */
	keys: string[][] = [];
	/** 選択中の年月ラベル */
	selectedLabel: string = '';
	/** メニュー配列 */
	menus: { label: string, href: string }[] = [];

	/**
	 * サービスをDIしてコンポーネントを生成する。
	 * @param translate 国際化サービス。
	 */
	constructor(
		private translate: TranslateService) { }

	/**
	 * ベースのURLを設定する。
	 * @param href ベースのURL。
	 */
	@Input('href')
	set setHref(href: string) {
		this.href = href;
		this.updateMenus();
	}

	/**
	 * 年月キーを設定する。
	 * @param keys 年月キー。
	 */
	@Input('keys')
	set setKeys(keys: string[][]) {
		this.keys = keys;
		this.updateMenus();
	}

	/**
	 * 選択中のキーを設定する。
	 * @param selected 選択中のキー。
	 */
	@Input('selected')
	set setSelected(selected: string[]) {
		this.makeLabel(selected.filter((v) => v))
			.then((label) => this.selectedLabel = label);
	}

	/**
	 * メニューを更新する。
	 * @returns 処理状態。
	 */
	async updateMenus(): Promise<void> {
		this.menus = [];
		if (Array.isArray(this.keys)) {
			for (let i in this.keys) {
				let yearAndMonth = this.keys[i].filter((v) => v);
				const label = await this.makeLabel(yearAndMonth);
				this.menus.push({ label, href: this.href + yearAndMonth.join("/") });
			}
		}
	}

	/**
	 * ランキングの年月からラベルを生成する。
	 * @param yearAndMonth [年,月] 形式のキー。
	 * @returns ラベル文字列。
	 */
	async makeLabel(yearAndMonth: string[]): Promise<string> {
		let key: string = "TIME_SPAN.TOTAL";
		let params: Object = {};
		if (yearAndMonth) {
			if (yearAndMonth.length === 1) {
				key = "TIME_SPAN.YEAR";
				params = { year: yearAndMonth[0] };
			} else if (yearAndMonth.length > 1) {
				key = "TIME_SPAN.YEAR_AND_MONTH";
				params = { year: yearAndMonth[0], month: yearAndMonth[1] };
			}
		}
		return this.translate.get(key, params).toPromise();
	}
}
