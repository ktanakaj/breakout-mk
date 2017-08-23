/**
 * ユーザーレーティングコンポーネント。
 * @module ./app/shared/user-rating.component
 */
import { Component, Input } from '@angular/core';

/**
 * ユーザーレーティングコンポーネントクラス。
 */
@Component({
	selector: 'user-rating',
	template: '<rating [(ngModel)]="rating" [max]="5" [readonly]="true"></rating>({{ rating > 0 ? (rating | number:"1.1-1") : "-" }})',
})
export class UserRatingComponent {
	/** レーティング値 */
	@Input() rating: number = 0;
}
