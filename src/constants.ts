import { zeroOrMore, seq, nonCap, optional } from "./regex";

export const identifier = /[a-zA-Z\u00C0-\u00FF_][a-zA-Z\u00C0-\u00FF_0-9]*/;
export const space = /\s+/;
export const spaceOrLine = /(?:\s|\n|\r)+/;
export const spaceOrLineOptional = /(?:\s|\n|\r)*/;
export const spaceOptional = /\s*/;
export const anyChar = /(?:.|\n|\r)/;
export const spaceNotLine = /[ \t]/;
export const lineJump = /(?:\r|\n|(?:\r\n)|(?:\n\r))/;

export const attr = /[ \t]*\[\S*\][ \t]*\r?\n/;
export const publicMember = /public\s*(?:(?:abstract)|(?:sealed))?(\S*)\s+(.*)\s*{/;

export const type = (function (): RegExp {
	const arrayDimension = zeroOrMore(/\[,*\]/);
	const generic = /<[a-zA-Z\u00C0-\u00FF_0-9,.<>? \t\n\r\[\]]*>/;

	return seq(
		nonCap(identifier),
		spaceOptional,
		optional(generic),
		spaceOptional,
		optional(/\?/),
		arrayDimension
	);
})();

export function allMatches(text: string, pattern: string | RegExp) {
	const reg = new RegExp(pattern, "g");
	const matches = [];

	let match: RegExpExecArray;
	while ((match = reg.exec(text))) {
		matches.push(match);
	}

	return matches;
}
