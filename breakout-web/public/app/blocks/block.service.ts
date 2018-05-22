/**
 * ゲームのブロック関連サービスモジュール。
 * @module ./app/blocks/block.service
 */
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { throwErrorByResponse } from '../core/http-error';
import { Block } from './block.model';

/** 通信失敗時のリトライ回数。 */
const MAX_RETRY = 3;

/**
 * ゲームのブロック関連サービスクラス。
 */
@Injectable()
export class BlockService {
	/**
	 * モジュールをDIしてコンポーネントを生成する。
	 * @param http HTTPモジュール。
	 */
	constructor(private http: HttpClient) { }

	/**
	 * 全ブロックの参照。
	 * @returns 検索結果。
	 */
	findAll(): Promise<Block[]> {
		return this.http.get<Block[]>('/api/blocks')
			.retry(MAX_RETRY)
			.toPromise()
			.then((blocks) => {
				blocks.forEach((b) => {
					b.color = BlockService.hexColor(<any>b.color);
				});
				return blocks;
			})
			.catch(throwErrorByResponse);
	}

	/**
	 * 指定されたキーのブロックの検索。
	 * @param key 検索するキー。
	 * @returns 検索結果。
	 */
	findById(key: string): Promise<Block> {
		return this.http.get<Block>('/api/blocks/' + key)
			.retry(MAX_RETRY)
			.toPromise()
			.then((block) => {
				block.color = BlockService.hexColor(<any>block.color);
				return block;
			})
			.catch(throwErrorByResponse);
	}

	/**
	 * 渡されたブロック情報の登録／上書き。
	 * @param block 保存するブロック情報。
	 * @returns 登録結果。
	 * @throws 登録失敗、または通信エラーの場合。
	 */
	save(block: Block): Promise<Block> {
		// 日時がない場合は新規
		block.color = BlockService.decColor(String(block.color));
		let observable;
		if (block.createdAt === undefined) {
			observable = this.http.post('/api/blocks/', block);
		} else {
			observable = this.http.put('/api/blocks/' + block.key, block);
		}
		return observable
			.toPromise()
			.catch(throwErrorByResponse);
	}

	/**
	 * 10進数の色情報を16進数の形に変換する。
	 * @param dec 10進数の色情報。
	 * @returns #00FF00 のような文字列。
	 */
	private static hexColor(dec: number): string {
		return "#" + ("000000" + dec.toString(16)).slice(-6);
	}

	/**
	 * 16進数の色情報を10進数の形に変換する。
	 * @param hexStr #00FF00 のような文字列。数値のみの場合変換しない。
	 * @returns 10進数の色情報。
	 */
	private static decColor(hexStr: string): number {
		if (Number.isInteger(<any>hexStr)) {
			return Number(hexStr);
		}
		return parseInt(hexStr.slice(1), 16);
	}
}
