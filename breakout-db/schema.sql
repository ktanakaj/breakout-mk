-- DB作成
CREATE DATABASE breakout_db CHARACTER SET utf8;

-- Webアプリ接続用ユーザー情報
GRANT ALL PRIVILEGES ON breakout_db.* TO breakout_usr@'localhost' IDENTIFIED BY 'breakout001';

-- 開発用ユーザー情報
--GRANT ALL PRIVILEGES ON breakout_db.* TO breakout_usr IDENTIFIED BY 'breakout001';

-- 権限更新
FLUSH PRIVILEGES;
