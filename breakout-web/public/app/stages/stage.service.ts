/**
 * ゲームのステージ関連サービスモジュール。
 * @module ./app/stages/stage.service
 */
import { Injectable } from '@angular/core';
import { Http, URLSearchParams } from '@angular/http';
import { ResponseError } from '../core/response-error';
import { Block } from '../blocks/block.model';
import { Stage, StageComment, StageFavorite, StageRating, StageWithInfo } from './stage.model';

/** 通信失敗時のリトライ回数。 */
const MAX_RETRY = 3;

/**
 * ゲームのステージ関連サービスクラス。
 */
@Injectable()
export class StageService {
	/**
	 * モジュールをDIしてコンポーネントを生成する。
	 * @param http HTTPモジュール。
	 */
	constructor(private http: Http) { }

	/**
	 * ユーザーがプレイ可能なステージの検索。
	 * @returns 検索結果。
	 */
	findAll(): Promise<Stage[]> {
		return this.http.get('/api/stages')
			.retry(MAX_RETRY)
			.toPromise()
			.then((res) => res.json())
			.catch(ResponseError.throwError);
	}

	/**
	 * 指定されたステージIDのステージの検索。ユーザーが参照可能なもののみ。
	 * @param id 検索するステージID。
	 * @returns 検索結果。
	 */
	findById(id: number): Promise<Stage> {
		return this.http.get('/api/stages/' + id)
			.retry(MAX_RETRY)
			.toPromise()
			.then((res) => res.json())
			.catch(ResponseError.throwError);
	}

	/**
	 * 指定されたステージIDのステージの検索。ユーザーが参照可能なもののみ。
	 * @param id 検索するステージID。
	 * @returns 検索結果。
	 */
	findByIdWithAllInfo(id: number): Promise<StageWithInfo> {
		// ※ 関連情報も一緒に取得
		const params = new URLSearchParams();
		params.set('fields', 'all');
		return this.http.get('/api/stages/' + id, { search: params })
			.retry(MAX_RETRY)
			.toPromise()
			.then((res) => res.json())
			.catch(ResponseError.throwError);
	}

	/**
	 * 渡されたステージ情報の登録／上書き。
	 * @param stage 保存するステージ情報。
	 * @returns 登録結果。
	 */
	save(stage: Stage): Promise<Stage> {
		// IDがない場合は新規
		let observable;
		if (stage.id == undefined) {
			observable = this.http.post('/api/stages/', stage)
		} else {
			observable = this.http.put('/api/stages/' + stage.id, stage)
		}
		return observable
			.toPromise()
			.then((res) => res.json())
			.catch(ResponseError.throwError);
	}

	/**
	 * 指定されたステージIDのデータの削除。
	 * @param id 削除するステージID。
	 * @returns 削除結果。
	 */
	deleteById(id: number): Promise<Stage> {
		return this.http.delete("/api/stages/" + id)
			.toPromise()
			.then((res) => res.json())
			.catch(ResponseError.throwError);
	}

	/**
	 * 指定されたユーザーが作成したステージの検索。
	 * @param userId ユーザーID。
	 * @returns 検索結果。
	 */
	findByUser(userId: number): Promise<Stage[]> {
		return this.http.get('/api/users/' + userId + '/stages')
			.retry(MAX_RETRY)
			.toPromise()
			.then((res) => res.json())
			.catch(ResponseError.throwError);
	}

	/**
	 * 自分が作成したステージの検索。
	 * @returns 検索結果。
	 */
	findByMe(): Promise<Stage[]> {
		return this.http.get('/api/users/me/stages')
			.retry(MAX_RETRY)
			.toPromise()
			.then((res) => res.json())
			.catch(ResponseError.throwError);
	}

	/**
	 * 自分がお気に入りしたステージの検索。
	 * @returns 検索結果。
	 */
	findFavoriteByMe(): Promise<Stage[]> {
		return this.http.get('/api/users/me/favorites')
			.retry(MAX_RETRY)
			.toPromise()
			.then((res) => res.json())
			.catch(ResponseError.throwError);
	}

	/**
	 * 最新ステージ一覧の検索。
	 * @returns 検索結果。
	 */
	findLatest(): Promise<Stage[]> {
		return this.http.get('/api/stages/latest')
			.retry(MAX_RETRY)
			.toPromise()
			.then((res) => res.json())
			.catch(ResponseError.throwError);
	}

	/**
	 * 渡されたステージコメントの投稿／上書き。
	 * @param stageId コメントと関連するステージID。
	 * @param comment 保存するステージコメント。
	 * @returns 登録データ。
	 */
	saveComment(stageId: number, comment: StageComment): Promise<StageComment> {
		// IDがない場合は新規
		let observable;
		if (comment.id == undefined) {
			observable = this.http.post("/api/stages/" + stageId + "/comments", comment);
		} else {
			observable = this.http.put("/api/stages/" + stageId + "/comments/" + comment.id, comment);
		}
		return observable
			.toPromise()
			.then((res) => res.json())
			.catch(ResponseError.throwError);
	}

