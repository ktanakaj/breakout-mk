// ================================================================================================
// <summary>
//      文字列処理用のユーティリティクラスソース</summary>
//
// <copyright file="StringUtils.cs">
//      Copyright (C) 2017 Koichi Tanaka. All rights reserved.</copyright>
// <author>
//      Koichi Tanaka</author>
// ================================================================================================

namespace Honememo.BreakoutMk.Commons
{
    using System;
    using System.Collections.Generic;
    using System.Security.Cryptography;
    using System.Text;

    /// <summary>
    /// 文字列処理用のユーティリティクラス。
    /// </summary>
    public static class StringUtils
    {
        #region ハッシュ関係メソッド

        /// <summary>
        /// SHA1ハッシュを計算する。
        /// </summary>
        /// <param name="data">計算に使用するデータ。</param>
        /// <returns>計算したハッシュ文字列。</returns>
        public static string Sha1(ICollection<object> data)
        {
            SHA1 hashGenerator = SHA1Managed.Create();
            List<byte> bytes = new List<byte>();
            foreach (var val in data)
            {
                bytes.AddRange(Encoding.UTF8.GetBytes(val.ToString()));
            }

            return BitConverter.ToString(hashGenerator.ComputeHash(bytes.ToArray())).Replace("-", string.Empty).ToLower();
        }

        #endregion
    }
}