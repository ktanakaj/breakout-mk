/**
 * ゲームのステージ関連サービスモジュール。
 * @module ./app/stages/stage.service
 */
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Block } from '../blocks/block.model';
import { Stage, StageComment, StageFavorite, StageRating, StageWithInfo } from './stage.model';

/**
 * ゲームのステージ関連サービスクラス。
 */
@Injectable()
export class StageService {
	/**
	 * モジュールをDIしてコンポーネントを生成する。
	 * @param http HTTPモジュール。
	 */
	constructor(private http: HttpClient) { }

	/**
	 * ユーザーがプレイ可能なステージの検索。
	 * @returns 検索結果。
	 */
	findAll(): Promise<Stage[]> {
		return this.http.get<Stage[]>('/api/stages')
			.retry(environment.maxRetry)
			.toPromise();
	}

	/**
	 * 指定されたステージIDのステージの検索。ユーザーが参照可能なもののみ。
	 * @param id 検索するステージID。
	 * @returns 検索結果。
	 */
	findById(id: number): Promise<Stage> {
		return this.http.get<Stage>('/api/stages/' + id)
			.retry(environment.maxRetry)
			.toPromise();
	}

	/**
	 * 指定されたステージIDのステージの検索。ユーザーが参照可能なもののみ。
	 * @param id 検索するステージID。
	 * @returns 検索結果。
	 */
	findByIdWithAllInfo(id: number): Promise<StageWithInfo> {
		// ※ 関連情報も一緒に取得
		const params = new HttpParams()
			.set('fields', 'all');
		return this.http.get<StageWithInfo>('/api/stages/' + id, { params })
			.retry(environment.maxRetry)
			.toPromise();
	}

	/**
	 * 渡されたステージ情報の登録／上書き。
	 * @param stage 保存するステージ情報。
	 * @returns 登録結果。
	 * @throws 権限がない、または通信エラーの場合。
	 */
	save(stage: Stage): Promise<Stage> {
		// IDがない場合は新規
		let observable;
		if (stage.id === undefined) {
			observable = this.http.post<Stage>('/api/stages/', stage);
		} else {
			observable = this.http.put<Stage>('/api/stages/' + stage.id, stage);
		}
		return observable.toPromise();
	}

	/**
	 * 指定されたステージIDのデータの削除。
	 * @param id 削除するステージID。
	 * @returns 削除結果。
	 * @throws 権限がない、または通信エラーの場合。
	 */
	deleteById(id: number): Promise<Stage> {
		return this.http.delete<Stage>("/api/stages/" + id)
			.toPromise();
	}

	/**
	 * 指定されたユーザーが作成したステージの検索。
	 * @param userId ユーザーID。
	 * @returns 検索結果。
	 */
	findByUser(userId: number): Promise<Stage[]> {
		return this.http.get<Stage[]>('/api/users/' + userId + '/stages')
			.retry(environment.maxRetry)
			.toPromise();
	}

	/**
	 * 自分が作成したステージの検索。
	 * @returns 検索結果。
	 * @throws 未認証、または通信エラーの場合。
	 */
	findByMe(): Promise<Stage[]> {
		return this.http.get<Stage[]>('/api/users/me/stages')
			.toPromise();
	}

	/**
	 * 自分がお気に入りしたステージの検索。
	 * @returns 検索結果。
	 * @throws 未認証、または通信エラーの場合。
	 */
	findFavoriteByMe(): Promise<Stage[]> {
		return this.http.get<Stage[]>('/api/users/me/favorites')
			.toPromise();
	}

	/**
	 * 最新ステージ一覧の検索。
	 * @returns 検索結果。
	 */
	findLatest(): Promise<Stage[]> {
		return this.http.get<Stage[]>('/api/stages/latest')
			.retry(environment.maxRetry)
			.toPromise();
	}

	/**
	 * 渡されたステージコメントの投稿／上書き。
	 * @param stageId コメントと関連するステージID。
	 * @param comment 保存するステージコメント。
	 * @returns 登録データ。
	 * @throws 権限がない、または通信エラーの場合。
	 */
	saveComment(stageId: number, comment: StageComment): Promise<StageComment> {
		// IDがない場合は新規
		let observable;
		if (comment.id === undefined) {
			observable = this.http.post<StageComment>("/api/stages/" + stageId + "/comments", comment);
		} else {
			observable = this.http.put<StageComment>("/api/stages/" + stageId + "/comments/" + comment.id, comment);
		}
		return observable.toPromise();
	}

	/**
	 * 指定されたステージコメントIDのデータの削除。
	 * @param stageId コメントと関連するステージID。
	 * @param commentId 削除するステージコメントID。
	 * @returns 削除結果。
	 * @throws 権限がない、または通信エラーの場合。
	 */
	deleteCommentById(stageId: number, commentId: number): Promise<StageComment> {
		return this.http.delete<StageComment>("/api/stages/" + stageId + "/comments/" + commentId)
			.toPromise();
	}

	/**
	 * 指定されたステージのレーティングの登録。
	 * @param stageId 評価するステージID。
	 * @param rating レーティング。
	 * @returns 更新結果。
	 * @throws 権限がない、または通信エラーの場合。
	 */
	rate(stageId: number, rating: number): Promise<StageRating> {
		return this.http.post<StageRating>("/api/stages/" + stageId + "/rating", { rating })
			.toPromise();
	}

	/**
	 * 指定されたステージのお気に入り登録。
	 * @param stageId 登録するステージID。
	 * @returns 更新結果。
	 * @throws 権限がない、または通信エラーの場合。
	 */
	addFavorite(stageId: number): Promise<StageFavorite> {
		return this.http.post<StageFavorite>("/api/stages/" + stageId + "/favorite", {})
			.toPromise();
	}

	/**
	 * 指定されたステージのお気に入り削除。
	 * @param stageId 削除するステージID。
	 * @returns 削除結果。
	 * @throws 権限がない、または通信エラーの場合。
	 */
	removeFavorite(stageId: number): Promise<StageFavorite> {
		return this.http.delete<StageFavorite>("/api/stages/" + stageId + "/favorite")
			.toPromise();
	}

	/**
	 * マップデータ文字列を縦×横の二次元コマンド文字列配列に変換する。
	 * @param map マップデータ文字列。
	 * @returns マップの二次元コマンド配列。
	 */
	mapStrToTable(map: string): string[][] {
		// ステージのマップを正規表現で解析し、その構文からマップを展開する
		// 現状 "[key]" と " " と "\n" のみを処理する。それ以外の文字は無視（誤記が多いので一部対応）
		const table = [];
		let row = [];
		const regex = /(\[.*?\]|\{.*?\}|<.*?>|[\s\n])/g;
		let match;
		while ((match = regex.exec(map)) !== null) {
			const command = match[0];
			if (command === "\n") {
				// 改行は、次のラインに切り替え
				table.push(row);
				row = [];
			} else if (command === " ") {
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
		const table = this.mapStrToTable(mapStr);
		for (let y = 0; y < table.length || y < mapData.length; y++) {
			const row = table[y] || [];
			if (!mapData[y]) {
				mapData[y] = [];
			}
			for (let i = 0, x = 0; i < row.length || x < mapData[y].length; i++ , x++) {
				const command = row[i];
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
				const key = match[1];
				const block = blockMap[key];
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
