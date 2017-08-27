// ================================================================================================
// <summary>
//      ユーザー情報ラベルの情報更新を行うクラスソース</summary>
//
// <copyright file="UserLabelUpdater.cs">
//      Copyright (C) 2017 Koichi Tanaka. All rights reserved.</copyright>
// <author>
//      Koichi Tanaka</author>
// ================================================================================================

namespace Honememo.BreakoutMk.Game
{
    using System;
    using UnityEngine;
    using UnityEngine.UI;
    using Honememo.BreakoutMk.Commons;
    using Honememo.BreakoutMk.Models;

    /// <summary>
    /// ユーザー情報ラベルの情報更新を行うクラス。
    /// </summary>
    public class UserLabelUpdater : MonoBehaviour
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
        /// ユーザー情報ラベル。
        /// </summary>
        private Text userLabel;

        #endregion

        #region Unityイベントメソッド

        /// <summary>
        /// ゲーム開始時に呼ばれる処理。
        /// </summary>
        public void Start()
        {
            // 起動時に参照するコンポーネントを見つけておく
            this.gameStatus = this.GameStatusObject ? this.GameStatusObject.GetComponent<GameStatus>() : this.GetComponent<GameStatus>();
            this.userLabel = this.GetComponent<Text>();
            if (!this.gameStatus || !this.userLabel)
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
            if (this.gameStatus && this.userLabel)
            {
                this.userLabel.text = this.MakeLabel(this.gameStatus.User);
            }
        }

        #endregion

        #region Privateメソッド

        /// <summary>
        /// ラベルのテキストを生成する。
        /// </summary>
        /// <param name="user">ユーザー情報。</param>
        /// <returns>生成したテキスト。</returns>
        private string MakeLabel(User user)
        {
            string label = Locale.Get("USER_LABEL_TEXT");
            if (user == null || user.Id == 0)
            {
                return string.Format(label, Locale.Get("NOUSER"));
            }
            else
            {
                return string.Format(label, user.Name);
            }
        }

        #endregion
    }
}