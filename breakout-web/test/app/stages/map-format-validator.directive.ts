﻿/**
 * @file validate-map-format.tsのテスト。
 */
import * as assert from 'power-assert';
import { StageService } from '../../../public/app/stages/stage.service';
import { MapFormatValidator } from '../../../public/app/stages/map-format-validator.directive';
const directive = new MapFormatValidator(new StageService(null));

describe('map-format-validator', () => {
	describe('#validate()', () => {
		it.skip('should check map data', () => {
			// TODO: Angular 2+以降のソースに対応する
			// let scope = {};
			// scope.$watch = (func) => { scope._watch = func; };
			// let attrs = { validateMapFormat: "{}" };
			// let ctrl = { $asyncValidators: {} };
			// ctrl.$isEmpty = (v) => !v;

			// // linkメソッド自体はバリデータを登録するだけ
			// directive.link(scope, {}, attrs, ctrl);
			// assert(typeof ctrl.$asyncValidators.validateMapFormat === "function");
		});
	});
});