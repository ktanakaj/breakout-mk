// ================================================================================================
// <summary>
//      メニューアイテムの操作を行うクラスソース</summary>
//
// <copyright file="MenuItemController.cs">
//      Copyright (C) 2017 Koichi Tanaka. All rights reserved.</copyright>
// <author>
//      Koichi Tanaka</author>
// ================================================================================================

namespace Honememo.BreakoutMk.Game
{
    using UnityEngine;
    using UnityEngine.UI;
    using Honememo.BreakoutMk.Models;

    /// <summary>
    /// メニューアイテムの操作を行うクラス。
    /// </summary>
    public class MenuItemController : MonoBehaviour
    {
        #region Private変数

        /// <summary>
        /// このメニューに割り当てられたステージ。
        /// </summary>
        private Stage stage;

        #endregion

        #region delegate定義

        /// <summary>
        /// メニュー実行時にイベント定義。
        /// </summary>
        /// <param name="stage">選択されたステージ。</param>
        public delegate void OnSubmitEventHandler(Stage stage);

        /// <summary>
        /// メニュー実行時のイベント。
        /// </summary>
        public event OnSubmitEventHandler OnSubmit;

        #endregion

        #region プロパティ

        /// <summary>
        /// このメニューに割り当てられたステージ。
        /// </summary>
        public Stage Stage
        {
            get
            {
                return this.stage;
            }

            set
            {
                // ステージ設定時に画面表示を更新する
                this.stage = value;
                this.InitializeLabels();
            }
        }

        #endregion

        #region Unityイベントメソッド

        /// <summary>
        /// メニュー項目の選択処理。
        /// </summary>
        public void Submit()
        {
            if (this.OnSubmit != null)
            {
                this.OnSubmit(this.stage);
            }
        }

        #endregion

        #region SendMessage用メソッド

        /// <summary>
        /// ゲームの状態に応じてGameObjectを変化させる。
        /// </summary>
        /// <param name="state">新しい状態。</param>
        public void ChangeState(GameState state)
        {
            // リセットまたはゲーム開始でメニュー除去
            switch (state)
            {
                case GameState.Reset:
                case GameState.Start:
                    Destroy(this.gameObject);
                    break;
            }
        }

        #endregion

        #region Privateメソッド

        /// <summary>
        /// ラベル表示を現在のステージで初期化する。
        /// </summary>
        private void InitializeLabels()
        {
            Transform stageLabel = this.transform.Find("MenuStageLabel");
            Text text;
            if (stageLabel && (text = stageLabel.GetComponent<Text>()))
            {
                text.text = "「" + (this.stage != null ? this.stage.Name : string.Empty) + "」";
            }

            Transform userLabel = this.transform.Find("MenuUserLabel");
            if (userLabel && (text = userLabel.GetComponent<Text>()))
            {
                text.text = "作者: " + (this.stage != null ? this.stage.Header.User.Name : string.Empty);
            }
        }

        #endregion
    }
}