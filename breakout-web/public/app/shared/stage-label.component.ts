/**
 * ステージタイトルコンポーネント。
 * @module ./app/shared/stage-label.component
 */
import { Component, Input } from '@angular/core';
import { Stage } from '../stages/stage.model';

/**
 * ステージタイトルコンポーネントクラス。
 */
@Component({
	selector: 'stage-label',
	template: "<span *ngIf=\"stage.header.deletedAt\">{{ 'DELETED' | translate }}</span>" +
	"<span *ngIf=\"permission && stage.header.status == 'private'\">{{ \"PRIVATE\" | translate }}</span>" +
	"<span *ngIf=\"stage.status == 'updated'\">{{ 'OLD_VERSION' | translate }}</span>" +
	"{{ stage.name }}",
})
export class StageLabelComponent {
	/** 表示するステージ */
	@Input() stage: Stage = null;
	/** プライベートを表示する場合true */
	@Input() permission: boolean = false;
}
