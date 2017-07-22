-- サンプル初期データ
use breakout_db;

INSERT INTO `users` (`id`,`name`,`password`,`status`,`comment`,`createdAt`,`updatedAt`) VALUES (1,'admin','6546;0ba5f2e7b4bf1f0f16c260dc347c768b33f9f818020efa7ac5e85c22b30e9d5c','admin','サンプル管理者',NOW(),NOW());

INSERT INTO `blocks` (`key`,`name`,`status`,`hp`,`score`,`xsize`,`ysize`,`color`,`createdAt`,`updatedAt`) VALUES ('B','青ブロック','enable',1,100,2,1,255,NOW(),NOW());
INSERT INTO `blocks` (`key`,`name`,`status`,`hp`,`score`,`xsize`,`ysize`,`color`,`createdAt`,`updatedAt`) VALUES ('G','緑ブロック','enable',1,100,2,1,65280,NOW(),NOW());
INSERT INTO `blocks` (`key`,`name`,`status`,`hp`,`score`,`xsize`,`ysize`,`color`,`createdAt`,`updatedAt`) VALUES ('GOLD','金ブロック','enable',3,1000,2,1,16766720,NOW(),NOW());
INSERT INTO `blocks` (`key`,`name`,`status`,`hp`,`score`,`xsize`,`ysize`,`color`,`createdAt`,`updatedAt`) VALUES ('R','赤ブロック','enable',1,100,2,1,16711680,NOW(),NOW());
INSERT INTO `blocks` (`key`,`name`,`status`,`hp`,`score`,`xsize`,`ysize`,`color`,`createdAt`,`updatedAt`) VALUES ('SILVER','銀ブロック','enable',2,500,2,1,12632256,NOW(),NOW());

INSERT INTO `stageHeaders` (`id`,`userId`,`status`,`createdAt`,`updatedAt`) VALUES (1,1,'public',NOW(),NOW());
INSERT INTO `stageHeaders` (`id`,`userId`,`status`,`createdAt`,`updatedAt`) VALUES (2,1,'public',NOW(),NOW());

INSERT INTO `stages` (`id`,`headerId`,`name`,`status`,`map`,`comment`,`createdAt`,`updatedAt`) VALUES (1,1,'サンプルステージ','latest','[R][R][R][R]  [R][R][R][R]    [R][R][R][R]  [R][R][R][R]\n\n[G][G][G][G]  [G][G][G][G]    [G][G][G][G]  [G][G][G][G]\n\n[B][B][B][B]  [B][B][B][B]    [B][B][B][B]  [B][B][B][B]','3種類のブロックが並んだサンプルステージ。',NOW(),NOW());
INSERT INTO `stages` (`id`,`headerId`,`name`,`status`,`map`,`comment`,`createdAt`,`updatedAt`) VALUES (2,2,'サンプルステージ2','latest','[B][B][B][B]  [GOLD][GOLD][GOLD][GOLD]    [GOLD][GOLD][GOLD][GOLD]  [B][B][B][B]\n\n[SILVER][SILVER][SILVER][SILVER]  [G][G][G][G]    [G][G][G][G]  [SILVER][SILVER][SILVER][SILVER]\n\n\n[R][R][R][R][R][R][R][R][R][R][R][R][R][R][R][R][R][R][R][R]\n[R][R][R][R][R][R][R][R][R][R][R][R][R][R][R][R][R][R][R][R]\n','金ブロックは1000点で3回で撃破。\n銀ブロックは500点で2回で撃破。',NOW(),NOW());
