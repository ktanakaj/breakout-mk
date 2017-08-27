// ================================================================================================
// <summary>
//      ゲームの各ブロックを扱うモデルソース</summary>
//
// <copyright file="Block.cs">
//      Copyright (C) 2017 Koichi Tanaka. All rights reserved.</copyright>
// <author>
//      Koichi Tanaka</author>
// ================================================================================================

namespace Honememo.BreakoutMk.Models
{
    using System;
    using UnityEngine;

    /// <summary>
    /// ゲームの各ブロックを扱うモデル。
    /// </summary>
    [Serializable]
    public class Block
    {
        #region Private変数

        /// <summary>
        /// ブロックのキー。
        /// </summary>
        [SerializeField]
        private string key;

        /// <summary>
        /// ブロック名。
        /// </summary>
        [SerializeField]
        private string name;

        /// <summary>
        /// ブロックのHP。
        /// </summary>
        [SerializeField]
        private int hp;

        /// <summary>
        /// ブロックの得点。
        /// </summary>
        [SerializeField]
        private int score;

        /// <summary>
        /// ブロックのXサイズ。
        /// </summary>
        [SerializeField]
        private int xsize;

        /// <summary>
        /// ブロックのYサイズ。
        /// </summary>
        [SerializeField]
        private int ysize;

        /// <summary>
        /// ブロックのRGB色。
        /// </summary>
        [SerializeField]
        private int color;

        #endregion

        #region プロパティ

        /// <summary>
        /// ブロックのキー。
        /// </summary>
        public string Key
        {
            get
            {
                return this.key;
            }

            set
            {
                this.key = value;
            }
        }

        /// <summary>
        /// ブロック名。
        /// </summary>
        public string Name
        {
            get
            {
                return this.name;
            }

            set
            {
                this.name = value;
            }
        }

        /// <summary>
        /// ブロックのHP。
        /// </summary>
        public int Hp
        {
            get
            {
                return this.hp;
            }

            set
            {
                this.hp = value;
            }
        }

        /// <summary>
        /// ブロックの得点。
        /// </summary>
        public int Score
        {
            get
            {
                return this.score;
            }

            set
            {
                this.score = value;
            }
        }

        /// <summary>
        /// ブロックのXサイズ。
        /// </summary>
        public int Xsize
        {
            get
            {
                return this.xsize;
            }

            set
            {
                this.xsize = value;
            }
        }

        /// <summary>
        /// ブロックのYサイズ。
        /// </summary>
        public int Ysize
        {
            get
            {
                return this.ysize;
            }

            set
            {
                this.ysize = value;
            }
        }

        /// <summary>
        /// ブロックのRGB色。
        /// </summary>
        public int Color
        {
            get
            {
                return this.color;
            }

            set
            {
                this.color = value;
            }
        }

        /// <summary>
        /// ブロックのR色値。
        /// </summary>
        public int R
        {
            get
            {
                return (this.Color >> 16) & 0xFF;
            }
        }

        /// <summary>
        /// ブロックのG色値。
        /// </summary>
        public int G
        {
            get
            {
                return (this.Color >> 8) & 0xFF;
            }
        }

        /// <summary>
        /// ブロックのB色値。
        /// </summary>
        public int B
        {
            get
            {
                return this.Color & 0xFF;
            }
        }

        #endregion
    }
}
