import { IParseResultData, IParseResultDataItem, ParseDataTypeEnum } from '../types';

export function generateSimpleJsDoc(indent: string, content: string): string {
    return indent + "/**" + content + " */";
}

/**
 * Generate a JS Doc
 * @param value
 */
export function generateJsDoc(value: IParseResultData): string {
    const { items } = value;
    
    const isSimpleComment: IParseResultDataItem = (function () {
        if (items.length == 3) {
            const isSummaryStart = (x: IParseResultDataItem) => x.type === ParseDataTypeEnum.start && x.tag === "summary";
            const isSummaryEnd = (x: IParseResultDataItem) => x.type === ParseDataTypeEnum.end && x.tag === "summary";
            
            const [start, content, end] = items;

            if (isSummaryStart(start) && isSummaryEnd(end) && content.type === ParseDataTypeEnum.docStart) {
                return {
                    simple: true,
                    indent: start.space,
                    content: content.content
                };
            }
            
            return null
        }
    })();

    if (isSimpleComment) {
        return generateSimpleJsDoc(isSimpleComment.indent, isSimpleComment.content);
    }

    if (items.length == 0)
        return "";

    const text = items.map((item: IParseResultDataItem, index) => {
        const startChar = !index ? "/**" : " * ";

        switch (item.type) {
            case ParseDataTypeEnum.start:
            case ParseDataTypeEnum.selfClosing: {
                var char = item.space != null ? startChar : "";
                var begin = "" + (item.space || "") + char;
                if (item.tag === "summary") {
                    return begin;
                }
                else {
                    return begin + "@" + item.tag + " " + item.attributes.map(function (x) { return x.value; }).join('') + " ";
                }
            }
            case ParseDataTypeEnum.end:
                return "";
            case ParseDataTypeEnum.docStart:
                return "" + item.space + startChar + item.content;
            case ParseDataTypeEnum.emptyNode:
                return "";
            case ParseDataTypeEnum.content:
                return item.text;
            default:
                return item;
        }
    });
    const withSpaces = items.filter(function (x) { return x && x.space != null; }).map(function (x) { return x.space; });
    const lastSpace = withSpaces[withSpaces.length - 1] || " ";
    return text.join("") + lastSpace + " */";
}