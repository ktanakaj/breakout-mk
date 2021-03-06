/**
 * ブロックくずしメーカールートコンポーネントのテスト。
 * @module ./app/app.component.spec
 */
import { TestBed, async } from '@angular/core/testing';
import testHelper from '../test-helper';
import { TranslateService } from '@ngx-translate/core';
import { HeaderNaviComponent } from './core/header-navi.component';
import { AppComponent } from './app.component';

describe('AppComponent', () => {
	let translate: TranslateService;

	beforeEach(async(() => {
		testHelper.configureTestingModule({
			declarations: [
				HeaderNaviComponent,
				AppComponent
			],
		}).compileComponents();

		translate = TestBed.get(TranslateService);
	}));

	it('should create the app', async(() => {
		const fixture = TestBed.createComponent(AppComponent);
		const app = fixture.debugElement.componentInstance;
		expect(app).toBeTruthy();
	}));

	it('should render page', async(() => {
		const fixture = TestBed.createComponent(AppComponent);
		fixture.detectChanges();
		const compiled = fixture.debugElement.nativeElement;
		translate.get('COPYRIGHT').toPromise()
			.then((copyright) => {
				expect(compiled.querySelector('footer.footer').textContent).toContain(copyright);
			});
	}));
});
