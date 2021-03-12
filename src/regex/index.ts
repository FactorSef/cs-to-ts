/**
 * Return a regex that matches any of the given components
 * @param components
 */
export function any(...components: RegExp[]): RegExp {
	const sources = components.map((item) => nonCap(item).source);
	const sourceComb = sources.join("|");
	const combined = "".concat("(?:", sourceComb, ")");
	return new RegExp(combined);
}

/**
 * Concat regexes
 * @param components
 */
export function seq(...components: RegExp[]): RegExp {
	return nonCap(new RegExp(components.map((x) => x.source).join("")));
}

/**
 * Enclose a regex on a non capturing group
 * @param component
 */
export function nonCap(component: RegExp): RegExp {
	return new RegExp("".concat("(?:", component.source, ")"));
}

/**
 * Enclose a regex on an optional non capturing group
 * @param component
 */
export function cap(component: RegExp): RegExp {
	return new RegExp("".concat("(", component.source, ")"));
}

/**
 * Enclose a regex on an optional non capturing group
 * @param component
 */
export function optional(component: RegExp): RegExp {
	return new RegExp(nonCap(component).source.concat("?"));
}

/**
 * Enclose a regex on a zero or more repetition non capturing group
 * @param component
 */
export function zeroOrMore(component: RegExp): RegExp {
	return new RegExp(nonCap(component).source.concat("*"));
}

/**
 * Enclose a regex on a one or more repetition non capturing group
 * @param component
 */
export function oneOrMore(component: RegExp): RegExp {
	return new RegExp(nonCap(component).source.concat("+"));
}

/**
 * Return a regex that parses a list of items separated with the given separator.
 * For capturing also an empty list enclose the commas regex on an optional regex
 * @param item
 * @param separator
 */
export function commas(item: RegExp, separator: RegExp) {
	return seq(nonCap(item), zeroOrMore(seq(separator, item)));
}

/**
 * Create a regex that matches the given string
 */
export function str(str: string): RegExp {
	return new RegExp(escapeRegExp(str));
}

export function escapeRegExp(str: string): string {
	return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
}

/**
 * Create an array with a range of numbers
 */
export function range(start: number, count: number, step = 1): number[] {
	const end = start + count * step;
	const result = [];

	for (let i = start; i < end; i += step) {
		result.push(i);
	}

	return result;
}
/**
 * Return a regex that parses a neasted expression
 * @param allowZeroDepth True to generate a regex that matches any text without the enclosing characters, false to make required at least one pair of enclosing characters
 */
export function neasted(
	start: string,
	end: string,
	maxDepth = 0,
	allowZeroDepth?: boolean
): RegExp {
	if (start.length != 1)
		throw new Error("start should be a single character");
	if (end.length != 1) throw new Error("end should be a single character");

	start = escapeRegExp(start);
	end = escapeRegExp(end);

	const bodyCharSource = "[^" + start + end + "]";
	const bodyChar = new RegExp(bodyCharSource);
	const zeroDepth = nonCap(oneOrMore(bodyChar));
	const repeat = (s: string, n: number) =>
		range(0, n)
			.map(() => s)
			.join("");
	const nDepth = (n: number) =>
		n === 0
			? zeroDepth
			: nonCap(
					new RegExp(
						repeat(start + bodyCharSource + "*", n - 1) +
							start +
							bodyCharSource +
							"*" +
							end +
							repeat(bodyCharSource + "*" + end, n - 1)
					)
			  );

	const minDepth = allowZeroDepth ? 0 : 1;
	const allDepths = range(minDepth, maxDepth + 1 - minDepth).map(nDepth);

	return any.apply(void 0, allDepths);
}
