// ================================================================================================
// <summary>
//      ブロックくずしメーカーサーバーAPIモデルソース</summary>
//
// <copyright file="BreakoutServer.cs">
//      Copyright (C) 2017 Koichi Tanaka. All rights reserved.</copyright>
// <author>
//      Koichi Tanaka</author>
// ================================================================================================

namespace Honememo.BreakoutMk.Commons
{
    using System;
    using System.Collections;
    using System.Collections.Generic;
    using System.IO;
    using UnityEngine;
    using LitJson;
    using Honememo.BreakoutMk.Models;

    /// <summary>
    /// ブロックくずしメーカーサーバーAPIモデル。
    /// </summary>
    public class BreakoutServer : WebServer
    {
        #region Public変数

        /// <summary>
        /// このインスタンスは初期化済みか？
        /// </summary>
        public bool Initialized = false;

        /// <summary>
        /// ハッシュ計算に用いる文字列。
        /// </summary>
        public string Secret = string.Empty;

        #endregion

        #region Private定数

        /// <summary>
        /// APIのルートパス。
        /// </summary>
        private const string ApiPath = "/api";

        #endregion

        #region delegate定義

        /// <summary>
        /// JavaScript系メソッドでWebGLで動いていない場合に使用する処理のデリゲート。
        /// </summary>
        public delegate void AfterInitialize();

        #endregion

        #region Unityイベントメソッド

        /// <summary>
        /// ゲーム開始時に呼ばれる処理。
        /// </summary>
        public void Start()
        {
            // サーバーAPIの初期化処理を子ルーチンで実行
            this.StartCoroutine(this.Initialize());
        }

        #endregion

        #region API参照メソッド

        /// <summary>
        /// ステージ一覧の読み込み。
        /// </summary>
        /// <param name="func">取得したステージ情報リストを受け取るデリゲート。</param>
        /// <returns>処理結果。</returns>
        /// <exception cref="IOException">読み込み失敗時。</exception>
        public IEnumerator FindStages(FinishedDelegate<IList<Stage>> func)
        {
            yield return this.Get(
                "/stages",
                (www) =>
                {
                    var obj = JsonMapper.ToObject(www.text);
                    IList<Stage> stages = new List<Stage>();
                    for (int i = 0; i < obj.Count; i++)
                    {
                        stages.Add(JsonUtility.FromJson<Stage>(obj[i].ToJson()));
                    }

                    func(stages);
                });
        }

        /// <summary>
        /// ステージ情報の読み込み。
        /// </summary>
        /// <param name="id">読み込むステージのID。</param>
        /// <param name="func">取得したステージ情報を受け取るデリゲート。</param>
        /// <returns>処理結果。</returns>
        /// <exception cref="IOException">読み込み失敗時。</exception>
        public IEnumerator FindStage(int id, FinishedDelegate<Stage> func)
        {
            yield return this.Get(
                "/stages/" + id,
                (www) => func(JsonUtility.FromJson<Stage>(www.text)),
                (www) => { throw new NotifiableException("STAGE_UNAVAILABLE", id); });
        }

        /// <summary>
        /// ブロック一覧の読み込み。
        /// </summary>
        /// <param name="func">取得したブロック情報リストを受け取るデリゲート。</param>
        /// <returns>処理結果。</returns>
        /// <exception cref="IOException">読み込み失敗時。</exception>
        public IEnumerator FindBlocks(FinishedDelegate<IDictionary<string, Block>> func)
        {
            yield return this.Get(
                "/blocks",
                (www) =>
                {
                    var obj = JsonMapper.ToObject(www.text);
                    IDictionary<string, Block> blocks = new Dictionary<string, Block>();
                    for (int i = 0; i < obj.Count; i++)
                    {
                        Block block = JsonUtility.FromJson<Block>(obj[i].ToJson());
                        blocks.Add(block.Key, block);
                    }

                    func(blocks);
                });
        }

