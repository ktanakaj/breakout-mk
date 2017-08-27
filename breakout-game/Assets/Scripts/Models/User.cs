// ================================================================================================
// <summary>
//      ユーザーを扱うモデルソース</summary>
//
// <copyright file="User.cs">
//      Copyright (C) 2017 Koichi Tanaka. All rights reserved.</copyright>
// <author>
//      Koichi Tanaka</author>
// ================================================================================================

namespace Honememo.BreakoutMk.Models
{
    using System;
    using UnityEngine;

    /// <summary>
    /// ユーザーを扱うモデル。
    /// </summary>
    [Serializable]
    public class User
    {
        #region Private変数

        /// <summary>
        /// ユーザーID。
        /// </summary>
        [SerializeField]
        private int id;

        /// <summary>
        /// ユーザー名。
        /// </summary>
        [SerializeField]
        private string name;

        /// <summary>
        /// ユーザーの状態。
        /// </summary>
        [SerializeField]
        private string status;

        /// <summary>
        /// ユーザーの作成日時。
        /// </summary>
        [SerializeField]
        private string createdAt;

        /// <summary>
        /// ユーザーの更新日時。
        /// </summary>
        [SerializeField]
        private string updatedAt;

        #endregion

        #region プロパティ

        /// <summary>
        /// ユーザーID。
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
        /// ユーザー名。
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
        /// ユーザーの状態。
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
        /// ユーザーの作成日時。
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
        /// ユーザーの更新日時。
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
    }
}