	/**
	 * 指定されたステージコメントIDのデータの削除。
	 * @param stageId コメントと関連するステージID。
	 * @param commentId 削除するステージコメントID。
	 * @returns 削除結果。
	 */
	deleteCommentById(stageId: number, commentId: number): Promise<StageComment> {
		return this.http.delete("/api/stages/" + stageId + "/comments/" + commentId)
			.toPromise()
			.then((res) => res.json())
			.catch(ResponseError.throwError);
	}

	/**
	 * 指定されたステージのレーティングの登録。
	 * @param stageId 評価するステージID。
	 * @param rating レーティング。
	 * @returns 更新結果。
	 */
	rate(stageId: number, rating: number): Promise<StageRating> {
		return this.http.post("/api/stages/" + stageId + "/rating", { rating })
			.toPromise()
			.then((res) => res.json())
			.catch(ResponseError.throwError);
	}

	/**
	 * 指定されたステージのお気に入り登録。
	 * @param stageId 登録するステージID。
	 * @returns 更新結果。
	 */
	addFavorite(stageId: number): Promise<StageFavorite> {
		return this.http.post("/api/stages/" + stageId + "/favorite", {})
			.toPromise()
			.then((res) => res.json())
			.catch(ResponseError.throwError);
	}

	/**
	 * 指定されたステージのお気に入り削除。
	 * @param stageId 削除するステージID。
	 * @returns 削除結果。
	 */
	removeFavorite(stageId: number): Promise<StageFavorite> {
		return this.http.delete("/api/stages/" + stageId + "/favorite")
			.toPromise()
			.then((res) => res.json())
			.catch(ResponseError.throwError);
	}

	/**
	 * マップデータ文字列を縦×横の二次元コマンド文字列配列に変換する。
	 * @param map マップデータ文字列。
	 * @returns マップの二次元コマンド配列。
	 */
	mapStrToTable(map: string): string[][] {
		// ステージのマップを正規表現で解析し、その構文からマップを展開する
		// 現状 "[key]" と " " と "\n" のみを処理する。それ以外の文字は無視（誤記が多いので一部対応）
		let table = [];
		let row = [];
		const regex = /(\[.*?\]|\{.*?\}|<.*?>|[\s\n])/g;
		let match;
		while ((match = regex.exec(map)) !== null) {
			let command = match[0];
			if (command == "\n") {
				// 改行は、次のラインに切り替え
				table.push(row);
				row = [];
			} else if (command == " ") {
				// 空白の場合、1要素スキップ
				row.push(null);
			} else {
				// それ以外はコマンドなのでそのまま記録
				row.push(command);
			}
		}
		table.push(row);
		return table;
	}

	/**
	 * マップデータの二次元配列に、マップデータ文字列の内容を反映する。
	 * @param mapData マップデータ二次元配列。
	 * @param mapStr マップデータ文字列。
	 * @param blockMap ブロック情報連想配列。
	 */
	updateMapData(mapData: Block[][], mapStr: string, blockMap: Object): void {
		// 二次元配列のうち、ブロック要素をマスタに変換して上書きする
		// またブロック要素がサイズを持つ場合、その幅分も詰める
		// ※ 配列自体を作り直してしまうと、画面表示のコストが大きいので、差分を上書きする
		// ※ 配列が削られた場合に備え、長いほう分の処理を行う
		const regex = /\[(.*?)\]/;
		let table = this.mapStrToTable(mapStr);
		for (let y = 0; y < table.length || y < mapData.length; y++) {
			let row = table[y] || [];
			if (!mapData[y]) {
				mapData[y] = [];
			}
			for (let i = 0, x = 0; i < row.length || x < mapData[y].length; i++ , x++) {
				let command = row[i];
				if (!command) {
					mapData[y][x] = null;
					continue;
				}
				// ブロック生成コマンドを解析
				let match;
				if ((match = regex.exec(command)) === null) {
					console.log("不明なコマンドです (\"" + command + "\")");
					mapData[y][x] = null;
					continue;
				}
				let key = match[1];
				let block = blockMap[key];
				if (!block) {
					console.log("key=\"" + key + "\" はブロック情報に存在しません");
					mapData[y][x] = null;
					continue;
				}
				// ブロックマスタを割り当て。サイズを持つ場合は、その分の位置にも詰める
				// ※ 現状X方向のみ対応
				mapData[y][x] = block;
				for (let j = 1; j < block.xsize; j++) {
					mapData[y][++x] = block;
				}
			}
		}
	}
}