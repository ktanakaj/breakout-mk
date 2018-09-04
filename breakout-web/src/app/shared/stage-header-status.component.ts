/**
 * ステージステータスコンポーネント。
 * @module ./app/shared/stage-header-status.component
 */
import { Component, Input } from '@angular/core';

/**
 * ステージステータスコンポーネントクラス。
 */
@Component({
	selector: 'stage-header-status',
	template: '<span [ngSwitch]="status">' +
		'<span *ngSwitchCase="\'public\'">{{ "STAGE.STATUS_PUBLIC" | translate }}</span>' +
		'<span *ngSwitchCase="\'private\'">{{ "STAGE.STATUS_PRIVATE" | translate }}</span>' +
		'<span *ngSwitchDefault>{{ status }}</span>' +
		'</span>',
})
export class StageHeaderStatusComponent {
	/** ステータス */
	@Input() status = '';
}