        /// <summary>
        /// ユーザー情報の読み込み。
        /// </summary>
        /// <param name="func">取得したユーザー情報を受け取るデリゲート。</param>
        /// <returns>処理結果。</returns>
        /// <exception cref="IOException">読み込み失敗時。</exception>
        public IEnumerator FindUser(FinishedDelegate<User> func)
        {
            yield return this.Get(
                "/users/me",
                (www) => func(JsonUtility.FromJson<User>(www.text)),
                (www) =>
                {
                    // 未認証の場合401が返るのでnullを戻す
                    // ※ 値が設定されていない場合も環境の問題か判別できないのでとりあえずnullを返す
                    int status = this.GetHttpStatus(www);
                    if (status == 401 || status == 0)
                    {
                        func(null);
                    }
                    else
                    {
                        throw new IOException(this.MakeErrorMessage(www));
                    }
                });
        }

        /// <summary>
        /// ステージ開始状況の通知。
        /// </summary>
        /// <param name="stageId">開始したステージのID。</param>
        /// <param name="func">取得したプレイログを受け取るデリゲート。</param>
        /// <returns>処理結果。</returns>
        /// <exception cref="IOException">保存失敗時。</exception>
        public IEnumerator SaveStageStart(int stageId, FinishedDelegate<Playlog> func)
        {
            var param = new StartParam{ stageId = stageId };

            yield return this.Post(
                "/games/start",
                JsonUtility.ToJson(param),
                (www) => func(JsonUtility.FromJson<Playlog>(www.text)),
                (www) =>
                {
                    // アクセス不可や削除の場合404が返るのでnullを戻す
                    // ※ 値が設定されていない場合も環境の問題か判別できないのでとりあえず同じエラーを返す
                    int status = this.GetHttpStatus(www);
                    if (status == 404 || status == 0)
                    {
                        throw new NotifiableException("STAGE_UNAVAILABLE", stageId);
                    }
                    else
                    {
                        throw new IOException(this.MakeErrorMessage(www));
                    }
                });
        }

        /// <summary>
        /// ステージ達成状況の保存。
        /// </summary>
        /// <param name="playlog">送信するプレイログ。</param>
        /// <returns>処理結果。</returns>
        /// <exception cref="IOException">保存失敗時。</exception>
        public IEnumerator SaveStageResult(Playlog playlog)
        {
            var param = new EndParam
            {
                id = playlog.Id,
                score = playlog.Score,
                cleared = playlog.Cleared,
                hash = playlog.Hash(this.Secret),
            };

            yield return this.Post("/games/end", JsonUtility.ToJson(param));
        }

        #endregion

        #region Privateメソッド

        /// <summary>
        /// Webページの情報をプロパティに読み込む。
        /// </summary>
        /// <returns>処理結果。</returns>
        private IEnumerator Initialize()
        {
            // アプリにWebページが登録されていて、Web上で実行されている場合、
            // APIのURLを現在のページのURLから動的に置き換え
            // （セキュリティ上の制限により他のドメインと通信できないため。）
            BreakoutPage page = this.GetComponent<BreakoutPage>();
            if (page != null && page.IsWeb())
            {
                // URLを読み込み
                yield return page.GetUrl((url) =>
                {
                    UriBuilder b = new UriBuilder(url);
                    b.Path = ApiPath;
                    b.Query = null;
                    this.ApiRoot = b.ToString();
                });

                // Webページのローカルストレージから、API認証用のトークンも読み込み
                yield return page.GetAuthToken((token) => { this.AuthToken = token; });
            }

            // 初期化済みを記録
            this.Initialized = true;
        }

        #endregion

        #region 内部クラス

        /// <summary>
        /// /games/start API引数パラメータ。
        /// </summary>
        [Serializable]
        private class StartParam {
            /// <summary>
            /// ステージID。
            /// </summary>
            public int stageId;
        }

        /// <summary>
        /// /games/end API引数パラメータ。
        /// </summary>
        [Serializable]
        private class EndParam
        {
            /// <summary>
            /// プレイログID。
            /// </summary>
            public int id;
            /// <summary>
            /// 獲得スコア。
            /// </summary>
            public int score;
            /// <summary>
            /// クリアしたか？
            /// </summary>
            public bool cleared;
            /// <summary>
            /// 整合性チェック用のハッシュ。
            /// </summary>
            public string hash;
        }

        #endregion
    }
}