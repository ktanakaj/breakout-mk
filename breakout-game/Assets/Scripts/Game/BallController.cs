// ================================================================================================
// <summary>
//      ボールの動作を扱うクラスソース</summary>
//
// <copyright file="BallController.cs">
//      Copyright (C) 2017 Koichi Tanaka. All rights reserved.</copyright>
// <author>
//      Koichi Tanaka</author>
// ================================================================================================

namespace Honememo.BreakoutMk.Game
{
    using System;
    using UnityEngine;

    /// <summary>
    /// ボールの動作を扱うクラス。
    /// </summary>
    public class BallController : MonoBehaviour
    {
        #region Public変数

        /// <summary>
        /// ゲームステータススクリプトが付いているオブジェクト名。
        /// </summary>
        public string GameStatusObject;

        /// <summary>
        /// ボールのゲーム開始時の速度。
        /// </summary>
        public Vector2 InitialVector = Vector2.down;

        /// <summary>
        /// ボールが消えるY座標。
        /// </summary>
        public int DeadLine = 0;

        /// <summary>
        /// スピードアップ処理を動かす点数。
        /// </summary>
        public int SpeedUpScore = 1000;

        /// <summary>
        /// 所定の点数を獲得するごとに加算される速度。
        /// </summary>
        public float SpeedUpMagnitude = 1.0f;

        #endregion

        #region Private定数

        /// <summary>
        /// ボールの角度変更で許容する最大のsin(θ)。
        /// </summary>
        private const float MaxSinTheta = 0.99f;

        /// <summary>
        /// ボールがハマってしまった場合の加算速度。
        /// </summary>
        private const float AdjustingSpeed = 1f;

        #endregion

        #region Private変数

        /// <summary>
        /// ゲーム情報。
        /// </summary>
        private GameStatus gameStatus;

        /// <summary>
        /// 直前のボールの速度。
        /// </summary>
        private float prevMagnitude = 0;

        #endregion

        #region Unityイベントメソッド

        /// <summary>
        /// ゲーム開始時に呼ばれる処理。
        /// </summary>
        public void Start()
        {
            // 起動時に参照するコンポーネントを見つけておく
            GameObject obj = !string.IsNullOrEmpty(this.GameStatusObject) ? GameObject.Find(this.GameStatusObject) : null;
            this.gameStatus = obj ? obj.GetComponent<GameStatus>() : this.GetComponent<GameStatus>();
            if (!this.gameStatus)
            {
                throw new NotImplementedException("必要なComponentが接続されていません。");
            }
        }

        /// <summary>
        /// フレームごとに呼ばれる処理。
        /// </summary>
        public void Update()
        {
            // ボールが画面外に消えたら消す
            if (this.transform.position.y <= this.DeadLine)
            {
                Destroy(this.gameObject);
                return;
            }

            // 前フレームの速度と比較して、不自然に加速している場合戻す
            // ※ 衝突判定のために物理エンジンを有効にした結果、
            //    意図しない加速が加わる不具合が起きているため、
            //    無理やり上書きすることで対処する。
            Rigidbody2D rigidbody = this.GetComponent<Rigidbody2D>();
            float magnitude = rigidbody.velocity.magnitude;
            if (magnitude > this.prevMagnitude + this.SpeedUpMagnitude * 2 || magnitude < this.prevMagnitude)
            {
                Debug.Log("異常な速度変化を検知: " + magnitude + " -> " + this.prevMagnitude);
                rigidbody.velocity = rigidbody.velocity.normalized * this.prevMagnitude;
            }
            else
            {
                this.prevMagnitude = magnitude;
            }

            // ボールが真横に移動して落ちてこなくなることがあるので、
            // ボールの角度が一定値を下回る場合、上下に加速
            if (rigidbody.velocity.x / this.prevMagnitude > MaxSinTheta)
            {
                // Debug.Log("ボールのハマりを検知: " + rigidbody.velocity);
                rigidbody.velocity = new Vector2(rigidbody.velocity.x, (rigidbody.velocity.y > 0 ? 1 : -1) * AdjustingSpeed);
            }
        }

