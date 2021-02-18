import { IConfig } from "../config";
import { IParseResultData } from "../types";
import { generateControllerBody, generateParam, generateType } from './helpers';

export function generateConstructor(value: IParseResultData, config: IConfig): string {
    const paramList = value.parameters
        .map((param) => generateParam(param, config))
        .join(", ");

    return config.removeConstructors ? "" : `new(${paramList}): ${value.name};`;
}

export function generateMethod(value: IParseResultData, config: IConfig) {
    const paramList = value.parameters
        .map((param) => generateParam(param, config))
        .join(", ");
    const returnType = generateType(value.returnType, config);
    const fullType = `(${paramList}): ${returnType}`;
    const lambdaBody = `${value.name}: ${value.async ? 'async ' : ''}${fullType}`;

    switch (config.methodStyle) {
        case 'signature':
            return `${value.name}${fullType};`;
        case 'lambda':
            return `${lambdaBody} => { throw new Error(); }, `;
        case 'controller':
            return `${lambdaBody}${generateControllerBody(value.name, value.parameters)}`;
        default:
            return 'unknown';
    }
}