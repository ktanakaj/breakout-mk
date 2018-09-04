/**
 * ステージリンクコンポーネント。
 * @module ./app/shared/stage-link.component
 */
import { Component, Input } from '@angular/core';
import { Stage } from '../stages/stage.model';

/**
 * ステージリンクコンポーネントクラス。
 */
@Component({
	selector: 'stage-link',
	template: "<span *ngIf=\"stage && stage.header && stage.header.deletedAt\">"
		+ "<stage-label [stage]=\"stage\" [permission]=\"permission\"></stage-label></span>"
		+ "<a *ngIf=\"stage && (!stage.header || !stage.header.deletedAt)\" routerLink=\"/stages/{{ stage.id }}\">"
		+ "<stage-label [stage]=\"stage\" [permission]=\"permission\"></stage-label></a>",
})
export class StageLinkComponent {
	/** 表示するステージ */
	@Input() stage: Stage = null;
	/** プライベートを表示する場合true */
	@Input() permission = false;
}
