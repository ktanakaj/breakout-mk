# ブロックくずしメーカー
ブロックくずしのWebアプリで、ユーザーがCMSのように自分でステージを登録＆共有可能。

某所でJavaScriptの研修課題として作った奴ですが、諸般の事情によりお蔵入りしたため、TypeScriptにリライトして公開。  
（Webアプリ部がメインなので、インゲームはショボいです…。）

## 機能
* ブロックくずしゲーム
* ユーザー登録
    * 登録したステージ一覧
    * プレイ履歴
    * ユーザー管理（管理者のみ）
* ステージ登録
    * 最新ステージ一覧
    * 各種ランキング
    * お気に入り／レーティング
    * コメント投稿
* ブロック登録（管理者のみ）

## 環境
* CentOS 7
* Node.js v10.x
* MariaDB 5.x
* Redis 3.x
* nginx 1.10.x
* Express 4.x
    * Sequelize 4.x
    * Sequelize-typescript 0.6.x
    * Passport 0.4.x
    * Node-config 1.x
    * Log4js 1.x
* Angular 6.x

### 対応ブラウザ
* &gt;= Google Chrome Ver66.0.3359.181
* &gt;= Microsoft Edge Ver41.16299.402.0
* &gt;= Firefox Ver60.1

### 開発環境
* Vagrant 2.1.x - 仮想環境管理
    * VirtualBox 5.2.x - 仮想環境
    * vagrant-vbguest - Vagrantプラグイン
* Visual Studio Code - アプリ開発用エディター
* Unity 2017.1.0f3 - WebGLゲーム開発用IDE
    * Visual Studio Community 2017 - C# 開発用IDE
* MySQL Workbench 6.x - DB管理・EL図作成用ツール

## フォルダ構成
* VMルートフォルダ
    * breakout-db - DB環境構築用スクリプト/ER図
    * breakout-game - Unity WebGLゲームソース
    * breakout-svr - Node.js Webアプリサーバーソース
        * config - アプリ設定
    * breakout-web - Angular Webアプリクライアントソース
    * ansible - Ansible関連ファイル

## インストール方法
1. Vagrantをインストールした後、ファイル一式をVMのフォルダとする場所に展開。
2. `vagrant up` でVM環境を構築（DB構築やWebアプリの初回ビルド等も自動実行）。
3. クライアント側PCで `breakout-game` のUnityプロジェクトを開き、`Assets/Scenes/Game` を表示。WebGLをターゲットにして、`breakout-web/public/webgl` フォルダを出力先でビルドを行う。

※ 初回の `vagrant up` はVMイメージダウンロード等で1時間以上かかる場合があります。また `npm install` 等で一時的にエラーが発生する場合は、もう一度 `vagrant provision` 等で展開してください。  
※ どうしても `npm install` に失敗する場合は、飛ばして以降を手動で実行してください…。

## 起動方法
Web側アプリはVM起動時に自動的に立ち上がります。

デフォルトのVMでは http://[DHCPで振られたIP]/ または http://localhost/ でアクセス可能です。

※ Microsoft EdgeだとプライベートIP（前者）はアクセスできない場合あり。  
※ 自動的に立ち上がらない場合は、後述のサーバーコマンドで起動してください。

### サーバーコマンド
Webアプリの操作用に、以下のようなサーバーコマンドを用意しています。
アプリのビルドや再起動などを行う場合は、VMにログインして `breakout-svr`, `breakout-web` ディレクトリでコマンドを実行してください。

* `breakout-svr`
    * `npm start` - Webアプリの起動
        * `npm run production` Webアプリの起動（運用モード）
    * `npm restart` - Webアプリの再起動
    * `npm stop` - Webアプリの停止
    * `npm run update-rankings` - ランキングデータの再作成
* `breakout-svr/breakout-web`共通
    * `npm run build` - Webアプリクライアントのビルド
    * `npm run watch` - Webアプリクライアントのビルド（ファイル更新監視）
    * `npm run doc` - WebアプリのAPIドキュメント生成
    * `npm test` - Webアプリのユニットテスト実行
    * `npm run eslint` - Webアプリの静的解析ツールの実行
    * `npm run clean` - 全ビルド生成物の削除

なお、Webアプリのクライアント側ソース、並びにUnityゲーム部分はビルドが必要です。またサーバーアプリのソース変更を反映するためには、Webアプリの再起動が必要です。

## 操作方法
トップページのゲーム画面から登録済みのステージを起動し、ゲームをプレイする。
ブロックくずしゲーム部分は、ごくごく普通のシステム（ブロックを消してスコア獲得、すべて消してクリア、獲得スコアに応じて徐々に高速化）。

ユーザー登録は自由に可能。ログインすると、スコアなどが記録される。
また自分でステージを登録可能になる。

管理者アカウントの場合は、ブロックの種類なども登録可能。

日本語／英語両対応。ユーザーの環境に応じて自動的に切り替わります（一部日本語のみ）。

### 管理者アカウント
VMの初期状態では、サンプルデータとともに以下の初期アカウントが登録されます。

管理者アカウント `admin / admin01`

管理者を追加する場合は、普通にユーザー登録を行った後、いずれかの管理者アカウントでログインして、該当ユーザーの権限を管理者に変更してください。

## その他
各種ログは `/var/log/local/breakout-mk` 下に出力されます。
アクセスログ、デバッグログ、エラーログを出力します。

VMのDBを参照する場合は、MySQL Workbench等でMySQLの標準ポートに接続してください（接続情報は `default.yaml` 参照）。

またVMにはSwaggerのAPIデバッグページがあります。 http://[DHCPで振られたIP]/swagger/?url=/api-docs.json でアクセス可能です。

## ライセンス
[MIT](https://github.com/ktanakaj/breakout-mk/blob/master/LICENSE)
