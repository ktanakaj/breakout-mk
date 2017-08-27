// ================================================================================================
// <summary>
//      <see cref="Playlog"/>のテストクラスソース</summary>
//
// <copyright file="TestPlaylog.cs">
//      Copyright (C) 2017 Koichi Tanaka. All rights reserved.</copyright>
// <author>
//      Koichi Tanaka</author>
// ================================================================================================

namespace Honememo.BreakoutMk.Models
{
    using UnityEngine;
    using UnityEditor;
    using NUnit.Framework;

    /// <summary>
    /// <see cref="Playlog"/>のテストクラス。
    /// </summary>
    public class TestPlaylog
    {
        /// <summary>
        /// <see cref="Playlog.Hash"/>のテストメソッド。
        /// </summary>
        [Test]
        public void TestHash()
        {
            var playlog = new Playlog();
            playlog.Id = 1;
            playlog.StageId = 2;
            playlog.UserId = 3;
            playlog.Score = 1000;
            playlog.Cleared = true;
            playlog.CreatedAt = "2016-08-07T10:30:10.000Z";
            playlog.UpdatedAt = "2016-08-07T10:31:55.000Z"; 
            Assert.AreEqual("f86cbba6b6284cd08cbd18059b917b7d1b4e8f3c", playlog.Hash("yt7u9rtv095wo6w9;hit6yw9"));

            playlog = new Playlog();
            playlog.Id = 6;
            playlog.StageId = 1;
            playlog.UserId = 1;
            playlog.Score = 400;
            playlog.Cleared = false;
            playlog.CreatedAt = "2016-08-07T11:55:58.000Z";
            playlog.UpdatedAt = "2016-08-07T11:55:58.000Z";
            Assert.AreEqual("5f9485b1efe65bbb239f9c702d9e607545c2a706", playlog.Hash("yt7u9rtv095wo6w9;hit6yw9"));
        }
    }
}