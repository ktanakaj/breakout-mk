// ================================================================================================
// <summary>
//      ステージ情報ラベルの情報更新を行うクラスソース</summary>
//
// <copyright file="StageLabelUpdater.cs">
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
    /// ステージ情報ラベルの情報更新を行うクラス。
    /// </summary>
    public class StageLabelUpdater : MonoBehaviour
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
        /// ステージ情報ラベル。
        /// </summary>
        private Text stageLabel;

        #endregion

        #region Unityイベントメソッド

        /// <summary>
        /// ゲーム開始時に呼ばれる処理。
        /// </summary>
        public void Start()
        {
            // 起動時に参照するコンポーネントを見つけておく
            this.gameStatus = this.GameStatusObject ? this.GameStatusObject.GetComponent<GameStatus>() : this.GetComponent<GameStatus>();
            this.stageLabel = this.GetComponent<Text>();
            if (!this.gameStatus || !this.stageLabel)
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
            if (this.gameStatus && this.stageLabel)
            {
                this.stageLabel.text = this.MakeLabel(this.gameStatus.Stage);
            }
        }

        #endregion

        #region Privateメソッド

        /// <summary>
        /// ラベルのテキストを生成する。
        /// </summary>
        /// <param name="stage">ステージ情報。</param>
        /// <returns>生成したテキスト。</returns>
        private string MakeLabel(Stage stage)
        {
            string label = Locale.Get("STAGE_LABEL_TEXT");
            if (stage == null || stage.Id == 0)
            {
                return string.Format(label, Locale.Get("NOTSELECTED"));
            }
            else
            {
                return string.Format(label, stage.Name);
            }
        }

        #endregion
    }
}