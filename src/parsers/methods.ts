import { seq, cap, optional, commas, any, neasted } from '../regex';
import { type, identifier, spaceOrLineOptional, spaceOrLine, allMatches } from '../constants';
import { IConfig } from '../config';
import { IParseResult, IParseResultData, IParseResultDataParam } from '../types';

export function parseParameters(code: string): Array<IParseResultDataParam> {
    const param = seq(cap(type), spaceOrLine, cap(identifier), optional(spaceOrLine))

    const matches = allMatches(code, param);

    return matches.map((match: RegExpMatchArray) => {
        return ({
            type: match[1],
            name: match[2],
        });
    });
}

function castParsers(config: IConfig) {
    const modifier = cap(optional(seq(any(/public/, /private/, /protected/), spaceOrLine)));
    const async = cap(optional(seq(/async/, spaceOrLine)));
    const parameter = seq(type, spaceOrLine, identifier, optional(spaceOrLine));
    const paramSeparator = seq(/,/, optional(spaceOrLine));
    const paramList = seq(/\(/, cap(optional(commas(parameter, paramSeparator))), /\)/);
    const methodType = seq(cap(type), spaceOrLine);
    const methodName = seq(cap(identifier), optional(spaceOrLine));

    const body = seq(spaceOrLineOptional, cap(neasted("{", "}", config.maxBodyDepth, false)));
    const method = seq(modifier, async, methodType, methodName, paramList, body);
    const constructorCall = optional(seq(spaceOrLineOptional, /:/, spaceOrLineOptional, any(/base/, /this/), spaceOrLineOptional, neasted("(", ")", config.maxExpressionDepth, false)));
    const constructor = seq(modifier, methodName, paramList, constructorCall, body);
    return { parseMethodRegex: method, parseConstructorRegex: constructor };
}

export function parseConstructor(code: string, config: IConfig): IParseResult {
    const { parseConstructorRegex } = castParsers(config);

    const match = parseConstructorRegex.exec(code);

    if (!match) {
        return null;
    }

    return {
        index: match.index,
        length: match[0].length,
        data: {
            modifier: match[1],
            name: match[2],
            parameters: parseParameters(match[3]),
            body: match[4],
        }
    };
}

export function parseMethod(code: string, config: IConfig): IParseResult {
    const { parseMethodRegex } = castParsers(config);
    //Regex captures:
    //modifier
    //async
    //type
    //name
    //paramList
    //body
    var match: RegExpExecArray = parseMethodRegex.exec(code);

    if (!match) {
        return null;
    }

    return {
        index: match.index,
        length: match[0].length,
        data: {
            modifier: match[1],
            async: !!match[2],
            returnType: match[3],
            name: match[4],
            parameters: parseParameters(match[5]),
            body: match[6]
        }
    };
}
