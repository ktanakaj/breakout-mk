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
	template: "<span *ngIf=\"stage && stage.header && stage.header.deletedAt\">{{ 'STAGE.DELETED' | translate }}</span>" +
	"<span *ngIf=\"permission && stage && stage.header && stage.header.status == 'private'\">{{ \"STAGE.PRIVATE\" | translate }}</span>" +
	"<span *ngIf=\"stage && stage.status == 'updated'\">{{ 'STAGE.OLD_VERSION' | translate }}</span>" +
	"{{ stage.name }}",
})
export class StageLabelComponent {
	/** 表示するステージ */
	@Input() stage: Stage = null;
	/** プライベートを表示する場合true */
	@Input() permission: boolean = false;
}
