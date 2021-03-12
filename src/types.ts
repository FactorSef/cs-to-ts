import { IConfig } from "./config";

export enum CSTypeEnum {
	/**A type that can be represented as a collection of items */
	Enumerable,
	/**A dictionary is equivalent to a typescript object */
	Dictionary,
	/**A c$# nullable type where the value type is the first generic type */
	Nullable,
	/**A c# tuple */
	Tuple,
	/**A boolean type */
	Boolean,
	/**A numeric type */
	Number,
	/**A 1-dimension byte array */
	ByteArray,
	/**A date type */
	Date,
	/**A string type */
	String,
	/**Any type */
	Any,
	/**Unidentified type */
	Other,
	/**Task/promise task */
	Task,
}

export type IArrayType = Array<{ dimensions: number }>;

export interface ITypeModel {
	name?: string;
	generics?: Array<ExtendsType>;
	array?: IArrayType;
}

export interface ITypeCategory {
	category?: CSTypeEnum;
	types?: Array<string>;
	genericMin?: number;
	genericMax?: number;
}

export type ExtendsType = CSTypeEnum & ITypeCategory & ITypeModel;

export type ParseFn = (code: string, config: IConfig) => IParseResult;
export type GenerateFn = (data: IParseResultData, config: IConfig) => string;
export type BindedParserFn = (
	code: string,
	config?: IConfig
) => IGenerateResult;

export interface IParseResult {
	index: number;
	length: number;
	data: IParseResultData;
}

export interface IParseResultData {
	isPublic?: boolean;
	name?: string;
	inherits?: Array<string>;
	items?: Array<IParseResultDataItem>;
	type?: string;
	modifier?: string;
	initializer?: string;
	isField?: boolean;
	parameters?: Array<IParseResultData>;
	body?: string;
	async?: boolean;
	returnType?: string;
}

export interface IParseResultDataItem {
	simple?: boolean;
	indent?: string;
	space?: string;
	type?: ParseDataTypeEnum;
	content?: string;
	tag?: string;
	attributes?: Array<IParseResultDataItemAttr>;
	text?: string;
}

/**
 * @deprecated
 */
export interface IParseResultDataParam {
	type: string;
	name: string;
}

export interface IParseResultDataItemAttr {
	name?: string;
	value?: string;
}

export enum ParseDataTypeEnum {
	docStart = "docStart",
	docEnd = "docEnd",
	selfClosing = "selfClosing",
	param = "param",
	emptyNode = "emptyNode",
	content = "content",
	start = "start",
	end = "end",
}

export interface IGenerateResult {
	result: string;
	index: number;
	length: number;
}
