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
* nginx 1.12.x
* Express 4.x
    * Sequelize 4.x
    * Sequelize-typescript 0.6.x
    * Passport 0.4.x
    * Node-config 2.x
    * Log4js 3.x
* Angular 6.x

### 動作確認ブラウザ
* &gt;= Google Chrome Ver66.0.3359.181
* &gt;= Microsoft Edge Ver41.16299.402.0
* &gt;= Firefox Ver60.1

### 開発環境
* Vagrant 2.2.x - 仮想環境管理
    * VirtualBox 5.2.x - 仮想環境
    * vagrant-vbguest - Vagrantプラグイン
* Visual Studio Code - アプリ開発用エディター
* Unity 2017.1.0f3 - WebGLゲーム開発用IDE
    * Visual Studio Community 2017 - C# 開発用IDE
* MySQL Workbench 6.x - DB管理・EL図作成用ツール

※ Hyper-Vでも動作可

## フォルダ構成
* VMルートフォルダ
    * breakout-db - DB環境構築用スクリプト/ER図
    * breakout-game - Unity WebGLゲームソース
    * breakout-svr - Node.js Webアプリサーバーソース
        * config - アプリ設定
    * breakout-web - Angular Webアプリクライアントソース
    * ansible - Ansible関連ファイル

## VM環境構築手順
1. Vagrantをインストールした後、ファイル一式をVMのフォルダとする場所に展開。
2. 初回の `vagrant up` でVM環境を構築（DB構築やWebアプリの初回ビルド等も自動実行）。
3. クライアント側PCで `breakout-game` のUnityプロジェクトを開き、`Assets/Scenes/Game` を表示。WebGLをターゲットにして、`breakout-web/src/webgl` フォルダを出力先でビルドを行う。
   * コピー後は、ファイルを手動で `dist` にも反映するか、`breakout-web` を再ビルドしてください。

※ 初回の `vagrant up` はVMイメージダウンロード等で1時間以上かかる場合があります。また `yarn install` 等で一時的にエラーが発生する場合は、もう一度 `vagrant provision` 等で展開してください。  
※ 2018年8月現在、npmコマンドにはvagrant共有フォルダでのインストールが失敗する[不具合](https://github.com/npm/npm/issues/20605)があります。`npm install` の代わりに `yarn install` を使用してください。

### 起動方法
Web側アプリはVM起動時に自動的に立ち上がります。

デフォルトのVMでは http://[DHCPで振られたIP]/ または http://localhost/ でアクセス可能です。

※ Microsoft EdgeだとプライベートIP（前者）はアクセスできない場合あり。  
※ 自動的に立ち上がらない場合は、後述のサーバーコマンドで起動してください。

## サーバーコマンド
Webアプリの操作用に、以下のようなサーバーコマンドを用意しています。
アプリのビルドや再起動などを行う場合は、VMにログインして `breakout-svr`, `breakout-web` ディレクトリでコマンドを実行してください。

* `breakout-svr`
    * `npm start` - Webアプリの起動
        * `npm run production` Webアプリの起動（運用モード）
    * `npm restart` - Webアプリの再起動
    * `npm stop` - Webアプリの停止
* `breakout-svr/breakout-web`共通
    * `npm run build` - Webアプリのビルド
    * `npm run watch` - Webアプリのビルド（ファイル更新監視）
    * `npm run doc` - WebアプリのAPIドキュメント生成
    * `npm test` - Webアプリのユニットテスト実行
    * `npm run lint` - Webアプリの静的解析ツールの実行
    * `npm run clean` - 全ビルド生成物の削除

なお、Webアプリ、並びにUnityゲーム部分はビルドが必要です。またサーバーアプリのソース変更を反映するためには、Webアプリの再起動が必要です。

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
各種ログは `/var/log/local/breakout-svr` 下に出力されます。
アクセスログ、デバッグログ、エラーログを出力します。

VMのDBを参照する場合は、MySQL Workbench等でMySQLの標準ポートに接続してください（接続情報は `default.yaml` 参照）。

またVMにはSwaggerのAPIデバッグページがあります。 http://localhost/swagger/?url=/api-docs.json でアクセス可能です。

## ライセンス
[MIT](https://github.com/ktanakaj/breakout-mk/blob/master/LICENSE)

※ ただし同梱の[IPAフォント](https://github.com/ktanakaj/breakout-mk/tree/master/breakout-game/Assets/Fonts)については[IPA Font License Agreement v1.0](https://github.com/ktanakaj/breakout-mk/blob/master/breakout-game/Assets/Fonts/IPA_Font_License_Agreement_v1.0.txt)が適用されます。
