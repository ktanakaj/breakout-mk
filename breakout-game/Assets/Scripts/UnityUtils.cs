// ================================================================================================
// <summary>
//      Unity用のユーティリティクラスソース</summary>
//
// <copyright file="UnityUtils.cs">
//      Copyright (C) 2017 Koichi Tanaka. All rights reserved.</copyright>
// <author>
//      Koichi Tanaka</author>
// ================================================================================================

namespace Honememo.BreakoutMk.Commons
{
    using UnityEngine;
    using UnityEngine.UI;

    /// <summary>
    /// Unity用のユーティリティクラス。
    /// </summary>
    public static class UnityUtils
    {
        #region 表示制御メソッド

        /// <summary>
        /// GameObjectの表示/非表示をRendererで設定する。
        /// </summary>
        /// <param name="obj">設定するオブジェクト。</param>
        /// <param name="visible">表示する場合true、非表示にする場合false。</param>
        public static void SetVisibleToRenderer(GameObject obj, bool visible)
        {
            Renderer r;
            if (obj && (r = obj.GetComponent<Renderer>()))
            {
                r.enabled = visible;
            }
            else
            {
                Debug.Log("Rendererを持たないGameObjectが指定されました:" + obj);
            }
        }

        /// <summary>
        /// GameObjectの表示/非表示をRendererで設定する。
        /// </summary>
        /// <param name="component">設定するオブジェクトに付くコンポーネント。</param>
        /// <param name="visible">表示する場合true、非表示にする場合false。</param>
        public static void SetVisibleToRenderer(Component component, bool visible)
        {
            UnityUtils.SetVisibleToRenderer(component.gameObject, visible);
        }

        /// <summary>
        /// GameObjectの表示/非表示をImageで設定する。
        /// </summary>
        /// <param name="obj">設定するオブジェクト。</param>
        /// <param name="visible">表示する場合true、非表示にする場合false。</param>
        public static void SetVisibleToImage(GameObject obj, bool visible)
        {
            Image r;
            if (obj && (r = obj.GetComponent<Image>()))
            {
                r.enabled = visible;
            }
            else
            {
                Debug.Log("Imageを持たないGameObjectが指定されました:" + obj);
            }
        }

        /// <summary>
        /// GameObjectの表示/非表示をImageで設定する。
        /// </summary>
        /// <param name="component">設定するオブジェクトに付くコンポーネント。</param>
        /// <param name="visible">表示する場合true、非表示にする場合false。</param>
        public static void SetVisibleToImage(Component component, bool visible)
        {
            UnityUtils.SetVisibleToImage(component.gameObject, visible);
        }

        #endregion
    }
}