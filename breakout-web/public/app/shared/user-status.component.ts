/**
 * ユーザーステータスコンポーネント。
 * @module ./app/shared/user-status.component
 */
import { Component, Input } from '@angular/core';

/**
 * ユーザーステータスコンポーネントクラス。
 */
@Component({
	selector: 'user-status',
	template: '<span [ngSwitch]="status">' +
	'<span *ngSwitchCase="user">{{ "STATUS_USER" | translate }}</span>' +
	'<span *ngSwitchCase="admin">{{ "STATUS_ADMIN" | translate }}</span>' +
	'<span *ngSwitchCase="disable">{{ "STATUS_DISABLE" | translate }}</span>' +
	'<span *ngSwitchDefault>{{ status }}</span>' +
	'</span>',
})
export class UserStatusComponent {
	/** ステータス */
	@Input() status: string = '';
}

