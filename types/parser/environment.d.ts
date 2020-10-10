import { Parser } from './parser';
import { Tree } from './node';
import { ClauseContentFunctionMap } from './clauseContent';
export declare const environmentConfig: ClauseContentFunctionMap;
export declare const environment: (parser: Parser) => Tree;
export declare const exception: (parser: Parser) => Tree;
