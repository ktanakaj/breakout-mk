/**
 * @file ブロックくずしメーカーサーバ側共通定義部。
 */
import 'reflect-metadata';
import 'source-map-support/register';
import * as express from 'express';
import * as http from 'http';
import * as path from 'path';
import * as config from 'config';
import * as log4js from 'log4js';
import * as cookieParser from 'cookie-parser';
import * as bodyParser from 'body-parser';
import * as session from 'express-session';
import * as connectRedis from 'connect-redis';
import swaggerJSDoc = require('swagger-jsdoc');
import * as swaggerExpressValidator from 'swagger-express-validator';
import { Sequelize } from 'sequelize-typescript';
import fileUtils from './core/utils/file-utils';
import { HttpError, BadRequestError, NotFoundError, InternalServerError } from './core/utils/http-error';
import responseBodyCollector from './core/response-body-collector';

// Sequelizeの初期化
const sequelize = new Sequelize(Object.assign({
	modelPaths: [__dirname + '/models'],
	logging: (log) => log4js.getLogger('debug').debug(log),
	operatorsAliases: false,
}, config['database']));
sequelize.sync().catch((e) => log4js.getLogger('error').error(e));

// Expressの初期化
const app = express();
const RedisStore = connectRedis(session);

// log4jsの初期化とアクセスログの設定
log4js.configure(config['log4js']);
const accessLogOption = {
	level: 'auto',
	nolog: config['noaccesslog'],
};
if (config['debug']['bodyLog']) {
	// bodyログが有効な場合、リクエスト/レスポンスボディも出力
	// ※ bodyParserが挟まる都合上、JSONが壊れているリクエストボディは出力されません
	accessLogOption['format'] = (req: express.Request, res: express.Response, format: (str: string) => string) => {
		let reqBody = JSON.stringify(req.body);
		let resBody = (<any>res)._getData();
		return format(':remote-addr - - ":method :url HTTP/:http-version" :status :content-length ":referrer" ":user-agent" req=') + reqBody + ' res=' + resBody;
	};
	app.use(responseBodyCollector);
}
app.use(log4js.connectLogger(log4js.getLogger('access'), accessLogOption));

// その他各種ライブラリの登録
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session(Object.assign({ store: new RedisStore(config['redis']['session']) }, config['session'])));

// リバースプロキシのX-Forwarded-Protoを信じる
app.set('trust proxy', 'loopback');

// クロスドメインでの参照を許可
app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	next();
});

// Passportの初期化
import passportManager from './core/passport-manager';
passportManager.initialize(app);

// routesフォルダの全ファイルをAPI定義としてリストアップ
const baseDir = path.join(__dirname, "./routes");
let routes = [];
fileUtils.directoryWalkRecursiveSync(baseDir, (realpath) => {
	if (/\.[jt]s$/.test(realpath)) {
		routes.push(realpath);
	}
});

// API定義のソースコメントからSwagger定義を読み込み
const swaggerSpec = swaggerJSDoc({
	swaggerDefinition: config['swagger'],
	apis: routes,
});

// Swagger定義を元にJSONスキーマのバリデーションを実施
// ※ レスポンスのバリデーションは開発環境等でのみ実施
app.use(swaggerExpressValidator({
	schema: swaggerSpec,
	validateRequest: true,
	validateResponse: config['debug']['responseValidation'],
	requestValidationFn: (req: express.Request, data: any, errors: any) => {
		throw new BadRequestError(errors[0].message, errors);
	},
	responseValidationFn: (req: express.Request, data: any, errors: any) => {
		throw new InternalServerError(errors[0].message, errors);
	},
}));

// APIを/api/下のルートに登録
for (let route of routes) {
	const router = require(route);
	app.use(path.join("/api/", route.replace(baseDir, "").replace(/\.[jt]s$/, "")), router['default'] || router);
}

// 本番環境等以外では、Swagger-UI用のJSONも出力
if (config['debug']['apidocs']) {
	app.get('/api-docs.json', (req: express.Request, res: express.Response) => {
		res.json(swaggerSpec);
	});
}

// ルートが存在しない場合、404エラー
app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
	next(new NotFoundError());
});

// エラーハンドラー登録
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
	// エラーをHttpErrorに変換
	const cause = err;
	if (!(err instanceof HttpError)) {
		switch (err.name) {
			case 'SequelizeUniqueConstraintError':
				err = new BadRequestError(joinSequelizeErrorMessages(err), err);
				break;
			case 'SequelizeValidationError':
				err = new BadRequestError(joinSequelizeErrorMessages(err), err);
				break;
			case 'SequelizeEmptyResultError':
				err = new NotFoundError(joinSequelizeErrorMessages(err), err);
				break;
			default:
				err = new InternalServerError(err.message || err, err);
		}
	}

	// エラーの種類に応じてログレベルを調整（ログには元のエラーを出す）
	const logger = log4js.getLogger('error');
	if (err.status >= 500) {
		logger.error(cause);
	} else {
		logger.debug(cause);
	}

	// エラーレスポンスを出力
	if (res.headersSent) {
		return;
	}

	res.status(err.status);
	res.type('text');

	// 運用中の環境ではエラーメッセージを隠す
	let message = http.STATUS_CODES[err.status];
	if (config['debug']['errorMessage']) {
		message = err.message;
	}
	res.send(message);
});

/**
 * Sequelizeで複数返るエラーメッセージを結合する。
 * @param err Sequelizeの例外。
 * @returns エラーメッセージ文字列。
 */
function joinSequelizeErrorMessages(err: any): string {
	if (Array.isArray(err.errors)) {
		return err.errors.map((e) => e.message || "").join(", ");
	} else {
		return "";
	}
}

module.exports = app;
