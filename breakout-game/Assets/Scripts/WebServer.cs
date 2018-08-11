// ================================================================================================
// <summary>
//      サーバーAPIモデルソース</summary>
//
// <copyright file="WebServer.cs">
//      Copyright (C) 2017 Koichi Tanaka. All rights reserved.</copyright>
// <author>
//      Koichi Tanaka</author>
// ================================================================================================

namespace Honememo.BreakoutMk.Commons
{
    using System.Collections;
    using System.Collections.Generic;
    using System.IO;
    using System.Text.RegularExpressions;
    using UnityEngine;

    /// <summary>
    /// サーバーAPIモデル。
    /// </summary>
    public class WebServer : MonoBehaviour
    {
        #region Public変数

        /// <summary>
        /// サーバーAPIのルートパス。
        /// </summary>
        public string ApiRoot = string.Empty;

        /// <summary>
        /// API認証トークン。
        /// </summary>
        public string AuthToken = null;

        /// <summary>
        /// クッキー情報。
        /// </summary>
        public IDictionary<string, string> Cookies = new Dictionary<string, string>();

        /// <summary>
        /// リトライ回数。
        /// </summary>
        public int Retry = 3;

        /// <summary>
        /// リトライ時の待ち時間（ミリ秒）。
        /// </summary>
        public int Wait = 1000;

        #endregion

        #region delegate定義

        /// <summary>
        /// API完了時に実行する処理のデリゲート。
        /// </summary>
        /// <typeparam name="T">APIから返される型。</typeparam>
        /// <param name="result">APIから返される値。</param>
        public delegate void FinishedDelegate<T>(T result);

        /// <summary>
        /// 通信処理ラップ用のデリゲート。
        /// </summary>
        /// <returns>通信結果。</returns>
        private delegate WWW DoRequestDelgate();

        #endregion

        #region Publicメソッド

        /// <summary>
        /// GET APIコール。
        /// </summary>
        /// <param name="path">APIのパス。</param>
        /// <param name="success">成功時に実行する処理。</param>
        /// <param name="error">失敗時に実行する処理。</param>
        /// <returns>子ルーチンの実行状態。</returns>
        public IEnumerator Get(string path, FinishedDelegate<WWW> success = null, FinishedDelegate<WWW> error = null)
        {
            Dictionary<string, string> headers = new Dictionary<string, string>();
            this.MergeHeaders(headers);

            yield return this.DoRequestWithRetry(
                () => new WWW(this.ApiRoot + path, null, headers),
                success,
                error,
                "GET " + this.ApiRoot + path);
        }

        /// <summary>
        /// POST APIコール。
        /// </summary>
        /// <param name="path">APIのパス。</param>
        /// <param name="json">POSTで渡すJSON文字列。</param>
        /// <param name="success">成功時に実行する処理。</param>
        /// <param name="error">失敗時に実行する処理。</param>
        /// <returns>子ルーチンの実行状態。</returns>
        public IEnumerator Post(string path, string json, FinishedDelegate<WWW> success = null, FinishedDelegate<WWW> error = null)
        {
            Dictionary<string, string> headers = new Dictionary<string, string>();
            headers["Content-Type"] = "application/json";
            this.MergeHeaders(headers);

            var formData = System.Text.Encoding.UTF8.GetBytes(json);

            yield return this.DoRequestWithRetry(
                () => new WWW(this.ApiRoot + path, formData, headers),
                success,
                error,
                "POST " + this.ApiRoot + path + " " + json);
        }

        #endregion

        #region Protectedメソッド

        /// <summary>
        /// APIコール用のヘッダー登録。
        /// </summary>
        /// <param name="headers">ヘッダーを登録する先。</param>
        protected void MergeHeaders(Dictionary<string, string> headers)
        {
            if (!string.IsNullOrEmpty(this.AuthToken))
            {
                // 認証情報があれば登録
                headers["Authorization"] = this.AuthToken;
            }

            if (this.Cookies.Count > 0)
            {
                // Cookieがあれば登録
                string cookieHeader = string.Empty;
                foreach (var c in this.Cookies)
                {
                    if (cookieHeader.Length > 0)
                    {
                        cookieHeader += ";";
                    }

                    cookieHeader += c.Key + "=" + c.Value;
                }

                headers["Cookie"] = cookieHeader;
            }
        }

