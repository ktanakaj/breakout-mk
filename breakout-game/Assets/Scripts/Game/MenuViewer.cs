// ================================================================================================
// <summary>
//      メニューの表示処理を行うクラスソース</summary>
//
// <copyright file="MenuViewer.cs">
//      Copyright (C) 2017 Koichi Tanaka. All rights reserved.</copyright>
// <author>
//      Koichi Tanaka</author>
// ================================================================================================

namespace Honememo.BreakoutMk.Game
{
    using System;
    using System.Collections;
    using System.Collections.Generic;
    using UnityEngine;
    using Honememo.BreakoutMk.Commons;
    using Honememo.BreakoutMk.Models;

    /// <summary>
    /// メニューの表示処理を行うクラス。
    /// </summary>
    public class MenuViewer : MonoBehaviour
    {
        #region Public変数

        /// <summary>
        /// ゲーム処理系スクリプトが付いているオブジェクト。
        /// </summary>
        public GameObject gameRootObject;

        /// <summary>
        /// ゲームで使用するメニューアイテムのプレハブ。
        /// </summary>
        public GameObject MenuItemPrefab;

        /// <summary>
        /// 1ページ当たりの表示件数。
        /// </summary>
        public int MaxItems = 5;

        /// <summary>
        /// 現在表示中のページ。
        /// </summary>
        public int Page = 0;

        /// <summary>
        /// 1番目のメニュー要素の位置。
        /// </summary>
        public Vector2 MenuItemInitialPoint;

        /// <summary>
        /// メニュー要素間の縦幅。
        /// </summary>
        public int MenuItemSpan = 60;

        /// <summary>
        /// 前ページボタン。
        /// </summary>
        public GameObject PrevButton;

        /// <summary>
        /// 次ページボタン。
        /// </summary>
        public GameObject NextButton;

        #endregion

        #region Private変数

        /// <summary>
        /// ゲームサーバー。
        /// </summary>
        private BreakoutServer gameServer;

        /// <summary>
        /// 読み込み済みのステージ。
        /// </summary>
        private IList<Stage> stages;

        #endregion

        #region delegate定義

        /// <summary>
        /// メニュー選択時にイベント定義。
        /// </summary>
        /// <param name="stage">選択されたステージ。</param>
        public delegate void MenuSelectedEventHandler(Stage stage);

        /// <summary>
        /// メニュー選択時のイベント。
        /// </summary>
        public event MenuSelectedEventHandler MenuSelected;

        #endregion

        #region Unityイベントメソッド

        /// <summary>
        /// ゲーム開始時に呼ばれる処理。
        /// </summary>
        public void Start()
        {
            // 起動時に参照するコンポーネントを見つけておく
            this.gameServer = this.gameRootObject != null ? this.gameRootObject.GetComponent<BreakoutServer>() : this.GetComponent<BreakoutServer>();
            if (!this.gameServer)
            {
                throw new NotImplementedException("必要なComponentが接続されていません。");
            }

            if (!this.PrevButton || !this.NextButton)
            {
                throw new NotImplementedException("必要なGameObjectが接続されていません。");
            }

            if (!this.MenuItemPrefab)
            {
                throw new NotImplementedException("必要なPrefabが指定されていません。");
            }
        }

        /// <summary>
        /// 前のページを表示。
        /// </summary>
        public void PrevPage()
        {
            this.CreateMenu(this.Page - 1);
        }

        /// <summary>
        /// 次のページを表示。
        /// </summary>
        public void NextPage()
        {
            this.CreateMenu(this.Page + 1);
        }

        /// <summary>
        /// メニューを再読み込み。
        /// </summary>
        public void Reload()
        {
            this.StartCoroutine(this.ReloadCoroutine());
        }

        #endregion

        #region SendMessage用メソッド

        /// <summary>
        /// ゲームの状態に応じてGameObjectを変化させる。
        /// </summary>
        /// <param name="state">新しい状態。</param>
        public void ChangeState(GameState state)
        {
            // メニュー表示中以外の状態になったら自分を無効にする
            // ※ GameController等外部から有効にしないと以後動かないので注意
            if (state != GameState.Menu && state != GameState.Loading)
            {
                this.gameObject.SetActive(false);
            }
        }

        #endregion

        #region Punlicメソッド

        /// <summary>
        /// ステージ情報の読み込み。
        /// </summary>
        /// <returns>子ルーチンの実行状態。</returns>
        public IEnumerator LoadStages()
        {
            // ※ 処理タイミング的にこのクラスのStartイベントが終わる前に呼ばれる場合があるので、
            //    this.gameServerの準備が終わっていなかったら待つ
            while (this.gameServer == null || !this.gameServer.Initialized)
            {
                yield return null;
            }

            yield return this.gameServer.FindStages((s) => { this.stages = s; });
        }

        /// <summary>
        /// メニュー生成。
        /// </summary>
        /// <param name="page">表示するページ。先頭ページが0。</param>
        public void CreateMenu(int page)
        {
            // ページングボタンを一旦有効化
            this.PrevButton.SetActive(true);
            this.NextButton.SetActive(true);

            // 先頭／最終ページの処理
            this.Page = page;
            int maxPage = this.CalcMaxPage();
            if (page >= maxPage - 1)
            {
                this.Page = maxPage - 1;
                this.NextButton.SetActive(false);
            }

            if (page <= 0)
            {
                this.Page = 0;
                this.PrevButton.SetActive(false);
            }

            // 既存のメニュー要素を全て削除
            foreach (Transform child in this.transform)
            {
                if (child.tag == "MenuItem")
                {
                    Destroy(child.gameObject);
                }
            }

            // 新しいメニュー要素を配置
            Vector2 point = this.MenuItemInitialPoint;
            for (int i = this.Page * this.MaxItems; i < (this.Page + 1) * this.MaxItems && i < this.stages.Count; i++)
            {
                this.CreateMenuItem(this.stages[i], point);
                point = new Vector2(point.x, point.y - this.MenuItemSpan);
            }
        }

        #endregion

        #region Privateメソッド

        /// <summary>
        /// メニュー要素を生成する。
        /// </summary>
        /// <param name="stage">要素に割り当てるステージ情報。</param>
        /// <param name="point">要素の座標。</param>
        private void CreateMenuItem(Stage stage, Vector2 point)
        {
            GameObject obj = (GameObject)Instantiate(this.MenuItemPrefab, point, new Quaternion());
            obj.transform.SetParent(this.gameObject.transform, false);
            MenuItemController controller = obj.GetComponent<MenuItemController>();
            controller.Stage = stage;
            controller.OnSubmit += (s) =>
            {
                // イベントチェーン
                if (this.MenuSelected != null)
                {
                    this.MenuSelected(s);
                }
            };
        }

        /// <summary>
        /// メニューの最大ページを計算する。
        /// </summary>
        /// <returns>ページ数。</returns>
        /// <remarks>全2件で1ページ5件の場合1が返る。</remarks>
        private int CalcMaxPage()
        {
            return (int)Math.Ceiling((double)this.stages.Count / this.MaxItems);
        }

        /// <summary>
        /// メニューの再読み込み子ルーチン。
        /// </summary>
        /// <returns>子ルーチンの処理結果。</returns>
        private IEnumerator ReloadCoroutine()
        {
            // ステージを読み込み直し先頭ページへ移動
            yield return this.LoadStages();
            this.CreateMenu(0);
        }

        #endregion
    }
}