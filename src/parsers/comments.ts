import { str, seq, zeroOrMore, cap, optional } from '../regex';
import { lineJump, identifier, spaceOptional } from '../constants';
import { firstMatch, allMatches, parseRegex } from '../common';
import { IParseResult, IParseResultData, IParseResultDataItem, ParseDataTypeEnum } from '../types';

/**Parse a C# XML Doc */
export function parseXmlDocBlock(code: string) {
    const summaryBlockPatt: RegExp = (function () {
        const comment = str("///");
        const line = seq(comment, /.*/);
        const _lineJump = seq(lineJump, /\s*/);
        const firstLine = seq(/[ \t]*/, line);
        const nextLine = seq(_lineJump, line);
        const block = seq(firstLine, zeroOrMore(nextLine));
        return block;
    })();

    const parseNodeTag = (function () {
        const parsers = [
            parseEmptyNode,
            parseNodeStart,
            parseSelfClosingNode,
            parseNodeEnd,
            parseDocStart
        ];
        return function (code: string) { return firstMatch(code, parsers); };
    })();

    function parseXml (code: string) { return allMatches(code, parseNodeTag); };

    function toXmlContent (code: string, regexData: IParseResult): IParseResultDataItem {
        return {
            space: undefined,
            text: code.substr(regexData.index, regexData.length),
            type: ParseDataTypeEnum.content,
        };
    };

    function getItems (match: RegExpMatchArray) {
        return ({
            items: parseXml(match[1]).map(x => x.data ? x.data : toXmlContent(match[1], x)),
        }) as IParseResultData;
    }

    return parseRegex(code, cap(summaryBlockPatt), getItems);
}

function attribRegex(captureGroups: boolean) {
    var capFunc = captureGroups ? cap : (x: RegExp) => x;
    var body = /[^"]*/;
    return seq(spaceOptional, capFunc(identifier), spaceOptional, str("="), spaceOptional, str("\""), capFunc(body), str("\""));
};

function parseAttribute(code: string) {
    const attrib = attribRegex(true);
    
    function matchFn(match: RegExpMatchArray) {
        return ({
            name: match[1],
            value: match[2],
        })
    }
    
    return parseRegex(code, attrib, matchFn);
}

function parseAttributes(code: string) {
    return allMatches(code, parseAttribute)
        .filter((x) => x.data != undefined)
        .map((x) => x.data);
}

/**Matches the beginning of a comment line and captures the sequence of spaces before this one, including the line break if there is one */
const commentLineBegin = seq(cap(seq(optional(lineJump), spaceOptional)), str("///"), spaceOptional);

function parseParams() {
    const attrib = attribRegex(false);
    const attribs = zeroOrMore(attrib);
    const nodeStart = (nodeEnd: string) => seq(optional(commentLineBegin), str("<"), cap(identifier), cap(attribs), spaceOptional, str(nodeEnd));
    const parseNode = (type: ParseDataTypeEnum, nodeEnd: string) =>
        (code: string) =>
            parseRegex(code, nodeStart(nodeEnd), ([,space, tag, attrs]) => ({ space, tag, attributes: parseAttributes(attrs), type }));

    return {
        parseNodeStart: parseNode(ParseDataTypeEnum.start, ">"),
        parseSelfClosingNode: parseNode(ParseDataTypeEnum.selfClosing, "/>")
    };
}

const { parseNodeStart, parseSelfClosingNode } = parseParams()

function parseNodeEnd(code: string) {
    const nodeEnd = seq(optional(commentLineBegin), str("</"), cap(identifier), spaceOptional, str(">"));
    return parseRegex(code, nodeEnd, ([, space, tag]) => ({ space, tag, type: ParseDataTypeEnum.end }));
}

function parseEmptyNode(code: string) {
    const emptyBegin = seq(str("<"), cap(identifier), spaceOptional, str(">"));
    const emptyEnd = seq(str("</"), identifier, spaceOptional, str(">"));
    const patt = seq(optional(commentLineBegin), emptyBegin, spaceOptional, emptyEnd);
    return parseRegex(code, patt, ([, space, tag]) => ({ space, tag, type: ParseDataTypeEnum.emptyNode }));
}
function parseDocStart(code: string) {
    const patt = seq(commentLineBegin, cap(zeroOrMore(/[^<\n\r]/)));
    return parseRegex(code, patt, ([, space, content]) => ({ space, content, type: ParseDataTypeEnum.docStart }));
}

