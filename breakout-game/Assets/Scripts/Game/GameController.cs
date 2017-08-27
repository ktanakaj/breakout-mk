// ================================================================================================
// <summary>
//      ゲーム全体の流れの管理などを行うコントローラソース</summary>
//
// <copyright file="GameController.cs">
//      Copyright (C) 2017 Koichi Tanaka. All rights reserved.</copyright>
// <author>
//      Koichi Tanaka</author>
// ================================================================================================

namespace Honememo.BreakoutMk.Game
{
    using System;
    using System.Collections;
    using UnityEngine;
    using Honememo.BreakoutMk.Commons;
    using Honememo.BreakoutMk.Models;

    /// <summary>
    /// ゲーム全体の流れの管理などを行うコントローラ。
    /// </summary>
    public class GameController : MonoBehaviour
    {
        #region Public変数

        /// <summary>
        /// メニューのルートオブジェクト。
        /// </summary>
        public GameObject Menu;

        #endregion

        #region Private変数

        /// <summary>
        /// ゲーム情報。
        /// </summary>
        private GameStatus gameStatus;

        /// <summary>
        /// ゲームサーバー。
        /// </summary>
        private BreakoutServer gameServer;

        /// <summary>
        /// ゲームWebページ。
        /// </summary>
        private BreakoutPage gamePage;

        /// <summary>
        /// メニュー表示処理。
        /// </summary>
        private MenuViewer menuViewer;

        /// <summary>
        /// ステージ生成処理。
        /// </summary>
        private StageCreator stageCreator;

        #endregion

        #region Unityイベントメソッド

        /// <summary>
        /// ゲーム開始時に呼ばれる処理。
        /// </summary>
        public void Start()
        {
            // 起動時に参照するコンポーネントを見つけておく
            if (!this.Menu)
            {
                throw new NotImplementedException("必要なGameObjetが指定されていません。");
            }

            this.gameStatus = this.GetComponent<GameStatus>();
            this.gameServer = this.GetComponent<BreakoutServer>();
            this.gamePage = this.GetComponent<BreakoutPage>();
            this.menuViewer = this.Menu.GetComponent<MenuViewer>();
            this.stageCreator = this.GetComponent<StageCreator>();
            if (!this.gameStatus || !this.gameServer || !this.menuViewer || !this.stageCreator)
            {
                throw new NotImplementedException("必要なComponentが接続されていません。");
            }

            // メニューインスタンスにイベント登録
            this.menuViewer.MenuSelected += (stage) =>
            {
                this.gameStatus.Stage = stage;
                this.InitializeGame();
            };

            // アプリの初期化処理を子ルーチンで実行
            this.StartCoroutine(this.InitializeApp());
        }

        /// <summary>
        /// フレームごとに呼ばれる処理。
        /// </summary>
        public void Update()
        {
            // ゲーム実行中は、毎フレームごとにゲーム終了をチェック
            if (this.gameStatus.State == GameState.Playing)
            {
                this.CheckGameEnd();
            }
        }

        /// <summary>
        /// ゲームが開始可能な場合、開始する。
        /// </summary>
        public void StartGameIfAvailable()
        {
            switch (this.gameStatus.State)
            {
                case GameState.Start:
                case GameState.Retry:
                    this.StartGame();
                    break;
            }
        }

        /// <summary>
        /// メニュー表示処理を実行する。
        /// </summary>
        public void InitializeMenu()
        {
            this.StartCoroutine(this.InitializeMenuCoroutine());
        }

        /// <summary>
        /// ゲーム初期化処理を実行する。
        /// </summary>
        public void InitializeGame()
        {
            this.StartCoroutine(this.InitializeGameCoroutine());
        }

        #endregion
        
        #region Privateメソッド
        
        /// <summary>
        /// アプリの初期化。
        /// </summary>
        /// <returns>子ルーチンの実行状態。</returns>
        private IEnumerator InitializeApp()
        {
            // WebGLの実行ページから言語設定を取得
            if (this.gamePage)
            {
                yield return this.gamePage.GetLanguage((lang) => { Locale.DefaultLanguage = Locale.IsoToLanguage(lang); });
            }

            // サーバーインスタンスの初期化を待つ
            while (!this.gameServer.Initialized)
            {
                yield return null;
            }

            // ブロックマスタ定義を読み込み
            // ※ サーバーと繋がらない場合このタイミングで例外
            yield return this.gameServer.FindBlocks((b) => { this.gameStatus.Blocks = b; });

            // ユーザー情報を読み込み
            yield return this.gameServer.FindUser((u) => { this.gameStatus.User = u; });

            // 初期化が終わったらメニューまたはステージを表示
            yield return this.BootMenuOrStage();
        }

