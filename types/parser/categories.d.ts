import { Parser } from './parser';
import { Tree, Node } from './node';
export declare const categoryRef: (parser: Parser) => Node;
export declare const categoryModification: (parser: Parser) => Tree;
export declare const categoryDef: (parser: Parser) => Tree;
export declare const temporaryCategory: (parser: Parser) => Tree;
