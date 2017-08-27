// ================================================================================================
// <summary>
//      ゲームの各ステージを扱うモデルソース</summary>
//
// <copyright file="Stage.cs">
//      Copyright (C) 2017 Koichi Tanaka. All rights reserved.</copyright>
// <author>
//      Koichi Tanaka</author>
// ================================================================================================

namespace Honememo.BreakoutMk.Models
{
    using System;
    using System.Collections.Generic;
    using System.Text.RegularExpressions;
    using UnityEngine;

    /// <summary>
    /// ゲームの各ステージを扱うモデル。
    /// </summary>
    [Serializable]
    public class Stage
    {
        #region Private変数

        /// <summary>
        /// ステージID。
        /// </summary>
        [SerializeField]
        private int id;

        /// <summary>
        /// ステージ名。
        /// </summary>
        [SerializeField]
        private string name;

        /// <summary>
        /// ステージの状態。
        /// </summary>
        [SerializeField]
        private string status;

        /// <summary>
        /// ステージのマップ情報。
        /// </summary>
        [SerializeField]
        private string map;

        /// <summary>
        /// ステージのコメント。
        /// </summary>
        [SerializeField]
        private string comment;

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
        /// ステージのヘッダー。
        /// </summary>
        [SerializeField]
        private StageHeader header;

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
        /// ステージ名。
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
        /// ステージのマップ情報。
        /// </summary>
        public string Map
        {
            get
            {
                return this.map;
            }

            set
            {
                this.map = value;
            }
        }

        /// <summary>
        /// ステージのコメント。
        /// </summary>
        public string Comment
        {
            get
            {
                return this.comment;
            }

            set
            {
                this.comment = value;
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
        /// ステージのヘッダー。
        /// </summary>
        public StageHeader Header
        {
            get
            {
                return this.header;
            }

            set
            {
                this.header = value;
            }
        }

        #endregion

        #region Publicメソッド

        /// <summary>
        /// マップデータを縦×横の二次元配列で取得する。
        /// </summary>
        /// <returns>二次元配列のマップデータ。</returns>
        public IList<IList<string>> GetMapData()
        {
            // ステージのマップを正規表現で解析し、その構文からマップを展開する
            // 現状 "[key]" と " " と "\n" のみを処理する。それ以外の文字は無視（誤記が多いので一部対応）
            IList<IList<string>> table = new List<IList<string>>();
            IList<string> row = new List<string>();
            foreach (Match match in new Regex("(\\[.*?\\]|\\{.*?\\}|<.*?>|[\\s\\n])").Matches(this.Map))
            {
                string command = match.Value;
                if (command == "\n")
                {
                    // 改行は、次のラインに切り替え
                    table.Add(row);
                    row = new List<string>();
                }
                else if (command == " ")
                {
                    // 空白の場合、1要素スキップ
                    row.Add(null);
                }
                else
                {
                    // それ以外はコマンドなのでそのまま記録
                    row.Add(command);
                }
            }

            table.Add(row);
            return table;
        }

        /// <summary>
        /// マップデータを縦×横の二次元配列で取得する。
        /// </summary>
        /// <param name="blocks">マップデータと紐づけるブロックマスタ。</param>
        /// <returns>二次元配列のマップデータ。</returns>
        public IList<IList<object>> GetMapData(IDictionary<string, Block> blocks)
        {
            // 二次元配列のうち、ブロック要素をマスタに変換する
            // またブロック要素がサイズを持つ場合、その分の空きスペースを入れる
            Regex regex = new Regex("\\[(.*?)\\]");
            IList<IList<string>> strTable = this.GetMapData();
            IList<IList<object>> objTable = new List<IList<object>>();
            foreach (var strRow in strTable)
            {
                IList<object> objRow = new List<object>();
                foreach (string command in strRow)
                {
                    if (string.IsNullOrEmpty(command))
                    {
                        objRow.Add(null);
                        continue;
                    }

                    // ブロック生成コマンドを解析
                    Match match = regex.Match(command);
                    if (!match.Success)
                    {
                        Debug.Log("不明なコマンドです (\"" + command + "\")");
                        objRow.Add(null);
                        continue;
                    }

                    string key = match.Groups[1].Value;
                    Block block = null;
                    if (!blocks.TryGetValue(key, out block))
                    {
                        Debug.Log("key=\"" + key + "\" はブロック情報に存在しません");
                        objRow.Add(null);
                        continue;
                    }

                    // ブロックマスタを割り当て。サイズを持つ場合は、その分空きスペースも入れる
                    // ※ 現状X方向のみ対応
                    objRow.Add(block);
                    for (int i = 1; i < block.Xsize; i++)
                    {
                        objRow.Add(null);
                    }
                }

                objTable.Add(objRow);
            }

            return objTable;
        }

        #endregion
    }
}