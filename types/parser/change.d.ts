import { Parser } from './parser';
import { Tree } from './node';
import { ClauseContentFunctionMap } from './clauseContent';
export declare const changeConfig: ClauseContentFunctionMap;
export declare const change: (parser: Parser) => Tree;
