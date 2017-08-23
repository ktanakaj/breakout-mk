/**
 * ステージレーティングコンポーネント。
 * @module ./app/shared/stage-rating.component
 */
import { Component, Input } from '@angular/core';

/**
 * ステージレーティングコンポーネントクラス。
 */
@Component({
	selector: 'stage-rating',
	template: '<rating [(ngModel)]="rating" [max]="5" [readonly]="true"></rating>({{ rating > 0 ? (rating | number:"1.1-1") : "-" }})',
})
export class StageRatingComponent {
	/** レーティング値 */
	@Input() rating: number = 0;
}
