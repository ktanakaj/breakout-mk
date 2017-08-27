// ================================================================================================
// <summary>
//      言語別テキストリソースを扱うクラスソース</summary>
//
// <copyright file="Locale.cs">
//      Copyright (C) 2017 Koichi Tanaka. All rights reserved.</copyright>
// <author>
//      Koichi Tanaka</author>
// ================================================================================================

namespace Honememo.BreakoutMk.Commons
{
    using System;
    using System.Collections.Generic;
    using System.IO;
    using UnityEngine;

    /// <summary>
    /// 言語別テキストリソースを扱うクラス。
    /// </summary>
    public class Locale : Dictionary<string, string>
    {
        #region 静的Public変数

        /// <summary>
        /// ロケールファイルのResources内のパス。
        /// </summary>
        public static string LocaleResource = "Locales/{0}";

        /// <summary>
        /// デフォルトの言語。
        /// </summary>
        public static string DefaultLanguage = null;

        #endregion

        #region 静的変数

        /// <summary>
        /// シングルトン用のディクショナリー。
        /// </summary>
        private static IDictionary<string, Locale> locales = new Dictionary<string, Locale>();

        #endregion

        #region コンストラクタ

        /// <summary>
        /// 指定された言語用のリソースインスタンスを作成する。
        /// </summary>
        /// <param name="language">言語名。</param>
        /// <exception cref="ArgumentException">言語に対応するリソースが存在しない場合。</exception>
        private Locale(string language)
        {
            string path = string.Format(LocaleResource, language);
            TextAsset file = Resources.Load<TextAsset>(path);
            if (!file)
            {
                throw new ArgumentException("/Resources/" + path + " is not found");
            }

            using (StringReader sr = new StringReader(file.text))
            {
                while (sr.Peek() >= 0)
                {
                    // テキストファイルだと改行が使えないのでここで変換
                    string[] line = sr.ReadLine().Split(new char[] { '=' }, 2);
                    this[line[0]] = line.Length > 1 ? line[1].Replace("\\n", "\n") : string.Empty;
                }
            }
        }

        #endregion

        #region 静的メソッド

        /// <summary>
        /// 指定された言語用のリソースインスタンスをシングルトンで取得する。
        /// </summary>
        /// <param name="language">言語名。</param>
        /// <returns>リソースインスタンス。</returns>
        /// <exception cref="ArgumentException">言語に対応するリソースが存在しない場合。</exception>
        public static Locale GetInstance(string language)
        {
            Locale localeObj;
            lock (locales)
            {
                if (!locales.TryGetValue(language, out localeObj))
                {
                    localeObj = new Locale(language);
                    locales[language] = localeObj;
                }
            }

            return localeObj;
        }

        /// <summary>
        /// デフォルト言語からキーに対応するテキストを取得する。
        /// </summary>
        /// <param name="key">キー。</param>
        /// <returns>対応するテキスト。見つからない場合 <c>key</c> がそのまま返る。</returns>
        /// <exception cref="ArgumentException">デフォルト言語に対応するリソースが存在しない場合。</exception>
        public static string Get(string key)
        {
            InitializeDefaultLanguageIfNeeded();
            Locale locale = GetInstance(DefaultLanguage);
            string value;
            if (locale.TryGetValue(key, out value))
            {
                return value;
            }
            else
            {
                return key;
            }
        }

        /// <summary>
        /// デフォルト言語からキーに対応するテキストを取得し string.Format() する。
        /// </summary>
        /// <param name="key">キー。</param>
        /// <param name="args">書式化するパラメータ。</param>
        /// <returns>対応するテキスト。見つからない場合 <c>key</c> がそのまま返る。</returns>
        /// <exception cref="ArgumentException">デフォルト言語に対応するリソースが存在しない場合。</exception>
        public static string Format(string key, params object[] args)
        {
            return string.Format(Get(key), args);
        }

        /// <summary>
        /// ISOコードの言語指定をUnityのシステム設定の言語と同じ形式に変換する。
        /// </summary>
        /// <param name="code">ISOコード。</param>
        /// <returns>言語文字列。</returns>
        /// <remarks>変換不能な値はそのまま。</remarks>
        public static string IsoToLanguage(string code)
        {
            // ※ 現状英日のみ対応
            switch (code)
            {
                case "en":
                    return "english";
                case "ja":
                    return "japanese";
            }

            return code;
        }

        /// <summary>
        /// デフォルトの言語が未設定の場合設定する。
        /// </summary>
        private static void InitializeDefaultLanguageIfNeeded()
        {
            if (!string.IsNullOrEmpty(DefaultLanguage))
            {
                return;
            }

            DefaultLanguage = Application.systemLanguage.ToString();
            try
            {
                GetInstance(DefaultLanguage);
            }
            catch (ArgumentException)
            {
                DefaultLanguage = "english";
            }
        }

        #endregion
    }
}