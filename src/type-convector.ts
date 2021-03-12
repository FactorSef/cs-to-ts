import * as regex from "./regex";
import * as constants from "./constants";
import { IConfig } from "./config";
import {
	CSTypeEnum,
	ExtendsType,
	ITypeModel,
	ITypeCategory,
	IArrayType,
	IParseResultData,
} from "./types";

/**Check if the given type is a simple that that passes as an uri parameter */
export function isUriSimleType(type: ExtendsType) {
	const simple = [
		CSTypeEnum.Boolean,
		CSTypeEnum.Number,
		CSTypeEnum.Date,
		CSTypeEnum.String,
	];

	const isSimple = (_type: CSTypeEnum) => !!~simple.indexOf(_type);

	const catType = getTypeCategory(type);

	if (isSimple(type as CSTypeEnum)) {
		return true;
	} else if (
		catType === CSTypeEnum.Nullable &&
		isSimple(getTypeCategory(type.generics[0]))
	) {
		return true;
	}

	return false;
}

export function getTypeCategory(type: ITypeModel): CSTypeEnum {
	const byteTypeName = ["byte", "Byte", "System.Byte"];

	//Check if the type is byteArray
	if (
		byteTypeName.indexOf(type.name) !== -1 &&
		type.generics.length === 0 &&
		type.array.length === 1 &&
		type.array[0].dimensions === 1
	) {
		return CSTypeEnum.ByteArray;
	}

	const categories: Array<ITypeCategory> = [
		{
			category: CSTypeEnum.Enumerable,
			types: [
				"List",
				"ObservableCollection",
				"Array",
				"IEnumerable",
				"IList",
				"IReadOnlyList",
				"Collection",
				"ICollection",
				"ISet",
				"HashSet",
			],
			genericMin: 0,
			genericMax: 1,
		},
		{
			category: CSTypeEnum.Nullable,
			types: ["Nullable", "System.Nullable"],
			genericMin: 1,
			genericMax: 1,
		},
		{
			category: CSTypeEnum.Dictionary,
			types: ["Dictionary", "IDictionary", "IReadOnlyDictionary"],
			genericMin: 2,
			genericMax: 2,
		},
		{
			category: CSTypeEnum.Boolean,
			types: ["bool", "Boolean", "System.Boolean"],
			genericMin: 0,
			genericMax: 0,
		},
		{
			category: CSTypeEnum.Number,
			types: [
				"int",
				"Int32",
				"System.Int32",
				"float",
				"Single",
				"System.Single",
				"double",
				"Double",
				"System.Double",
				"decimal",
				"Decimal",
				"System.Decimal",
				"long",
				"Int64",
				"System.Int64",
			].concat(byteTypeName, [
				"sbyte",
				"SByte",
				"System.SByte",
				"short",
				"Int16",
				"System.Int16",
				"ushort",
				"UInt16",
				"System.UInt16",
				"ulong",
				"UInt64",
				"System.UInt64",
			]),
			genericMin: 0,
			genericMax: 0,
		},
		{
			category: CSTypeEnum.Date,
			types: [
				"DateTime",
				"System.DateTime",
				"DateTimeOffset",
				"System.DateTimeOffset",
			],
			genericMin: 0,
			genericMax: 0,
		},
		{
			category: CSTypeEnum.String,
			types: ["Guid", "string", "System.String", "String"],
			genericMin: 0,
			genericMax: 0,
		},
		{
			category: CSTypeEnum.Any,
			types: ["object", "System.Object", "dynamic"],
			genericMin: 0,
			genericMax: 0,
		},
		{
			category: CSTypeEnum.Task,
			types: ["Task", "System.Threading.Tasks.Task"],
			genericMin: 0,
			genericMax: 1,
		},
		{
			category: CSTypeEnum.Tuple,
			types: ["Tuple", "System.Tuple"],
			genericMin: 1,
			genericMax: 1000,
		},
	];

	const filterFn = (item: ITypeCategory) =>
		!!~item.types.indexOf(type.name) &&
		type.generics.length >= item.genericMin &&
		type.generics.length <= item.genericMax;

	const cat = categories.filter(filterFn)[0];

	return cat ? cat.category : CSTypeEnum.Other;
}

export function convertToTypescript(type: ITypeModel, config: IConfig): string {
	if (
		config.byteArrayToString &&
		getTypeCategory(type) === CSTypeEnum.ByteArray
	) {
		return "string";
	}

	let arrayStr = "";
	for (let index = 0, arr = type.array; index < arr.length; index++) {
		const arrEl = arr[index];
		arrayStr += "[";
		for (let i = 1; i < arrEl.dimensions; i++) {
			arrayStr += ",";
		}
		arrayStr += "]";
	}

	return convertToTypescriptNoArray(type, config) + arrayStr;
}

