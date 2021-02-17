import { IConfig, getConfig } from "./config";
import { GenerateFn, IGenerateResult, ParseFn, BindedParserFn } from "./types";
import * as parsers from './parsers';
import * as generators from './generators';

class Parser {
    /** Configuration parser */
    private config: IConfig;
    /** All parser functions */
    private parsers: Array<BindedParserFn> = [];

    constructor (config?: IConfig) {
        this.config = getConfig(config);
        this.bindParsers();
    }

    bindParsers() {
        this.parsers = [
            Parser.fn(parsers.classes.parseClass, generators.classes.generateClass),
            // Parser.fn()
        ]
    }

    parse(code: string) {
        let index = 0;
        let result = '';

        while (true) {
            const nextMatch = this.nextParse(code, index);
            if (!nextMatch) {
                break;
            }

            // add the last unmatched code:
            result += code.substr(index, nextMatch.index - index);
            // add the matched code:
            result += nextMatch.result;
            // increment the search index:
            index = nextMatch.index + nextMatch.length;
        }

        result += code.substr(index);

        return result;
    }

    /**
     * Binding parse and generate functions
     * @param parse parse fn
     * @param generate generate fn
     */
    static fn(parse: ParseFn, generate: GenerateFn): BindedParserFn {
        return (code: string, config: IConfig): IGenerateResult => {
            const parseResult = parse(code, config);

            if (!parseResult) {
                return null;
            }

            return {
                result: generate(parseResult.data, config),
                index: parseResult.index,
                length: parseResult.length,
            }
        }
    }

    private nextParse(code: string, index: number): IGenerateResult {
        const trimmedCode = code.substr(index);
        let firstMatch: IGenerateResult = null;

        this.parsers.forEach((parser) => {
            const match = parser(trimmedCode, this.config);
    
            if (match && (!firstMatch || match.index < firstMatch.index)) {
                firstMatch = match;
            }
        })
    
        return firstMatch && {
            result: firstMatch.result,
            index: firstMatch.index + index,
            length: firstMatch.length,
        };
    }
}

export default Parser;