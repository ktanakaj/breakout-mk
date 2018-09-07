/**
 * @file ブロックくずしメーカールートモジュール。
 */
import { NgModule, ErrorHandler, Injectable, LOCALE_ID } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule, HttpClient, HttpErrorResponse } from '@angular/common/http';
import { RouterModule, Routes } from '@angular/router';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { BsDropdownModule, CollapseModule, ModalModule, PopoverModule, RatingModule, PaginationModule } from 'ngx-bootstrap';
import localeHelper from './core/locale-helper';
import { UserService } from './users/user.service';
import { AppComponent } from './app.component';
import { AuthGuard } from './auth-guard.service';
import { SafeStylePipe } from './shared/safe-style.pipe';
import { StageLabelComponent } from './shared/stage-label.component';
import { StageLinkComponent } from './shared/stage-link.component';
import { StageHeaderStatusComponent } from './shared/stage-header-status.component';
import { StageRatingComponent } from './shared/stage-rating.component';
import { UserLinkComponent } from './shared/user-link.component';
import { UserStatusComponent } from './shared/user-status.component';
import { UserRatingComponent } from './shared/user-rating.component';
import { HeaderNaviComponent } from './core/header-navi.component';
import { GameComponent } from './games/game.component';
import { BlockListComponent } from './blocks/block-list.component';
import { BlockEditComponent } from './blocks/block-edit.component';
import { MapFormatValidator } from './stages/map-format-validator.directive';
import { StageNaviComponent } from './stages/stage-navi.component';
import { StagePreviewComponent } from './stages/stage-preview.component';
import { LatestStagesComponent } from './stages/latest-stages.component';
import { StageDetailComponent } from './stages/stage-detail.component';
import { StageEditComponent } from './stages/stage-edit.component';
import { UserListComponent } from './users/user-list.component';
import { UserNewComponent } from './users/user-new.component';
import { UserLoginComponent } from './users/user-login.component';
import { UserLogoutComponent } from './users/user-logout.component';
import { UserDetailComponent } from './users/user-detail.component';
import { UserEditComponent } from './users/user-edit.component';
import { UserStageComponent } from './users/user-stage.component';
import { UserPlaylogComponent } from './users/user-playlog.component';
import { UserFavoriteComponent } from './users/user-favorite.component';
import { RankingDateNaviComponent } from './rankings/ranking-date-navi.component';
import { RankingPlayComponent } from './rankings/ranking-play.component';
import { RankingRatingComponent } from './rankings/ranking-rating.component';
import { RankingFavoriteComponent } from './rankings/ranking-favorite.component';
import { RankingPlayerComponent } from './rankings/ranking-player.component';
import { RankingCreatorComponent } from './rankings/ranking-creator.component';

/** ルート定義 */
const appRoutes: Routes = [
	{ path: '', pathMatch: 'full', component: GameComponent },
	{ path: 'games/:id', component: GameComponent },
	{ path: 'blocks', component: BlockListComponent, canActivate: [AuthGuard] },
	{ path: 'blocks/new', component: BlockEditComponent, canActivate: [AuthGuard] },
	{ path: 'blocks/:key', component: BlockEditComponent, canActivate: [AuthGuard] },
	{ path: 'stages', component: LatestStagesComponent },
	{ path: 'stages/new', component: StageEditComponent, canActivate: [AuthGuard] },
	{ path: 'stages/:id/rankings/score/:year/:month', component: StageDetailComponent },
	{ path: 'stages/:id/rankings/score/:year', component: StageDetailComponent },
	{ path: 'stages/:id/rankings/score', component: StageDetailComponent },
	{ path: 'stages/:id/edit', component: StageEditComponent, canActivate: [AuthGuard] },
	{ path: 'stages/:id', component: StageDetailComponent },
	{ path: 'users', component: UserListComponent },
	{ path: 'users/new', component: UserNewComponent },
	{ path: 'users/login', component: UserLoginComponent },
	{ path: 'users/logout', component: UserLogoutComponent },
	{ path: 'users/me/stages', component: UserStageComponent, canActivate: [AuthGuard] },
	{ path: 'users/me/playlogs', component: UserPlaylogComponent, canActivate: [AuthGuard] },
	{ path: 'users/me/favorites', component: UserFavoriteComponent, canActivate: [AuthGuard] },
	{ path: 'users/me', component: UserDetailComponent, canActivate: [AuthGuard] },
	{ path: 'users/:id/stages', component: UserStageComponent },
	{ path: 'users/:id/edit', component: UserEditComponent, canActivate: [AuthGuard] },
	{ path: 'users/:id', component: UserDetailComponent },
	{ path: 'rankings/play/:year/:month', component: RankingPlayComponent },
	{ path: 'rankings/play/:year', component: RankingPlayComponent },
	{ path: 'rankings/play', component: RankingPlayComponent },
	{ path: 'rankings/rating', component: RankingRatingComponent },
	{ path: 'rankings/favorite', component: RankingFavoriteComponent },
	{ path: 'rankings/player/:year/:month', component: RankingPlayerComponent },
	{ path: 'rankings/player/:year', component: RankingPlayerComponent },
	{ path: 'rankings/player', component: RankingPlayerComponent },
	{ path: 'rankings/creator', component: RankingCreatorComponent },
	{ path: '**', redirectTo: '/' }
];

