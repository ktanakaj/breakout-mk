/**
 * ヘッダーナビコンポーネントのテスト。
 * @module ./app/core/header-navi.component.spec
 */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateService } from '@ngx-translate/core';
import testHelper from '../../test-helper';

import { HeaderNaviComponent } from './header-navi.component';

describe('HeaderNaviComponent', () => {
	let component: HeaderNaviComponent;
	let fixture: ComponentFixture<HeaderNaviComponent>;
	let translate: TranslateService;

	beforeEach(async(() => {
		testHelper.configureTestingModule({
			declarations: [HeaderNaviComponent],
		}).compileComponents();

		translate = TestBed.get(TranslateService);
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(HeaderNaviComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should render navi', async(() => {
		fixture = TestBed.createComponent(HeaderNaviComponent);
		fixture.detectChanges();
		const compiled = fixture.debugElement.nativeElement;
		translate.get('APP_NAME').toPromise()
			.then((appName) => {
				return translate.get('VERSION').toPromise()
					.then((version) => {
						expect(compiled.querySelector('.navbar-brand').textContent).toEqual(`${appName} Ver${version}`);
					});
			});
	}));
});