        /// <summary>
        /// メニューまたはステージへの遷移。
        /// </summary>
        /// <returns>子ルーチンの実行状態。</returns>
        private IEnumerator BootMenuOrStage()
        {
            // 画面表示を一度リセット、次いで読み込み中に設定
            this.gameStatus.State = GameState.Reset;
            this.gameStatus.State = GameState.Loading;

            // WebGLの実行ページからステージIDを取得
            int stageId = 0;
            if (this.gamePage)
            {
                yield return this.gamePage.GetStageId((id) => { stageId = id; });
            }

            if (stageId > 0)
            {
                // IDが指定されている場合、直接ゲーム実施
                yield return this.gameServer.FindStage(stageId, (s) => { this.gameStatus.Stage = s; });
                yield return this.InitializeGameCoroutine();
            }
            else
            {
                // 指定されていない場合、メニューを表示
                yield return this.InitializeMenuCoroutine();
            }
        }

        /// <summary>
        /// メニュー表示。
        /// </summary>
        /// <returns>子ルーチンの実行状態。</returns>
        private IEnumerator InitializeMenuCoroutine()
        {
            // 画面表示を一度リセット、次いで読み込み中に設定
            this.gameStatus.State = GameState.Reset;
            this.gameStatus.State = GameState.Loading;

            // メニューを有効化、ステージ一覧を読み込み
            this.Menu.SetActive(true);
            yield return this.menuViewer.LoadStages();

            // メニューの先頭ページを表示
            this.menuViewer.CreateMenu(0);

            // 読み込み完了に伴いメニュー状態に移行
            this.gameStatus.State = GameState.Menu;
        }

        /// <summary>
        /// ゲームの初期化。
        /// </summary>
        /// <returns>子ルーチンの実行状態。</returns>
        private IEnumerator InitializeGameCoroutine()
        {
            // 画面表示を一度リセット、次いで読み込み中に設定
            this.gameStatus.State = GameState.Reset;
            this.gameStatus.State = GameState.Loading;

            // ステージを生成
            this.stageCreator.CreateStage();

            // ゲーム開始を通知
            yield return this.gameServer.SaveStageStart(
                this.gameStatus.Stage.Id,
                (playlog) => { this.gameStatus.Playlog = playlog; });

            // 読み込み完了に伴い状態を更新
            this.gameStatus.State = GameState.Start;
        }

        /// <summary>
        /// ゲームを開始する。
        /// </summary>
        private void StartGame()
        {
            this.gameStatus.State = GameState.Playing;
        }

        /// <summary>
        /// ゲーム終了条件のチェック。
        /// </summary>
        private void CheckGameEnd()
        {
            if (GameObject.FindGameObjectWithTag("Block") == null)
            {
                // ブロックが1個もない場合はクリア
                this.Clear();
            }
            else if (GameObject.FindGameObjectWithTag("Ball") == null)
            {
                // ボールが1個もない場合はミス
                this.MissGame();
            }
        }

        /// <summary>
        /// ゲームをミスする。
        /// </summary>
        private void MissGame()
        {
            this.gameStatus.State = GameState.Miss;

            // 残機を減らす。0以下になったらゲームオーバー
            if (--this.gameStatus.Life <= 0)
            {
                this.GameOver();
                return;
            }

            // 残機が残っている場合はプレイヤーと球を復活、次のゲームへ
            this.stageCreator.CreatePlayer();
            this.stageCreator.CreateBall();
            this.gameStatus.State = GameState.Retry;
        }

        /// <summary>
        /// ゲームを終了する。
        /// </summary>
        private void GameOver()
        {
            StartCoroutine(this.SaveStageResult(false));
            this.gameStatus.State = GameState.GameOver;
        }

        /// <summary>
        /// ゲームをクリアする。
        /// </summary>
        private void Clear()
        {
            this.gameStatus.State = GameState.Clear;
            StartCoroutine(this.SaveStageResult(true));
        }

        /// <summary>
        /// ステージの結果を保存する。
        /// </summary>
        /// <param name="cleared">クリアしたか？</param>
        /// <returns>実行情報。</returns>
        private IEnumerator SaveStageResult(bool cleared)
        {
            if (this.gameStatus.Playlog == null)
            {
                throw new NotImplementedException("ゲームのPlaylogが存在しません");
            }

            this.gameStatus.Playlog.Score = this.gameStatus.Score;
            this.gameStatus.Playlog.Cleared = cleared;
            yield return this.gameServer.SaveStageResult(this.gameStatus.Playlog);
        }

        #endregion
    }
}