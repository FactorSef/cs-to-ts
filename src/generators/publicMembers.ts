import { IConfig } from "../config";
import { IGenerateResult } from "../types";
import { trimMemberName } from './helpers';

export function generatePublicMember(code: string, config: IConfig): IGenerateResult {
    const pattern = /public\s*(?:(?:abstract)|(?:sealed))?(\S*)\s+(.*)\s*{/;
    const match = pattern.exec(code);
    const tsMembers = {
        'class': 'interface',
        'struct': 'interface'
    }

    if (!match) {
        return null;
    }

    const [text, member, memberName] = match;
    const tsMember = tsMembers[member];
    const name = trimMemberName(memberName, config);

    return {
        result: `export ${tsMember || member} ${name} {`,
        index: match.index,
        length: text.length
    };
}