import { seq, optional, any, cap, commas } from '../regex';
import { IParseResult } from '../types';
import { splitTopLevel } from '../type-convector';
import { identifier, type, spaceOrLine } from '../constants';

function parseInherits(code: string): Array<string> {
    const types = splitTopLevel(code, [',']);

    return types;
}

export function parseClass(code: string): IParseResult {
    const modifier = optional(seq(optional(any(seq(cap(/public/), /\s+/), /private\s+/, /protected\s+/, /internal\s+/)), optional(/\s+sealed\s+/), optional(/\s+abstract\s+/)));
    const classType = cap(any(/class\s+/, /interface\s+/, /struct\s+/));
    const className = cap(identifier);
    const separator = seq(/,/, optional(spaceOrLine));
    const inherits = optional(seq(/\s+:\s/, cap(commas(type, separator))));
    const classRegex = seq(modifier, classType, className, inherits);
    const match = classRegex.exec(code);

    if (!match) {
        return null;
    }

    return {
        index: match.index,
        length: match[0].length,
        data: {
            isPublic: match[1] === 'public',
            type: match[2],
            name: match[3],
            inherits: parseInherits(match[4] || '')
        }
    };
}
