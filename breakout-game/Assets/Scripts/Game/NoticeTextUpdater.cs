// ================================================================================================
// <summary>
//      通知テキストの情報更新を行うクラスソース</summary>
//
// <copyright file="NoticeTextUpdater.cs">
//      Copyright (C) 2017 Koichi Tanaka. All rights reserved.</copyright>
// <author>
//      Koichi Tanaka</author>
// ================================================================================================

namespace Honememo.BreakoutMk.Game
{
    using System;
    using UnityEngine;
    using UnityEngine.EventSystems;
    using UnityEngine.UI;
    using Honememo.BreakoutMk.Commons;

    /// <summary>
    /// 通知テキストの情報更新を行うクラス。
    /// </summary>
    public class NoticeTextUpdater : MonoBehaviour
    {
        #region Public変数

        /// <summary>
        /// ゲームステータススクリプトが付いているオブジェクト。
        /// </summary>
        public GameObject GameStatusObject;

        #endregion

        #region Private変数

        /// <summary>
        /// ゲーム情報。
        /// </summary>
        private GameStatus gameStatus;

        /// <summary>
        /// 通知テキスト。
        /// </summary>
        private Text noticeText;

        #endregion

        #region Unityイベントメソッド

        /// <summary>
        /// ゲーム開始時に呼ばれる処理。
        /// </summary>
        public void Start()
        {
            // 起動時に参照するコンポーネントを見つけておく
            this.gameStatus = this.GameStatusObject ? this.GameStatusObject.GetComponent<GameStatus>() : this.GetComponent<GameStatus>();
            this.noticeText = this.GetComponent<Text>();
            if (!this.gameStatus || !this.noticeText)
            {
                throw new NotImplementedException("必要なComponentが接続されていません。");
            }
        }

        /// <summary>
        /// このクラスが有効になった際の処理。
        /// </summary>
        public void OnEnable()
        {
            // エラーハンドラを登録
            Application.logMessageReceived += this.HandleException;
        }

        /// <summary>
        /// このクラスが無効になった際の処理。
        /// </summary>
        public void OnDisable()
        {
            // エラーハンドラを解除
            Application.logMessageReceived -= this.HandleException;
        }
        
        #endregion

        #region SendMessage用メソッド

        /// <summary>
        /// ゲームの状態に応じてGameObjectを変化させる。
        /// </summary>
        /// <param name="state">新しい状態。</param>
        public void ChangeState(GameState state)
        {
            switch (state)
            {
                case GameState.Initializing:
                case GameState.Loading:
                    this.noticeText.text = "Loading...";
                    break;
                case GameState.Reset:
                case GameState.Menu:
                case GameState.Playing:
                    this.noticeText.text = string.Empty;
                    break;
                case GameState.Start:
                    this.noticeText.text = "\"" + this.gameStatus.Stage.Name + "\"\nClick to Start!";
                    break;
                case GameState.Retry:
                    this.noticeText.text = "Click to Retry!";
                    break;
                case GameState.Clear:
                    this.noticeText.text = "Clear!\nScore: " + this.gameStatus.Score + "\n\nTry Next Game!";
                    break;
                case GameState.GameOver:
                    this.noticeText.text = "GameOver!\nScore: " + this.gameStatus.Score + "\n\nTry Next Game!";
                    break;
            }
        }

        #endregion

        #region エラーハンドリング用Privateメソッド

        /// <summary>
        /// 例外ログ発生時の通知用メソッド。
        /// </summary>
        /// <param name="condition">例外内容。</param>
        /// <param name="stackTrace">例外スタックトレース。</param>
        /// <param name="type">ログの種類。</param>
        private void HandleException(string condition, string stackTrace, LogType type)
        {
            // 例外の場合、画面メッセージを置き換え
            if (type != LogType.Exception)
            {
                return;
            }

            string key = typeof(NotifiableException).Name + ": ";
            if (condition.StartsWith(key))
            {
                this.noticeText.text = Locale.Format("ERROR", condition.Replace(key, string.Empty));
            }
            else
            {
                this.noticeText.text = Locale.Format("FATAL_ERROR", condition);
            }
        }

        #endregion
    }
}