        /// <summary>
        /// ボールの衝突イベント。
        /// </summary>
        /// <param name="coll">衝突情報。</param>
        public void OnCollisionEnter2D(Collision2D coll)
        {
            if (coll.gameObject.CompareTag("Block"))
            {
                // ブロック命中でスコア加算、スピードアップも
                this.AddScoreWithSppedUp(coll.gameObject.GetComponent<BlockController>().Hit());
            }
            else if (coll.gameObject.CompareTag("Player"))
            {
                // プレイヤーのバーとぶつかった場合、向きを変える
                this.TurnByPlayerCollision(coll);
            }
        }

        #endregion

        #region SendMessage用メソッド

        /// <summary>
        /// ボールを強制的に止める。
        /// </summary>
        public void ForceStop()
        {
            Rigidbody2D rigidbody = this.GetComponent<Rigidbody2D>();
            rigidbody.velocity = Vector2.zero;
            rigidbody.angularVelocity = 0;
            this.prevMagnitude = 0;
        }

        /// <summary>
        /// ゲームの状態に応じてGameObjectを変化させる。
        /// </summary>
        /// <param name="state">新しい状態。</param>
        public void ChangeState(GameState state)
        {
            if (!state.IsGaming())
            {
                // ゲーム中以外はオブジェクトを消す
                Destroy(this.gameObject);
            }
            else if (state == GameState.Playing)
            {
                // プレイ中になったら動き出す
                this.GetComponent<Rigidbody2D>().velocity = this.InitialVector;
                this.prevMagnitude = this.InitialVector.magnitude;
            }
            else if (state == GameState.Clear)
            {
                // クリアになったら停止
                this.ForceStop();
            }
        }

        #endregion

        #region Privateメソッド

        /// <summary>
        /// プレイヤーとの衝突による進行方向の変更。
        /// </summary>
        /// <param name="coll">衝突情報。</param>
        private void TurnByPlayerCollision(Collision2D coll)
        {
            // 対象オブジェクトの中心から離れているほど向きを変更する
            Rigidbody2D rigidbody = this.GetComponent<Rigidbody2D>();
            foreach (ContactPoint2D hit in coll.contacts)
            {
                // ContactPoint2Dにはぶつかった際の絶対座標が入るようなので、
                // それとプレイヤーの現在座標から、バー全長の何割の位置にぶつかったかを求める
                float x = (hit.point.x - coll.transform.position.x) / (coll.transform.localScale.x / 2.0f);

                // xをsin(θ)に見立てて処理。が設定ミスで範囲を超えることがあるので無理やり調整
                x = x < -MaxSinTheta ? -MaxSinTheta : x > MaxSinTheta ? MaxSinTheta : x;
                double s = Math.Asin(x);

                // 角度に応じて向きを変更
                rigidbody.velocity = new Vector2(rigidbody.velocity.magnitude * x, (float)(rigidbody.velocity.magnitude * Math.Cos(s)));
            }
        }

        /// <summary>
        /// スコア加算とそれによるスピードアップを行う。
        /// </summary>
        /// <param name="score">加算するスコア。</param>
        private void AddScoreWithSppedUp(int score)
        {
            // スコアを加算する
            int initial = this.gameStatus.Score;
            this.gameStatus.Score += score;

            // 基準点を超えるごとにスピードアップ
            if (this.SpeedUpScore <= 0 || this.SpeedUpMagnitude <= 0)
            {
                return;
            }

            Rigidbody2D rigidbody = this.GetComponent<Rigidbody2D>();
            for (int i = this.gameStatus.Score / this.SpeedUpScore - initial / this.SpeedUpScore; i > 0; i--)
            {
                rigidbody.velocity = rigidbody.velocity * ((rigidbody.velocity.magnitude + this.SpeedUpMagnitude) / rigidbody.velocity.magnitude);
            }
        }

        #endregion
    }
}