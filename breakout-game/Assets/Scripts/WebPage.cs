// ================================================================================================
// <summary>
//      WebGLアプリ実行中のページモデルソース</summary>
//
// <copyright file="WebPage.cs">
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
    using System.Text.RegularExpressions;
    using System.Threading;
    using UnityEngine;
    using LitJson;

    /// <summary>
    /// WebGLアプリ実行中のページモデル。
    /// </summary>
    public class WebPage : MonoBehaviour
    {
        #region 定数

        /// <summary>
        /// JavaScriptタイムアウトフレーム数。
        /// </summary>
        private const int TimeOut = 1200;

        #endregion

        #region Private変数

        /// <summary>
        /// JavaScript応答結果。
        /// </summary>
        private IDictionary<int, string> results = new Dictionary<int, string>();

        /// <summary>
        /// results用のIDカウンター。
        /// </summary>
        private int idCounter = 0;

        #endregion

        #region delegate定義

        /// <summary>
        /// JavaScript系メソッドで結果取得後の処理を扱うデリゲート。
        /// </summary>
        /// <typeparam name="T">取得データの型。</typeparam>
        /// <param name="value">JavaScriptからの取得データ。</param>
        public delegate void AfterGetDelegate<T>(T value);

        #endregion

        #region 静的Publicメソッド

        /// <summary>
        /// URL内のクエリーパラメータをディクショナリーに分割する。
        /// </summary>
        /// <param name="url">クエリーを参照するURL。</param>
        /// <returns>クエリーパラメータ。</returns>
        public static IDictionary<string, string> ParseQuery(string url)
        {
            Uri uri = new Uri(url);
            IDictionary<string, string> param = new Dictionary<string, string>();
            foreach (Match match in Regex.Matches(uri.Query, "([^?=&]+)=?([^&]*)(&$)?"))
            {
                param.Add(match.Groups[1].Value, match.Groups[2].Value);
            }

            return param;
        }

        #endregion

        #region Publicメソッド

        /// <summary>
        /// WebGL実行時にページURL情報を取得する。
        /// </summary>
        /// <param name="func">取得結果を受け取るデリゲート。</param>
        /// <returns>実行結果。</returns>
        public IEnumerator GetUrl(AfterGetDelegate<string> func)
        {
            // ページのURLを受け取り側メソッドに送信させる
            yield return this.GetWebPageValue(func, "window.location.href", "http://localhost/");
        }

        /// <summary>
        /// WebGL実行時にCookie情報を取得する。
        /// </summary>
        /// <param name="func">取得結果を受け取るデリゲート。</param>
        /// <returns>実行結果。</returns>
        public IEnumerator GetCookies(AfterGetDelegate<IDictionary<string, string>> func)
        {
            // Cookieの内容を受け取り側メソッドに送信させる
            yield return this.GetWebPageValue(
                (allCookies) =>
                {
                    IDictionary<string, string> cookies = new Dictionary<string, string>();
                    foreach (string cookieStr in allCookies.Split(';'))
                    {
                        string[] keyAndValue = cookieStr.Split('=');
                        if (keyAndValue.Length >= 2)
                        {
                            cookies[keyAndValue[0]] = keyAndValue[1];
                        }
                    }

                    func(cookies);
                },
                "(document.cookie || '')");
        }

        /// <summary>
        /// WebGL実行時にローカルストレージ情報を取得する。
        /// </summary>
        /// <param name="key">ローカルストレージのキー。</param>
        /// <param name="func">取得結果を受け取るデリゲート。</param>
        /// <returns>実行結果。</returns>
        public IEnumerator GetLocalStorage(string key, AfterGetDelegate<string> func)
        {
            // ローカルストレージの内容を受け取り側メソッドに送信させる
            yield return this.GetWebPageValue(func, "(window.localStorage.getItem('" + key + "') || '')");
        }

        /// <summary>
        /// このアプリがWebで実行されているか？
        /// </summary>
        /// <returns>Webで実行されている場合true。</returns>
        public bool IsWeb()
        {
            return Application.platform == RuntimePlatform.WebGLPlayer;
        }

        /// <summary>
        /// JavaScript経由でWebページの値を取得する。
        /// </summary>
        /// <param name="func">値取得後に実行する処理。</param>
        /// <param name="valueRawStr">メソッドの引数として記述する文字列。JavaScriptが記述可能。</param>
        /// <param name="dummy">WebGLで実行していない場合にダミーで渡すWebページの値。</param>
        /// <returns>実行結果。</returns>
        public IEnumerator GetWebPageValue(AfterGetDelegate<string> func, string valueRawStr, string dummy = null)
        {
            // 一意なIDを生成し、値取得後に実行する処理をプロパティに記録
            int id = Interlocked.Increment(ref this.idCounter);
            string command = this.MakeSendMessageForGetWebPageValueEnd(id, valueRawStr);
            Debug.Log(command + " called.");
            if (!this.IsWeb())
            {
                Debug.Log("WebGL環境外。ダミー処理を実行します。");
                func(dummy);
            }
            else
            {
                // JavaScript経由でGetWebPageValueEndに結果を送信。結果が来るまで待つ
                Application.ExternalEval(command);
                int counter = 0;
                while (!this.results.ContainsKey(id))
                {
                    if (++counter > TimeOut)
                    {
                        throw new IOException("Webページが応答しません");
                    }

                    yield return null;
                }

                // 取得した結果で後処理を実行
                func(this.results[id]);
                this.results.Remove(id);
            }
        }

        /// <summary>
        /// JavaScript経由でWebページの値を取得する（結果受け取り処理）。
        /// </summary>
        /// <param name="json">値取得後に実行する処理のキーと値のJSON。</param>
        public void GetWebPageValueEnd(string json)
        {
            // 結果のフォーマットチェックを行い、問題なければ結果領域に格納
            Debug.Log("SendMessage('" + this.transform.root.name + "', 'GetWebPageValueEnd', '" + json + "') received.");

            JsonData array = JsonMapper.ToObject(json);
            if (!array.IsArray || array.Count != 2)
            {
                throw new ArgumentException("JSONが対応しない書式です: \"" + json + "\"");
            }

            JsonData id = array[0];
            if (id == null || !id.IsInt)
            {
                throw new ArgumentException("JSONのID値が不正です: " + id);
            }

            // ※ JavaScriptからの結果は一旦全てテキストとしているので、ここでもテキストに再変換
            this.results[(int)id] = array[1].IsObject || array[1].IsArray ? array[1].ToJson() : array[1].ToString();
        }

        #endregion

        #region Privateメソッド

        /// <summary>
        /// JavaScriptのSendMessageの関数呼び出し文字列を生成する。
        /// </summary>
        /// <param name="id">後処理のID。</param>
        /// <param name="valueRawStr">メソッドの引数として記述する文字列。JavaScriptが記述可能。</param>
        /// <returns>生成したJavaScript。</returns>
        private string MakeSendMessageForGetWebPageValueEnd(int id, string valueRawStr)
        {
            return "SendMessage('" + this.transform.root.name + "', 'GetWebPageValueEnd', '[" + id + ", \\'' + " + valueRawStr + " + '\\']')";
        }

        #endregion
    }
}