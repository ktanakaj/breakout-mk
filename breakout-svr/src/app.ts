/**
 * @file ブロックくずしメーカーサーバ側共通定義部。
 */
import "reflect-metadata";
import 'source-map-support/register';
import * as express from 'express';
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
import { HttpError } from './core/http-error';

// Sequelizeの初期化
const sequelize = new Sequelize(Object.assign({
	modelPaths: [__dirname + '/models'],
	logging: (log) => log4js.getLogger('debug').debug(log),
}, config['database']));
sequelize.sync().catch((e) => log4js.getLogger('error').error(e));

// Expressの初期化
const app = express();
const RedisStore = connectRedis(session);

// 各種ライブラリ登録
log4js.configure(config['log4js']);
app.use(log4js.connectLogger(log4js.getLogger('access'), {
	level: 'auto',
	nolog: config['noaccesslog'],
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session(Object.assign({ store: new RedisStore(config['redis']['session']) }, config['session'])));
app.set('views', __dirname + '/../ejs');
app.set('view engine', 'ejs');

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
		throw new HttpError(400, errors[0].message);
	},
	responseValidationFn: (req: express.Request, data: any, errors: any) => {
		throw new HttpError(500, errors[0].message);
	},
}));

// APIを登録
for (let route of routes) {
	const router = require(route);
	app.use(path.join("/", route.replace(baseDir, "").replace(/\.[jt]s$/, "")), router['default'] || router);
}

// 本番環境等以外では、Swagger-UI用のJSONも出力
if (config['debug']['apidocs']) {
	app.get('/api-docs.json', (req: express.Request, res: express.Response) => {
		res.json(swaggerSpec);
	});
}

// エラーハンドラー登録
import errorHandlers from './core/error-handlers';
for (let handler in errorHandlers) {
	app.use(errorHandlers[handler]);
}

module.exports = app;
