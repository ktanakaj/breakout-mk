// ================================================================================================
// <summary>
//      ブロックに関する処理を扱うコントローラソース</summary>
//
// <copyright file="BlockController.cs">
//      Copyright (C) 2017 Koichi Tanaka. All rights reserved.</copyright>
// <author>
//      Koichi Tanaka</author>
// ================================================================================================

namespace Honememo.BreakoutMk.Game
{
    using UnityEngine;
    using Honememo.BreakoutMk.Models;

    /// <summary>
    /// ブロックに関する処理を扱うコントローラ。
    /// </summary>
    public class BlockController : MonoBehaviour
    {
        #region Public変数

        /// <summary>
        /// ブロックの現在HP。
        /// </summary>
        public int Hp;

        #endregion

        #region Private変数

        /// <summary>
        /// ブロックのマスタデータ。
        /// </summary>
        [SerializeField]
        private Block block;

        #endregion

        #region プロパティ

        /// <summary>
        /// ブロックのマスタデータ。
        /// </summary>
        public Block Block
        {
            get
            {
                return this.block;
            }

            set
            {
                // マスタデータ設定のタイミングで初期HPや色、サイズを設定する
                this.block = value;
                this.Hp = value.Hp;
                SpriteRenderer render = this.GetComponent<SpriteRenderer>();
                render.color = new Color(value.R, value.G, value.B);
                this.transform.localScale = new Vector2(
                    this.transform.localScale.x * value.Xsize,
                    this.transform.localScale.y * value.Ysize);
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
            // ゲーム中以外はオブジェクトを消す
            if (!state.IsGaming())
            {
                Destroy(this.gameObject);
            }
        }

        #endregion

        #region Publicメソッド

        /// <summary>
        /// ブロックへの命中処理。
        /// </summary>
        /// <param name="damage">与えるダメージ。デフォルトは1。</param>
        /// <returns>獲得したスコア。</returns>
        public int Hit(int damage = 1)
        {
            // HPを減らす、0になったらブロックを破壊し得点を返す
            this.Hp -= damage;
            int score = 0;
            if (this.Hp <= 0)
            {
                score = this.Block.Score;
                Destroy(this.gameObject);
            }

            return score;
        }

        #endregion
    }
}