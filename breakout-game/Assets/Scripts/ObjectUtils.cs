// ================================================================================================
// <summary>
//      オブジェクト処理用のユーティリティクラスソース</summary>
//
// <copyright file="ObjectUtils.cs">
//      Copyright (C) 2017 Koichi Tanaka. All rights reserved.</copyright>
// <author>
//      Koichi Tanaka</author>
// ================================================================================================

namespace Honememo.BreakoutMk.Commons
{
    using System.Collections.Generic;
    using System.Reflection;
    using System.Text;

    /// <summary>
    /// オブジェクト処理用のユーティリティクラス。
    /// </summary>
    public static class ObjectUtils
    {
        #region ToString関連メソッド

        /// <summary>
        /// リフレクションを用いてプロパティ等を出力する<see cref="Object.ToString"/>を生成する。
        /// </summary>
        /// <param name="obj">出力するオブジェクト。</param>
        /// <returns>ToString()した文字列。</returns>
        public static string ReflectionToString(object obj)
        {
            if (obj == null)
            {
                return string.Empty;
            }

            List<string> list = new List<string>();
            foreach (FieldInfo fi in obj.GetType().GetFields())
            {
                list.Add(string.Format("{0}={1}", fi.Name, fi.GetValue(obj)));
            }

            foreach (PropertyInfo pi in obj.GetType().GetProperties())
            {
                list.Add(string.Format("{0}={1}", pi.Name, pi.GetValue(obj, null)));
            }

            StringBuilder sb = new StringBuilder(obj.GetType().Name);
            sb.Append(string.Format(": [{0}]", string.Join(",", list.ToArray())));
            return sb.ToString();
        }

        #endregion
    }
}