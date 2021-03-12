import { IParseResult, ParseFn } from "./types";

export function parseRegex(
	text: string,
	regex: string | RegExp,
	parse: (match: any) => any
): IParseResult {
	const result = new RegExp(regex, "g").exec(text);

	if (result) {
		return {
			index: result.index,
			length: result[0].length,
			data: parse(result.map((x) => x)),
		};
	}

	return null;
}

export function firstMatch(
	code: string,
	parsers: Array<ParseFn>
): IParseResult {
	let firstMatch = null;

	parsers.forEach((func) => {
		const match = func(code, null);

		if (match && (!firstMatch || match.index < firstMatch.index)) {
			firstMatch = match;
		}
	});

	return firstMatch;
}

export function subStrMatch(match: IParseResult, index: number): IParseResult {
	return {
		...match,
		index: match.index + index,
	};
}

export function allMatches(code: string, parser: ParseFn): Array<IParseResult> {
	let index = 0;
	const mathes: Array<IParseResult> = [];

	while (true) {
		const subStr = code.substr(index);
		const matchOrNull = parser(subStr, null);

		if (!matchOrNull) {
			break;
		}

		const nextMatch = subStrMatch(matchOrNull, index);

		mathes.push(
			// Add the last unmatched code:
			{
				data: undefined,
				index,
				length: nextMatch.index - index,
			},
			// Add the matched code:
			nextMatch
		);

		// Increment the search index:
		index = nextMatch.index + nextMatch.length;
	}

	// Add the last unmatched code:
	mathes.push({
		data: undefined,
		index,
		length: code.length - index,
	});

	// Filter empty unmatched code:
	return mathes.filter((x) => !(!x.data && x.length === 0));
}
