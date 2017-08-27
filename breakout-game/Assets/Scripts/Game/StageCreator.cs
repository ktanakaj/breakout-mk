// ================================================================================================
// <summary>
//      ステージの生成を行うクラスソース</summary>
//
// <copyright file="StageCreator.cs">
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
    /// ステージの生成を行うクラス。。
    /// </summary>
    public class StageCreator : MonoBehaviour
    {
        #region Public変数

        /// <summary>
        /// ゲームステージで使用するブロックのプレハブ。
        /// </summary>
        public GameObject BlockPrefab;

        /// <summary>
        /// ゲームで使用するプレイヤーのプレハブ。
        /// </summary>
        public GameObject PlayerPrefab;

        /// <summary>
        /// ゲームで使用するボールのプレハブ。
        /// </summary>
        public GameObject BallPrefab;

        /// <summary>
        /// 左上のブロックの位置。
        /// </summary>
        public Vector2 BlockInitialPoint;

        /// <summary>
        /// ブロックの横幅。
        /// </summary>
        public float BlockXsize = 1;

        /// <summary>
        /// ブロックの縦幅。
        /// </summary>
        public float BlockYsize = 1;

        #endregion

        #region Private変数

        /// <summary>
        /// ゲーム情報。
        /// </summary>
        private GameStatus gameStatus;

        #endregion

        #region Unityイベントメソッド

        /// <summary>
        /// ゲーム開始時に呼ばれる処理。
        /// </summary>
        public void Start()
        {
            // 起動時に参照するコンポーネントを見つけておく
            this.gameStatus = this.GetComponent<GameStatus>();
            if (!this.gameStatus)
            {
                throw new NotImplementedException("必要なComponentが接続されていません。");
            }

            if (!this.BlockPrefab || !this.PlayerPrefab || !this.BallPrefab)
            {
                throw new NotImplementedException("必要なPrefabが指定されていません。");
            }
        }

        #endregion

        #region Publicメソッド

        /// <summary>
        /// ステージを生成する。
        /// </summary>
        public void CreateStage()
        {
            // プレイヤー&ボール配置
            this.CreatePlayer();
            this.CreateBall();

            // ステージのマップからブロックを配置する
            IList<IList<object>> table = this.gameStatus.Stage.GetMapData(this.gameStatus.Blocks);
            Vector2 point = this.BlockInitialPoint;
            foreach (IList<object> row in table)
            {
                // ※ 横に長いブロックの場合、GetMapData()からはその分の空きも返ってくる前提。
                // ※ 縦に長いブロックは現状システム的には未対応。手動でスペースを空ける必要あり。
                foreach (object cell in row)
                {
                    if (cell is Block)
                    {
                        this.CreateBlock((Block)cell, point);
                    }

                    point = new Vector2(point.x + this.BlockXsize, point.y);
                }

                point = new Vector2(this.BlockInitialPoint.x, point.y - this.BlockYsize);
            }
        }

        /// <summary>
        /// プレイヤーを生成する。
        /// </summary>
        /// <returns>生成したプレイヤー。</returns>
        public GameObject CreatePlayer()
        {
            // プレイヤーはGameの下につけられないので、普通に生成
            // （初期座標などはプレハブのものを使用）
            return Instantiate(this.PlayerPrefab);
        }

        /// <summary>
        /// ボールを生成する。
        /// </summary>
        /// <returns>生成したボール。</returns>
        public GameObject CreateBall()
        {
            // 自分の親オブジェクトと同じ階層に置く
            // （初期座標などはプレハブのものを使用）
            GameObject ball = Instantiate(this.BallPrefab);
            ball.transform.SetParent(this.gameObject.transform, false);
            return ball;
        }

        /// <summary>
        /// 指定された座標にブロックを生成する。
        /// </summary>
        /// <param name="master">生成するブロックのマスタ情報。</param>
        /// <param name="point">生成する座標。</param>
        public GameObject CreateBlock(Block master, Vector2 point)
        {
            // 自分の親オブジェクトと同じ階層に置く
            GameObject block = (GameObject)Instantiate(this.BlockPrefab, point, new Quaternion());
            block.transform.SetParent(this.gameObject.transform, false);

            // マスタを紐づけ
            block.GetComponent<BlockController>().Block = master;
            return block;
        }

        #endregion
    }
}