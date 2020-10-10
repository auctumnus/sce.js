import { Tokens } from '../scanner';
import { Tree, Nodes } from './node';
import { Parser } from './parser';
/**
 * Will be called by the clause content parser.
 * @typedef {Function} ClauseContentFunction
 * @param {Parser} parser The parser to use.
 * @param {Tree} pattern The current pattern for the clause content.
 * @param {Number|String} content The content of the token returned by parser.peek().
 * @param {Number} type The type of the token returned by parser.peek().
 * @param {Number} line The line of the token returned by parser.peek().
 */
export interface ClauseContentFunction {
    (parser: Parser, pattern?: Tree, content?: string | number, type?: Tokens, line?: number): any;
}
export declare type ClauseContentFunctionMap = Partial<Record<Tokens, ClauseContentFunction>>;
/**
 * Helper for parsing clause content. Allows you to pass in an object of tokens
 * to functions, which will be called whenever the parser encounters that type of token.
 * @param {Parser} parser The parser to provide to each function.
 * @param {Number} treeType The node type to set for the tree.
 * @param {String} errorMessage The text to report if none of the accepted tokens are found immediately.
 * @param {Object} tokenToFunction An object mapping token types to functions to run.
 * @param {Boolean} allowOptional Whether to allow optional sequences.
 * @param {Boolean} isInOptional Whether the parser is currently in an optional sequence. You should generally not set this yourself.
 */
export declare const clauseContent: (parser: Parser, treeType: Nodes, errorMessage: string, tokenToFunction: ClauseContentFunctionMap, allowOptional?: boolean) => Tree;
