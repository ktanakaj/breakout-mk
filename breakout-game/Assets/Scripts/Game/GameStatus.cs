// ================================================================================================
// <summary>
//      ゲームの現在の情報を扱うモデルソース</summary>
//
// <copyright file="GameStatus.cs">
//      Copyright (C) 2017 Koichi Tanaka. All rights reserved.</copyright>
// <author>
//      Koichi Tanaka</author>
// ================================================================================================

namespace Honememo.BreakoutMk.Game
{
    using System;
    using System.Collections.Generic;
    using UnityEngine;
    using Honememo.BreakoutMk.Models;

    /// <summary>
    /// ゲームの現在の情報を扱うモデル。
    /// </summary>
    public class GameStatus : MonoBehaviour
    {
        #region Public変数

        /// <summary>
        /// プレイヤー情報。未ログインはnull。
        /// </summary>
        public User User;

        /// <summary>
        /// ブロックマスタ情報。
        /// </summary>
        public IDictionary<string, Block> Blocks;

        /// <summary>
        /// プレイ中のステージ情報。未プレイ時はnull。
        /// </summary>
        public Stage Stage;

        /// <summary>
        /// プレイ中のログ情報。未プレイ時はnull。
        /// </summary>
        public Playlog Playlog;

        /// <summary>
        /// プレイヤーの残機。
        /// </summary>
        public int Life = InitialLife;

        /// <summary>
        /// プレイヤーのスコア。
        /// </summary>
        public int Score;

        #endregion

        #region Private定数

        /// <summary>
        /// プレイヤーの残機初期値。
        /// </summary>
        private const int InitialLife = 3;

        #endregion

        #region Private変数

        /// <summary>
        /// ゲームの現在の状態。
        /// </summary>
        [SerializeField]
        private GameState state = GameState.Initializing;

        #endregion

        #region プロパティ

        /// <summary>
        /// ゲームの現在の状態。
        /// </summary>
        public GameState State
        {
            get
            {
                return this.state;
            }

            set
            {
                // シーン全てのオブジェクトに状態変更を通知
                Debug.Log("State: " + this.state + " → " + value);
                this.state = value;
                foreach (GameObject obj in Resources.FindObjectsOfTypeAll(typeof(GameObject)))
                {
                    obj.SendMessage("ChangeState", value, SendMessageOptions.DontRequireReceiver);
                }
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
            switch (state)
            {
                case GameState.Menu:
                    // メニュー表示で選択中のステージ削除
                    this.Stage = null;
                    break;
                case GameState.Start:
                    // ゲーム開始状態で残機とスコアを初期化
                    this.Life = InitialLife;
                    this.Score = 0;
                    break;
            }
        }

        #endregion
    }
}