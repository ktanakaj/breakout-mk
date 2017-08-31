/**
 * @file ブロックくずしメーカールートモジュール。
 */
import { NgModule, ErrorHandler, Injectable, LOCALE_ID } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { HttpModule, Http } from '@angular/http';
import { RouterModule, Routes } from '@angular/router';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { BsDropdownModule, CollapseModule, PopoverModule, RatingModule } from 'ngx-bootstrap';
import browserHelper from './core/browser-helper';
import { UserService } from './users/user.service';
import { AppComponent } from './app.component';
import { StageLabelComponent } from './shared/stage-label.component';
import { StageLinkComponent } from './shared/stage-link.component';
import { StageHeaderStatusComponent } from './shared/stage-header-status.component';
import { StageRatingComponent } from './shared/stage-rating.component';
import { UserLinkComponent } from './shared/user-link.component';
import { UserStatusComponent } from './shared/user-status.component';
import { UserRatingComponent } from './shared/user-rating.component';
import { GameComponent } from './games/game.component';
import { BlockListComponent } from './blocks/block-list.component';
import { BlockEditComponent } from './blocks/block-edit.component';
import { StageNaviComponent } from './stages/stage-navi.component';
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
	{ path: 'blocks', component: BlockListComponent },
	{ path: 'blocks/new', component: BlockEditComponent },
	{ path: 'blocks/:key', component: BlockEditComponent },
	{ path: 'stages', component: LatestStagesComponent },
	{ path: 'stages/new', component: StageEditComponent },
	{ path: 'stages/:id/edit', component: StageEditComponent },
	{ path: 'stages/:id', component: StageDetailComponent },
	{ path: 'users', component: UserListComponent },
	{ path: 'users/new', component: UserNewComponent },
	{ path: 'users/login', component: UserLoginComponent },
	{ path: 'users/logout', component: UserLogoutComponent },
	{ path: 'users/me/stages', component: UserStageComponent },
	{ path: 'users/me/favorites', component: UserFavoriteComponent },
	{ path: 'users/me', component: UserDetailComponent },
	{ path: 'users/:id/stages', component: UserStageComponent },
	{ path: 'users/:id/playlogs', component: UserPlaylogComponent },
	{ path: 'users/:id/edit', component: UserEditComponent },
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
		// 404等のエラーの場合、専用のエラーメッセージを表示。それ以外は想定外のエラーとして扱う
		let msgId = 'ERROR.FATAL';
		if (error.name === "ResponseError") {
			switch (error.status) {
				case 400:
					msgId = 'ERROR.BAD_REQUEST';
					break;
				case 401:
					msgId = 'ERROR.UNAUTHORIZED';
					break;
				case 403:
					msgId = 'ERROR.FORBIDDEN';
					break;
				case 404:
					msgId = 'ERROR.NOT_FOUND';
					break;
			}
		}
		console.error(error);
		this.translate.get(msgId).subscribe((res: string) => {
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
		HttpModule,
		RouterModule.forRoot(appRoutes),
		TranslateModule.forRoot({
			loader: {
				provide: TranslateLoader,
				useFactory: (http: Http) => new TranslateHttpLoader(http, './i18n/'),
				deps: [Http]
			}
		}),
		BsDropdownModule.forRoot(),
		CollapseModule.forRoot(),
		PopoverModule.forRoot(),
		RatingModule.forRoot(),
	],
	declarations: [
		AppComponent,
		StageLabelComponent,
		StageLinkComponent,
		StageHeaderStatusComponent,
		StageRatingComponent,
		UserLinkComponent,
		UserStatusComponent,
		UserRatingComponent,
		RankingDateNaviComponent,
		GameComponent,
		BlockListComponent,
		BlockEditComponent,
		StageNaviComponent,
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
		{ provide: LOCALE_ID, useValue: browserHelper.getLocale() },
		{ provide: ErrorHandler, useClass: DefaultErrorHandler },
		UserService,
	],
	bootstrap: [AppComponent]
})
export class AppModule { }
