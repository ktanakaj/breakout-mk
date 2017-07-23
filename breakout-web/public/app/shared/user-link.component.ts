/**
 * ユーザーリンクコンポーネント。
 * @module ./app/shared/user-link.component
 */
import { Component, Input } from '@angular/core';
import { User } from '../users/user.model';

/**
 * ユーザーリンクコンポーネントクラス。
 */
@Component({
	selector: 'user-link',
	template: "<a *ngIf=\"user != null\" routerLink=\"/users/{{ user.id }}\">{{ user.name }}</a><span *ngIf=\"user == null && nouser\">{{ 'NOUSER' | translate }}</span>",
})
export class UserLinkComponent {
	/** 表示するユーザー */
	@Input() user: User = null;
	/** NOUSERを表示する場合true */
	@Input() nouser: boolean = false;
}
