import { IConfig } from "../config";
import {
	parseType as parseTypeFn,
	convertToTypescript,
} from "../type-convector";
import { IParseResultData } from "../types";

export function generateType(type: string, config: IConfig): string {
	const typeModel = parseTypeFn(type);
	const parsedType = typeModel
		? convertToTypescript(typeModel, config)
		: type;

	return trimMemberName(parsedType, config);
}

export function generateParam(value: IParseResultData, config: IConfig) {
	const tsType = generateType(value.type, config);
	return value.name + ": " + tsType;
}

export function generateControllerBody(
	name: string,
	params: Array<IParseResultData>
) {
	function isUriSimpleType(x: IParseResultData): IParseResultData {
		const parseType = parseTypeFn(x.type);
		return parseType && isUriSimpleType(parseType);
	}
	const simpleParams = params
		.filter(isUriSimpleType)
		.map(({ name }) => name)
		.join(", ");

	const bodyParams = params
		.filter((x) => !isUriSimpleType(x))
		.map(({ name }) => name)
		.join(", ");

	if (bodyParams.length == 0) {
		return ` => await controller('${name}', {${simpleParams}}), `;
	} else {
		return ` => await controller('${name}', {${simpleParams}}, ${bodyParams}), `;
	}
}

export function getTypescriptPropertyName(name: string, config: IConfig) {
	const isAbbreviation = name.toUpperCase() === name;

	name = trimMemberName(name, config);

	if (config.propertiesToCamelCase && !isAbbreviation) {
		return name[0] + name.substr(1);
	}

	return name;
}

export function trimMemberName(name: string, config: IConfig) {
	name = name.trim();

	const postfixes = Array.isArray(config.trimPostfixes)
		? config.trimPostfixes
		: [config.trimPostfixes];

	if (!postfixes) {
		return name;
	}

	let trimmed = true;

	do {
		trimmed = false;

		for (var index = 0; index < postfixes.length; index++) {
			const postfix = postfixes[index];
			if (!name.endsWith(postfix)) continue;

			name = trimEnd(name, postfix);

			if (!config.recursiveTrimPostfixes) return name;

			trimmed = true;
		}
	} while (trimmed); // trim recursive until no more occurrences will be found

	return name;
}

export function trimEnd(text: string, postfix: string) {
	if (text.endsWith(postfix)) {
		return text.substr(0, text.length - postfix.length);
	}
	return text;
}
