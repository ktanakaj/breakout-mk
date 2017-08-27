// ================================================================================================
// <summary>
//      ゲームの現在の状態を表す列挙値ソース</summary>
//
// <copyright file="GameState.cs">
//      Copyright (C) 2017 Koichi Tanaka. All rights reserved.</copyright>
// <author>
//      Koichi Tanaka</author>
// ================================================================================================

/// <summary>
/// ゲームの現在の状態を表す列挙値。
/// </summary>
public enum GameState
{
    /// <summary>
    /// アプリ初期化中。
    /// </summary>
    Initializing,

    /// <summary>
    /// アプリ読込中。
    /// </summary>
    Loading,

    /// <summary>
    /// アプリ表示リセット。
    /// </summary>
    Reset,

    /// <summary>
    /// メニュー表示中。
    /// </summary>
    Menu,

    /// <summary>
    /// ゲーム開始。
    /// </summary>
    Start,

    /// <summary>
    /// ゲーム中。
    /// </summary>
    Playing,

    /// <summary>
    /// ゲームでのミス。
    /// </summary>
    Miss,

    /// <summary>
    /// ゲームのリトライ。
    /// </summary>
    Retry,

    /// <summary>
    /// ゲームクリア。
    /// </summary>
    Clear,

    /// <summary>
    /// ゲームオーバー。
    /// </summary>
    GameOver,
}

/// <summary>
/// GameStateに処理を追加する拡張クラス。
/// </summary>
static class GameStateExtension
{
    /// <summary>
    /// ゲーム中の状態か？
    /// </summary>
    /// <param name="self">判定する状態。</param>
    /// <returns>ゲーム中の場合true。</returns>
    public static bool IsGaming(this GameState self)
    {
        switch (self)
        {
            case GameState.Start:
            case GameState.Playing:
            case GameState.Miss:
            case GameState.Retry:
            case GameState.Clear:
            case GameState.GameOver:
                return true;
        }

        return false;
    }
}
