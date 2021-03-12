import { IConfig } from "../config";
import { IGenerateResult } from "../types";

export function generateAttr(code: string, config: IConfig): IGenerateResult {
	const pattern = /[ \t]*\[\S*\][ \t]*\r?\n/;
	const match = pattern.exec(code);

	if (!match) {
		return null;
	}
	return {
		result: "",
		index: match.index,
		length: match[0].length,
	};
}