        /// <summary>
        /// サーバーアクセス結果からHTTPステータスコードを取得する。
        /// </summary>
        /// <param name="www">サーバーアクセス結果。</param>
        /// <returns>取得したステータスコード。取得失敗時は0。</returns>
        protected int GetHttpStatus(WWW www)
        {
            // ※ レスポンスヘッダーから取得するが、環境によっては入っていないこともあるらしいので注意
            string s;
            if (www.responseHeaders.TryGetValue("STATUS", out s))
            {
                Match m = Regex.Match(s, "HTTP/[0-9.]+ ([1-9][0-9]+)\\b");
                int status;
                if (m.Success && int.TryParse(m.Groups[1].Value, out status))
                {
                    return status;
                }
                else
                {
                    Debug.Log("www.responseHeaders[\"STATUS\"] is not supported (\"" + s + "\").");
                }
            }
            else
            {
                Debug.Log("www.responseHeaders[\"STATUS\"] is not found.");
            }

            return 0;
        }

        /// <summary>
        /// サーバーアクセス結果からエラーメッセージを生成する。
        /// </summary>
        /// <param name="www">サーバーアクセス結果。</param>
        /// <returns>生成したメッセージ。</returns>
        protected string MakeErrorMessage(WWW www)
        {
            return www.error + " " + www.url;
        }

        #endregion

        #region Privateメソッド

        /// <summary>
        /// リクエストをリトライ付きで実行する。
        /// </summary>
        /// <param name="request">実行するリクエスト処理。複数回実行される。</param>
        /// <param name="success">成功時に実行する処理。</param>
        /// <param name="error">失敗時に実行する処理。</param>
        /// <param name="log">デバッグログメッセージ。空の場合は出力しない。</param>
        /// <returns>子ルーチンの実行状態。</returns>
        private IEnumerator DoRequestWithRetry(
            DoRequestDelgate request,
            FinishedDelegate<WWW> success,
            FinishedDelegate<WWW> error,
            string log = "")
        {
            // エラーの場合に、既定回数リトライする
            string s = log;
            int i = 1;
            WWW www;
            do
            {
                if (!string.IsNullOrEmpty(log))
                {
                    Debug.Log(s);
                }

                www = request();
                yield return www;

                // 正常ならOK
                if (string.IsNullOrEmpty(www.error))
                {
                    break;
                }

                // エラーであっても4xx系はリトライしても無駄なはずなので終了
                int status = this.GetHttpStatus(www);
                if (status >= 400 && status < 500)
                {
                    break;
                }

                // 次回リトライの準備
                if (i <= this.Retry)
                {
                    s = log + " (Retry:" + i + ")";
                    yield return new WaitForSeconds(this.Wait / 1000f);
                }
            }
            while (i++ <= this.Retry);

            this.InvokeFinishedDelegate(www, success, error);
        }

        /// <summary>
        /// APIコールの後処理を実行する。
        /// </summary>
        /// <param name="www">サーバーアクセス結果。</param>
        /// <param name="success">成功時に実行する処理。</param>
        /// <param name="error">失敗時に実行する処理。</param>
        /// <exception cref="IOException"><c>error</c>未設定でエラーの場合。</exception>
        private void InvokeFinishedDelegate(WWW www, FinishedDelegate<WWW> success = null, FinishedDelegate<WWW> error = null)
        {
            // 正常系はデリゲートが渡された場合のみ、異常系はデフォルトでIOExceptionを投げる
            if (string.IsNullOrEmpty(www.error))
            {
                if (success != null)
                {
                    success(www);
                }
            }
            else
            {
                if (error != null)
                {
                    error(www);
                }
                else
                {
                    throw new IOException(this.MakeErrorMessage(www));
                }
            }
        }

        #endregion
    }
}