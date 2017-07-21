/**
 * @file ブロックくずしメーカーサーバ側共通定義部。
 */
import "reflect-metadata";
import * as express from 'express';
import * as path from 'path';
import * as config from 'config';
import * as log4js from 'log4js';
import * as cookieParser from 'cookie-parser';
import * as bodyParser from 'body-parser';
import * as session from 'express-session';
import * as connectRedis from 'connect-redis';
import 'source-map-support/register';
import { Sequelize } from 'sequelize-typescript';
import fileUtils from './core/utils/file-utils';

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
app.use(function (req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	next();
});

// Passportの初期化
import passportManager from './core/passport-manager';
passportManager.initialize(app);

// ルーティング設定。routesフォルダの全ファイルをapp.use()可能な形式として読み込み
const baseDir = path.join(__dirname, "routes");
let routes = [];
fileUtils.directoryWalkRecursiveSync(
	baseDir,
	function (realpath) {
		if (/\.js$/.test(realpath)) {
			routes.push(realpath);
			app.use(path.join("/", realpath.replace(baseDir, "").replace(/\.[jt]s$/, "")), require(realpath));
		}
	});

// API検証用のswagger設定
import swaggerJSDoc = require('swagger-jsdoc');
if (app.get('env') === 'development') {
	const swaggerSpec = swaggerJSDoc({
		swaggerDefinition: config['swagger'],
		apis: routes,
	});

	app.get('/api-docs.json', (req, res) => {
		res.setHeader('Content-Type', 'application/json');
		res.send(swaggerSpec);
	});
}

// エラーハンドラー登録
import errorHandlers from './core/error-handlers';
for (let handler in errorHandlers) {
	app.use(errorHandlers[handler]);
}

module.exports = app;
