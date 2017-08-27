// ================================================================================================
// <summary>
//      メッセージを画面通知OKな例外クラスソース</summary>
//
// <copyright file="NotifiableException.cs">
//      Copyright (C) 2017 Koichi Tanaka. All rights reserved.</copyright>
// <author>
//      Koichi Tanaka</author>
// ================================================================================================

namespace Honememo.BreakoutMk.Commons
{
    using System;

    /// <summary>
    /// メッセージを画面通知OKな例外クラス。
    /// </summary>
    /// <remarks>業務例外的なものを扱うクラス。</remarks>
    public class NotifiableException : Exception
    {
        /// <summary>
        /// 指定されたメッセージを持つ例外を生成する。
        /// メッセージはロケールのキーで指定する。
        /// </summary>
        /// <param name="key">例外メッセージキー。</param>
        /// <param name="args">書式化するパラメータ。</param>
        public NotifiableException(string key, params object[] args) : base(Locale.Format(key, args))
        {
            this.Key = key;
        }

        /// <summary>
        /// 例外メッセージキー。
        /// </summary>
        public string Key
        {
            get;
            set;
        }
    }
}
