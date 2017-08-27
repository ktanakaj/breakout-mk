// ================================================================================================
// <summary>
//      ゲームのプレイログを扱うモデルソース</summary>
//
// <copyright file="Playlog.cs">
//      Copyright (C) 2017 Koichi Tanaka. All rights reserved.</copyright>
// <author>
//      Koichi Tanaka</author>
// ================================================================================================

namespace Honememo.BreakoutMk.Models
{
    using System;
    using System.Collections.Generic;
    using UnityEngine;
    using Honememo.BreakoutMk.Commons;

    /// <summary>
    /// ゲームのプレイログを扱うモデル。
    /// </summary>
    [Serializable]
    public class Playlog
    {
        #region Private変数

        /// <summary>
        /// プレイログID。
        /// </summary>
        [SerializeField]
        private int id;

        /// <summary>
        /// プレイしたユーザーのID。
        /// </summary>
        [SerializeField]
        private int userId;

        /// <summary>
        /// プレイしたステージのID。
        /// </summary>
        [SerializeField]
        private int stageId;

        /// <summary>
        /// 獲得スコア。
        /// </summary>
        [SerializeField]
        private int score;

        /// <summary>
        /// クリアしたか？
        /// </summary>
        [SerializeField]
        private bool cleared;

        /// <summary>
        /// プレイ日時。
        /// </summary>
        [SerializeField]
        private string createdAt;

        /// <summary>
        /// 更新日時。
        /// </summary>
        [SerializeField]
        private string updatedAt;

        #endregion

        #region プロパティ

        /// <summary>
        /// プレイログID。
        /// </summary>
        public int Id
        {
            get
            {
                return this.id;
            }

            set
            {
                this.id = value;
            }
        }

        /// <summary>
        /// プレイしたユーザーのID。
        /// </summary>
        public int UserId
        {
            get
            {
                return this.userId;
            }

            set
            {
                this.userId = value;
            }
        }

        /// <summary>
        /// プレイしたステージのID。
        /// </summary>
        public int StageId
        {
            get
            {
                return this.stageId;
            }

            set
            {
                this.stageId = value;
            }
        }

        /// <summary>
        /// 獲得スコア。
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
        /// クリアしたか？
        /// </summary>
        public bool Cleared
        {
            get
            {
                return this.cleared;
            }

            set
            {
                this.cleared = value;
            }
        }

        /// <summary>
        /// プレイ日時。
        /// </summary>
        public string CreatedAt
        {
            get
            {
                return this.createdAt;
            }

            set
            {
                this.createdAt = value;
            }
        }

        /// <summary>
        /// 更新日時。
        /// </summary>
        public string UpdatedAt
        {
            get
            {
                return this.updatedAt;
            }

            set
            {
                this.updatedAt = value;
            }
        }

        #endregion

        #region Publicメソッド

        /// <summary>
        /// 各値から整合性チェック用のハッシュを計算する。
        /// </summary>
        /// <param name="secret">ハッシュ計算を複雑にする文字列。</param>
        /// <returns>計算したハッシュ文字列。</returns>
        public string Hash(string secret = "")
        {
            IList<object> data = new List<object>();
            data.Add(secret);
            data.Add(this.Id);
            data.Add(this.StageId);
            data.Add(this.UserId);
            data.Add(this.Score);
            data.Add(this.Cleared.ToString().ToLower());
            data.Add(this.CreatedAt);
            data.Add(this.UpdatedAt);
            return StringUtils.Sha1(data);
        }

        /// <summary>
        /// このオブジェクトを文字列に変換する。
        /// </summary>
        /// <returns>このオブジェクトの内容を変換した文字列。</returns>
        public override string ToString()
        {
            return ObjectUtils.ReflectionToString(this);
        }

        #endregion
    }
}