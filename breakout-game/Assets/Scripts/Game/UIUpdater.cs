// ================================================================================================
// <summary>
//      UI全般の表示更新を行うクラスソース</summary>
//
// <copyright file="UIUpdater.cs">
//      Copyright (C) 2017 Koichi Tanaka. All rights reserved.</copyright>
// <author>
//      Koichi Tanaka</author>
// ================================================================================================

namespace Honememo.BreakoutMk.Game
{
    using UnityEngine;
    using UnityEngine.UI;

    /// <summary>
    /// UI全般の表示更新を行うクラス。
    /// </summary>
    /// <remarks>特定のオブジェクトに限らないものなどを扱う。</remarks>
    public class UIUpdater : MonoBehaviour
    {
        #region Public変数

        /// <summary>
        /// 再ゲーム用のボタンオブジェクト。
        /// </summary>
        public Button RestartButton;

        /// <summary>
        /// メニュー表示用のボタンオブジェクト。
        /// </summary>
        public Button MenuButton;

        #endregion

        #region SendMessage用メソッド

        /// <summary>
        /// ゲームの状態に応じてGameObjectを変化させる。
        /// </summary>
        /// <param name="state">新しい状態。</param>
        public void ChangeState(GameState state)
        {
            // ゲーム終了時に使用するボタン系は、終了時に出す&そこから状態が変わったら消す
            switch (state)
            {
                case GameState.Reset:
                case GameState.Menu:
                case GameState.Start:
                    this.SetActiveToGameEndButtons(false);
                    break;
                case GameState.Clear:
                case GameState.GameOver:
                    this.SetActiveToGameEndButtons(true);
                    break;
            }
        }

        #endregion

        #region Privateメソッド

        /// <summary>
        /// ゲーム終了時に用いるボタン群のactiveを設定する。
        /// </summary>
        /// <param name="value">有効にする場合true、無効にする場合false。</param>
        private void SetActiveToGameEndButtons(bool value)
        {
            if (this.RestartButton)
            {
                this.RestartButton.gameObject.SetActive(value);
            }

            if (this.MenuButton)
            {
                this.MenuButton.gameObject.SetActive(value);
            }
        }

        #endregion
    }
}