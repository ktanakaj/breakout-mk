// ================================================================================================
// <summary>
//      ブロックくずしアプリ実行中のページモデルソース</summary>
//
// <copyright file="BreakoutPage.cs">
//      Copyright (C) 2017 Koichi Tanaka. All rights reserved.</copyright>
// <author>
//      Koichi Tanaka</author>
// ================================================================================================

namespace Honememo.BreakoutMk.Commons
{
    using System.Collections;

    /// <summary>
    /// ブロックくずしアプリ実行中のページモデル。
    /// </summary>
    public class BreakoutPage : WebPage
    {
        #region 定数

        /// <summary>
        /// LocalStorageのAPI認証トークンのキー値。
        /// </summary>
        public const string TokenKey = "ngStorage-authToken";

        #endregion

        #region Public変数

        /// <summary>
        /// WebGL未実行時に使用する認証トークン。
        /// </summary>
        public string DummyAuthToken = string.Empty;

        /// <summary>
        /// WebGL未実行時に使用するステージID。
        /// </summary>
        public int DummyStageId = 0;

        #endregion

        #region Publicメソッド

        /// <summary>
        /// WebGL実行時に認証トークンを取得する。
        /// </summary>
        /// <param name="func">取得結果を受け取るデリゲート。</param>
        /// <returns>処理結果。</returns>
        public IEnumerator GetAuthToken(AfterGetDelegate<string> func)
        {
            if (!this.IsWeb())
            {
                func(this.DummyAuthToken);
            }
            else
            {
                yield return this.GetLocalStorage(
                    TokenKey,
                    (token) =>
                    {
                        // ダブルクオーテーションで囲まれた文字列で来るので中身を渡す
                        // ※ "null" が文字列で来たりもしているのでその場合消す
                        if (token == null || token == "null")
                        {
                            func(null);
                        }
                        else
                        {
                            func(token.Trim('"'));
                        }
                    });
            }
        }

        /// <summary>
        /// WebGL実行時にステージIDを取得する。
        /// </summary>
        /// <param name="func">取得結果を受け取るデリゲート。</param>
        /// <returns>処理結果。</returns>
        public IEnumerator GetStageId(AfterGetDelegate<int> func)
        {
            if (!this.IsWeb())
            {
                func(this.DummyStageId);
            }
            else
            {
                yield return this.GetUrl((url) =>
                {
                    var param = ParseQuery(url);
                    int id;
                    string idStr;
                    if (param.TryGetValue("stage_id", out idStr) && int.TryParse(idStr, out id))
                    {
                        func(id);
                    }
                });
            }
        }

        /// <summary>
        /// WebGL実行時に言語設定を取得する。
        /// </summary>
        /// <param name="func">取得結果を受け取るデリゲート。</param>
        /// <returns>処理結果。</returns>
        public IEnumerator GetLanguage(AfterGetDelegate<string> func)
        {
            if (!this.IsWeb())
            {
                func(string.Empty);
            }
            else
            {
                yield return this.GetUrl((url) =>
                {
                    var param = ParseQuery(url);
                    string lang;
                    if (param.TryGetValue("lang", out lang))
                    {
                        func(lang);
                    }
                });
            }
        }

        #endregion
    }
}