// ================================================================================================
// <summary>
//      ステータス情報ラベルの情報更新を行うクラスソース</summary>
//
// <copyright file="StatusLabelUpdater.cs">
//      Copyright (C) 2017 Koichi Tanaka. All rights reserved.</copyright>
// <author>
//      Koichi Tanaka</author>
// ================================================================================================

namespace Honememo.BreakoutMk.Game
{
    using System;
    using UnityEngine;
    using UnityEngine.UI;

    /// <summary>
    /// ステータス情報ラベルの情報更新を行うクラス。
    /// </summary>
    public class StatusLabelUpdater : MonoBehaviour
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
        /// ステータス情報ラベル。
        /// </summary>
        private Text statusLabel;

        #endregion

        #region Unityイベントメソッド

        /// <summary>
        /// ゲーム開始時に呼ばれる処理。
        /// </summary>
        public void Start()
        {
            // 起動時に参照するコンポーネントを見つけておく
            this.gameStatus = this.GameStatusObject ? this.GameStatusObject.GetComponent<GameStatus>() : this.GetComponent<GameStatus>();
            this.statusLabel = this.GetComponent<Text>();
            if (!this.gameStatus || !this.statusLabel)
            {
                throw new NotImplementedException("必要なComponentが接続されていません。");
            }
        }

        /// <summary>
        /// フレームごとに呼ばれる処理。
        /// </summary>
        public void Update()
        {
            // ユーザーの状態に応じてラベルを更新
            if (this.gameStatus && this.statusLabel)
            {
                this.statusLabel.text = this.MakeLabel(this.gameStatus);
            }
        }

        #endregion

        #region Privateメソッド

        /// <summary>
        /// ラベルのテキストを生成する。
        /// </summary>
        /// <param name="user">ユーザー情報。</param>
        /// <returns>生成したテキスト。</returns>
        private string MakeLabel(GameStatus gameStatus)
        {
            return string.Format("Life: {0}\nScore: {1}", gameStatus.Life, gameStatus.Score);
        }

        #endregion
    }
}