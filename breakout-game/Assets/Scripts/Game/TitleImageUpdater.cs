// ================================================================================================
// <summary>
//      タイトル画像の表示更新を行うクラスソース</summary>
//
// <copyright file="TitleImageUpdater.cs">
//      Copyright (C) 2017 Koichi Tanaka. All rights reserved.</copyright>
// <author>
//      Koichi Tanaka</author>
// ================================================================================================

namespace Honememo.BreakoutMk.Game
{
    using UnityEngine;
    using Honememo.BreakoutMk.Commons;

    /// <summary>
    /// タイトル画像の表示更新を行うクラス。
    /// </summary>
    public class TitleImageUpdater : MonoBehaviour
    {
        #region SendMessage用メソッド

        /// <summary>
        /// ゲームの状態に応じてGameObjectを変化させる。
        /// </summary>
        /// <param name="state">新しい状態。</param>
        public void ChangeState(GameState state)
        {
            // メニュー表示で表示、ゲーム開始で非表示
            switch (state)
            {
                case GameState.Menu:
                    UnityUtils.SetVisibleToImage(this, true);
                    break;
                case GameState.Reset:
                case GameState.Start:
                    UnityUtils.SetVisibleToImage(this, false);
                    break;
            }
        }

        #endregion
    }
}