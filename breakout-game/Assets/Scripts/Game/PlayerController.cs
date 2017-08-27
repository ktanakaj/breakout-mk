// ================================================================================================
// <summary>
//      プレイヤーの左右移動を扱うクラスソース</summary>
//
// <copyright file="PlayerController.cs">
//      Copyright (C) 2017 Koichi Tanaka. All rights reserved.</copyright>
// <author>
//      Koichi Tanaka</author>
// ================================================================================================

namespace Honememo.BreakoutMk.Game
{
    using System.Collections.Generic;
    using UnityEngine;

    /// <summary>
    /// プレイヤーの左右移動を扱うクラス。
    /// </summary>
    public class PlayerController : MonoBehaviour
    {
        #region Public変数

        /// <summary>
        /// プレイヤーの稼働範囲X方向最大。
        /// </summary>
        public float Xmax = 12;

        /// <summary>
        /// プレイヤーの稼働範囲X方向最小。
        /// </summary>
        public float Xmin = -12;

        /// <summary>
        /// タッチ操作にかける係数値。
        /// </summary>
        public float TouchFactor = 0.1f;

        #endregion

        #region Private変数

        /// <summary>
        /// 操作前のマウス座標。
        /// </summary>
        private Vector3 prevMousePos;

        /// <summary>
        /// 操作前のタッチ座標。
        /// </summary>
        private IDictionary<int, Vector2> prevTouchPos = new Dictionary<int, Vector2>();

        #endregion

        #region Unityイベントメソッド

        /// <summary>
        /// ゲーム開始時に実行される処理。
        /// </summary>
        public void Start()
        {
            // マウス座標を初期化
            this.prevMousePos = Camera.main.ScreenToWorldPoint(Input.mousePosition);
        }

        /// <summary>
        /// 1フレームごとに実行される処理。
        /// </summary>
        public void Update()
        {
            // タッチ・マウスの移動操作（タッチ処理優先）
            if (!this.MoveByTouch())
            {
                this.MoveByMouse();
            }

            // プレイヤーが移動範囲の最大を超えたら戻す
            this.CheckStageOut();
        }

        #endregion

        #region SendMessage用メソッド

        /// <summary>
        /// ゲームの状態に応じてGameObjectを変化させる。
        /// </summary>
        /// <param name="state">新しい状態。</param>
        public void ChangeState(GameState state)
        {
            // ゲーム中以外はオブジェクトを消す。ゲーム中でもミスは消す
            if (!state.IsGaming() || state == GameState.Miss)
            {
                Destroy(this.gameObject);
            }
        }

        #endregion

        #region Privateメソッド

        /// <summary>
        /// マウスドラッグによる移動操作。
        /// </summary>
        private void MoveByMouse()
        {
            Vector3 mousePos = Camera.main.ScreenToWorldPoint(Input.mousePosition);
            Rigidbody2D rigidBody2D = this.transform.root.GetComponent<Rigidbody2D>();

            if (Input.GetMouseButton(0))
            {
                // マウスの移動分だけ速度与える
                // Y方向は無視する
                Vector2 diff = mousePos - this.prevMousePos;
                diff.y = 0;
                rigidBody2D.velocity = diff / Time.deltaTime;
            }
            else
            {
                // マウスが動かされていないときは停止させる
                rigidBody2D.velocity = Vector2.zero;
            }

            this.prevMousePos = mousePos;
        }

        /// <summary>
        /// タッチによる移動操作。
        /// </summary>
        /// <returns>タッチがあった場合true。</returns>
        private bool MoveByTouch()
        {
            bool touched = false;
            foreach (var touch in Input.touches)
            {
                // タッチの移動分だけ速度与える
                Vector2 prevPos;
                if (this.prevTouchPos.TryGetValue(touch.fingerId, out prevPos))
                {
                    // Y方向は無視する
                    // ※ deltaPositionだとうまく動かなかった？ので手動で差分を取る
                    Vector2 diff = touch.position - prevPos;
                    diff.y = 0;
                    Rigidbody2D rigidBody2D = this.transform.root.GetComponent<Rigidbody2D>();
                    rigidBody2D.velocity = diff / Time.deltaTime * this.TouchFactor;
                }

                // 現在の位置を記録
                this.prevTouchPos[touch.fingerId] = touch.position;

                // タッチが終わったら現在位置を消す
                if (touch.phase == TouchPhase.Ended || touch.phase == TouchPhase.Canceled)
                {
                    this.prevTouchPos.Remove(touch.fingerId);
                }

                touched = true;
            }

            return touched;
        }

        /// <summary>
        /// プレイヤーがステージ外に出ていないかチェックする。
        /// </summary>
        private void CheckStageOut()
        {
            // バーの端が移動可能範囲外に出ている場合、ぎりぎりの位置に戻す
            float half = this.transform.localScale.x / 2;
            if (this.transform.position.x - half < this.Xmin)
            {
                this.transform.position = new Vector2(this.Xmin + half, this.transform.position.y);
            }
            else if (this.transform.position.x + half > this.Xmax)
            {
                this.transform.position = new Vector2(this.Xmax - half, this.transform.position.y);
            }
        }

        #endregion
    }
}