/**
 * デフォルトのエラーハンドラー。
 */
@Injectable()
class DefaultErrorHandler implements ErrorHandler {
	/** HttpErrorとメッセージの対応表 */
	msgIdByStatus = {
		400: 'ERROR.BAD_REQUEST',
		401: 'ERROR.UNAUTHORIZED',
		403: 'ERROR.FORBIDDEN',
		404: 'ERROR.NOT_FOUND',
	};

	/**
	 * サービスをDIしてハンドラーを生成する。
	 * @param translate 国際化サービス。
	 */
	constructor(private translate?: TranslateService) { }

	/**
	 * エラーを受け取る。
	 * @param error エラー情報。
	 */
	handleError(error: Error | any): void {
		// ※ Promiseの中で発生したエラーの場合、ラップされてくるので、元の奴を取り出す
		if (error && error.rejection) {
			error = error.rejection;
		}
		// 404等のエラーの場合、専用のエラーメッセージを表示。それ以外はデフォルトのエラー
		let msgId;
		if (error instanceof HttpErrorResponse) {
			msgId = this.msgIdByStatus[error.status];
		}
		console.error(error);
		this.translate.get(msgId || 'ERROR.FATAL').subscribe((res: string) => {
			window.alert(res);
		});
	}
}

/**
 * ブロックくずしメーカールートモジュールクラス。
 */
@NgModule({
	imports: [
		BrowserModule,
		FormsModule,
		HttpClientModule,
		RouterModule.forRoot(appRoutes),
		TranslateModule.forRoot({
			loader: {
				provide: TranslateLoader,
				useFactory: (http: HttpClient) => new TranslateHttpLoader(http, './assets/i18n/'),
				deps: [HttpClient]
			}
		}),
		BsDropdownModule.forRoot(),
		CollapseModule.forRoot(),
		ModalModule.forRoot(),
		PopoverModule.forRoot(),
		RatingModule.forRoot(),
		PaginationModule.forRoot(),
	],
	declarations: [
		AppComponent,
		SafeStylePipe,
		StageLabelComponent,
		StageLinkComponent,
		StageHeaderStatusComponent,
		StageRatingComponent,
		UserLinkComponent,
		UserStatusComponent,
		UserRatingComponent,
		RankingDateNaviComponent,
		HeaderNaviComponent,
		GameComponent,
		BlockListComponent,
		BlockEditComponent,
		MapFormatValidator,
		StageNaviComponent,
		StagePreviewComponent,
		LatestStagesComponent,
		StageDetailComponent,
		StageEditComponent,
		UserListComponent,
		UserNewComponent,
		UserLoginComponent,
		UserLogoutComponent,
		UserDetailComponent,
		UserEditComponent,
		UserStageComponent,
		UserPlaylogComponent,
		UserFavoriteComponent,
		RankingPlayComponent,
		RankingRatingComponent,
		RankingFavoriteComponent,
		RankingPlayerComponent,
		RankingCreatorComponent,
	],
	providers: [
		{ provide: LOCALE_ID, useValue: localeHelper.getLocale() },
		{ provide: ErrorHandler, useClass: DefaultErrorHandler },
		AuthGuard,
		UserService,
	],
	bootstrap: [AppComponent]
})
export class AppModule { }
