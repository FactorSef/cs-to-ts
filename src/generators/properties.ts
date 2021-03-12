import { IConfig } from "../config";
import { IParseResultData } from "../types";
import { generateType, getTypescriptPropertyName } from "./helpers";

/**Generate a typescript property */
export function generateProperty(
	prop: IParseResultData,
	config: IConfig
): string {
	//trim spaces:
	const tsType = generateType(prop.type, config);
	const name = getTypescriptPropertyName(prop.name, config);
	const printInitializer = !config.ignoreInitializer && !!prop.initializer;
	const removeNameRegex =
		config.removeNameRegex !== "" &&
		new RegExp(config.removeNameRegex).test(name);
	const removeModifier =
		config.removeWithModifier.indexOf(prop.modifier) != -1;
	const removeProp = removeNameRegex || removeModifier;
	const modifier = prop.modifier; // Convert C# modifiers to TS modifiers

	if (removeProp) {
		return "";
	}

	return (
		(config.preserveModifiers ? `${modifier} ` : "") +
		(printInitializer
			? `${name}: ${tsType} = ${prop.initializer};`
			: `${name}: ${tsType};`)
	);
}
