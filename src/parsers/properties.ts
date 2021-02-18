import { optional, seq, commas, cap, any } from '../regex';
import { identifier, space, spaceOptional, type, spaceOrLineOptional } from '../constants';
import { IParseResult } from '../types';

export function parseProperty(code: string): IParseResult {
    const propAttributes = optional(seq(commas(seq(/\[/, identifier, /.*/, /\]/), spaceOrLineOptional), spaceOrLineOptional));
    const propModifier = optional(seq(cap(seq(optional(any(/public/, /private/, /protected/, /internal/)), optional(any(/\s+new/, /\s+override/)))), /\s*/));
    const propName = seq(cap(identifier), spaceOptional);

    //Regex que captura el get set con initializador o el fat arrow
    const getSetOrFatArrow = (function () {
        const getSetModifier = optional(any(/internal/, /public/, /private/, /protected/));
        const get = seq(getSetModifier, spaceOptional, /get\s*;/);
        const set = seq(getSetModifier, spaceOptional, /set\s*;/);
        const initializer = optional(seq(spaceOptional, /=/, spaceOptional, cap(/.*/), /;/));
        const getSet = seq(/{/, spaceOptional, get, spaceOptional, optional(set), spaceOptional, /}/, initializer);
        const fatArrow = /=>.*;/;

        return any(getSet, fatArrow);
    })();

    const member = (function () {
        const initializer = optional(seq(spaceOptional, /=/, spaceOptional, cap(/.*/)));
        const ending = /;/;

        return seq(initializer, ending);
    })();

    //Regex que captura a toda la propiedad:
    const prop = seq(propAttributes, propModifier, seq(cap(type), space), propName, cap(any(getSetOrFatArrow, member)));
    const match = prop.exec(code);
    
    if (!match) {
        return null;
    }

    const isProperty = getSetOrFatArrow.test(match[4]);
    const isMember = !isProperty;
    return {
        index: match.index,
        length: match[0].length,
        data: {
            modifier: match[1],
            type: match[2],
            name: match[3],
            initializer: isMember ? match[6] : match[5],
            isField: isMember,
        }
    }
}
