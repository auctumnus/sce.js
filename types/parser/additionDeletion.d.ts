import { Parser } from './parser';
import { Tree } from './node';
export declare const addition: (parser: Parser) => {
    target: Tree;
    change: Tree;
};
export declare const removal: (parser: Parser) => {
    target: Tree;
    change: Tree;
};
