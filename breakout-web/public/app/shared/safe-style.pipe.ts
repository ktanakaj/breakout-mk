/**
 * CSSの埋め込み許可用パイプ。
 * @module app/shared/safe-style.pipe
 */
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import { PipeTransform, Pipe } from "@angular/core";

/**
 * CSSの埋め込み許可用パイプクラス。
 */
@Pipe({ name: 'safeStyle' })
export class SafeStylePipe implements PipeTransform {
	/**
	 * サービスをDIしてコンポーネントを生成する。
	 * @param sanitized DOMサニタイズ処理。
	 */
	constructor(private sanitized: DomSanitizer) { }

	/**
	 * 値が埋め込み可能な文字列であることを明示する。
	 * @param value CSS文字列。
	 * @returns 安全と明示されたCSS文字列。
	 */
	transform(value: string): SafeStyle {
		return this.sanitized.bypassSecurityTrustStyle(value);
	}
}