function convertToTypescriptNoArray(
	value: ITypeModel,
	config: IConfig
): string {
	const category = getTypeCategory(value);

	switch (category) {
		case CSTypeEnum.Enumerable: {
			if (value.generics.length == 0) {
				return "Array<any>";
			} else if (value.generics.length == 1) {
				const type = convertToTypescript(value.generics[0], config);
				return `Array<${type}>`;
			} else {
				throw "Generics error";
			}
		}
		case CSTypeEnum.Dictionary: {
			const key =
				getTypeCategory(value.generics[0]) === CSTypeEnum.Number
					? "number"
					: "string";
			const type = convertToTypescript(value.generics[1], config);

			return `{ [key: ${key}]: ${type} }`;
		}
		case CSTypeEnum.Nullable: {
			const type = convertToTypescript(value.generics[0], config);

			return `${type} | null`;
		}
		case CSTypeEnum.Tuple: {
			const tupleElements = value.generics.map(
				(item: ITypeModel, i: number) => {
					const type = convertToTypescript(item, config);
					return `Item${i + 1}: ${type}`;
				}
			);

			const elements = tupleElements.reduce(
				(acc, el) => (acc ? `${acc}, ${el}` : el),
				""
			);

			return `{ ${elements} }`;
		}
		case CSTypeEnum.Task: {
			const promLike = (type: string) => `Promise<${type}>`;

			const type = convertToTypescript(value.generics[0], config);

			return !value.generics.length ? promLike("void") : promLike(type);
		}
		case CSTypeEnum.Boolean: {
			return "boolean";
		}
		case CSTypeEnum.Number:
		case CSTypeEnum.ByteArray: {
			return "number";
		}
		case CSTypeEnum.Date: {
			return Array.isArray(config.dateTypes)
				? config.dateTypes.join(" | ")
				: config.dateTypes;
		}
		case CSTypeEnum.String: {
			return "string";
		}
		case CSTypeEnum.Any: {
			return "any";
		}
		case CSTypeEnum.Other: {
			if (value.generics.length) {
				const generics = value.generics
					.map((type) => convertToTypescript(type, config))
					.reduce((acc, el) => (acc ? `${acc}, ${el}` : el), "");

				return `${value.name}<${generics}>`;
			} else {
				return value.name;
			}
		}
	}
}

/**Split on top level by a given separator, separators inside < >, [ ], { } or ( ) groups are not considered
 *
 * @param separator One char separators
 */
export function splitTopLevel(
	text: string,
	separators: Array<string>,
	openGroup = ["[", "(", "<", "{"],
	closeGroup = ["]", ")", ">", "}"]
): Array<string> {
	const result = [];

	let level = 0;
	let current = "";

	text.split("").forEach((char) => {
		if (openGroup.indexOf(char) != -1) {
			level++;
		}
		if (closeGroup.indexOf(char) != -1) {
			level--;
		}
		if (level == 0 && separators.indexOf(char) != -1) {
			result.push(current);
			current = "";
		} else {
			current += char;
		}
	});

	if (current) {
		result.push(current);
	}

	return result;
}

/**Split on top level commas */
function splitCommas(text: string) {
	return splitTopLevel(text, [","]);
}

/**Parse an array definition */
function parseArray(code: string): IArrayType {
	const result = [];

	code.split("").forEach((char) => {
		if (char === "[") {
			result.push({ dimensions: 1 });
		}
		if (char === "," && result.length) {
			result[result.length - 1].dimensions++;
		}
	});

	return result;
}

/**Parse a C# type, returns null if the given type could not be parsed */
export function parseType(code: string): IParseResultData {
	//Remove all spaces:
	code = code.replace(" ", "");

	const pattern = regex.seq(
		regex.cap(constants.identifier),
		constants.spaceOptional,
		regex.optional(/<(.*)>/),
		constants.spaceOptional,
		regex.cap(regex.optional(/\?/)),
		constants.spaceOptional,
		regex.zeroOrMore(regex.cap(/\[[,\[\]]*\]/))
	);

	const match = pattern.exec(code);

	if (!match) {
		return null;
	}

	//Pattern groups:
	const name = match[1];
	const genericsStr = splitCommas(match[2] || "");
	const nullable = match[3] == "?";
	const arrayStr = match[4] || "";
	const array = parseArray(arrayStr);
	const genericsOrNull = genericsStr.map((x) => parseType(x));
	const genericParseError =
		genericsOrNull.filter((x) => x == null).length > 0;

	if (genericParseError) {
		return null;
	}

	const generics = genericsOrNull.map(function (x) {
		return x;
	});

	if (nullable) {
		const underlyingType = { name, generics, array: [] };

		return {
			// TODO: Проверить работу енума
			// name: 'Nullable',
			name: CSTypeEnum.Nullable[CSTypeEnum.Nullable],
			generics: [underlyingType],
			array,
		} as ITypeModel;
	} else {
		return { name, generics, array } as ITypeModel;
	}
}
