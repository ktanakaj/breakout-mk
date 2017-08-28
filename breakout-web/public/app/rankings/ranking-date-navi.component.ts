/**
 * ランキング年月プルダウンコンポーネント。
 * @module ./app/rankings/ranking-date-navi.component
 */
import { Component, Input, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

/**
 * ランキング年月プルダウンコンポーネントクラス。
 */
@Component({
	selector: 'ranking-date-navi',
	templateUrl: 'app/rankings/ranking-date-navi.component.html',
})
export class RankingDateNaviComponent implements OnInit {
	/** レーティング値 */
	@Input() href: string = '';
	/** レーティング値 */
	@Input() keys: string[][] = [];
	/** レーティング値 */
	@Input() selected: string[] = [];

	selectedLabel: string = '';
	menus: { label: string, href: string }[] = [];

	/**
	 * サービスをDIしてコンポーネントを生成する。
	 * @param translate 国際化サービス。
	 */
	constructor(
		private translate: TranslateService) { }

	/**
	 * コンポーネント起動時の処理。
	 */
	async ngOnInit(): Promise<void> {
		this.selectedLabel = await this.makeLabel(this.selected.filter((v) => v));
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
		return new Promise<string>((resolve) => {
			if (!yearAndMonth || yearAndMonth.length == 0) {
				this.translate.get("TIME_SPAN_TOTAL").subscribe((res: string) => {
					resolve(res);
				});
			}
			if (yearAndMonth.length == 1) {
				this.translate.get("TIME_SPAN_STYLE_YEAR", { year: yearAndMonth[0] }).subscribe((res: string) => {
					resolve(res);
				});
			} else {
				this.translate.get("TIME_SPAN_STYLE_YEAR_AND_MONTH", { year: yearAndMonth[0], month: yearAndMonth[1] }).subscribe((res: string) => {
					resolve(res);
				});
			}
		});
	}
}
