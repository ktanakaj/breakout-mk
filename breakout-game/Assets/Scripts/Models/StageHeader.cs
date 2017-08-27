// ================================================================================================
// <summary>
//      ゲームの各ステージのヘッダー情報を扱うモデルソース</summary>
//
// <copyright file="StageHeader.cs">
//      Copyright (C) 2017 Koichi Tanaka. All rights reserved.</copyright>
// <author>
//      Koichi Tanaka</author>
// ================================================================================================

namespace Honememo.BreakoutMk.Models
{
    using System;
    using UnityEngine;

    /// <summary>
    /// ゲームの各ステージのヘッダー情報を扱うモデル。
    /// </summary>
    [Serializable]
    public class StageHeader
    {
        #region Private変数

        /// <summary>
        /// ステージヘッダーID。
        /// </summary>
        [SerializeField]
        private int id;

        /// <summary>
        /// ステージの状態。
        /// </summary>
        [SerializeField]
        private string status;

        /// <summary>
        /// ステージの作成日時。
        /// </summary>
        [SerializeField]
        private string createdAt;

        /// <summary>
        /// ステージの更新日時。
        /// </summary>
        [SerializeField]
        private string updatedAt;

        /// <summary>
        /// 作者。
        /// </summary>
        [SerializeField]
        private User user;

        #endregion

        #region プロパティ

        /// <summary>
        /// ステージID。
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
        /// ステージの状態。
        /// </summary>
        public string Status
        {
            get
            {
                return this.status;
            }

            set
            {
                this.status = value;
            }
        }

        /// <summary>
        /// ステージの作成日時。
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
        /// ステージの更新日時。
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

        /// <summary>
        /// 作者。
        /// </summary>
        public User User
        {
            get
            {
                return this.user;
            }

            set
            {
                this.user = value;
            }
        }

        #endregion
    }
}