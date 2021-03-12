import { IConfig } from "../config";
import { IParseResultData } from "../types";
import { generateType } from "./helpers";

export function generateClass(
	model: IParseResultData,
	config: IConfig
): string {
	const inheritsTypes = model.inherits
		.map((type) => generateType(type, config))
		.join(", ");
	const name = model.name;
	const modifier = model.isPublic ? "export" : "";
	const keyword = config.classToInterface ? "interface" : "class";
	const className = `${modifier} ${keyword} ${name}`;

	if (inheritsTypes.length > 0) {
		return `${className} extends ${inheritsTypes}`;
	} else {
		return className;
	}
}
