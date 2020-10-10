/// <reference types="node" />
import { Tokens, Token } from '../scanner';
import { Tree } from './node';
interface ParserLogger {
    (ParserError: any): any;
}
/**
 * The parser parses tokens from the scanner and turns them into an AST (Abstract Syntax Tree).
 * @typedef {Object} Parser
 * @property {Token[]} tokens The tokens to be parsed.
 * @property {Logger} logger The function to be called when an error occurs. The logger will receive an object with the line it occurred at and a message describing the error.
 */
export declare class Parser {
    tokens: Token[];
    logger: ParserLogger | Console['error'];
    hadError: boolean;
    current: number;
    constructor(tokens: any, logger?: ParserLogger | Console['error']);
    error(message: string): void;
    /**
     * Indicates whether the parser has reached the end of tokens.
     * @returns {Boolean} Whether there are no more tokens to be parsed.
     */
    isAtEnd(): boolean;
    /**
     * Advances the parser to the next token.
     * @returns {Token} The now-current token.
     */
    advance(): Token;
    /**
     * Peeks at the next token in the array.
     * @returns {Token} The next token in the array.
     */
    peek(): Token;
    /**
     * Returns true if the next token is of one of the types provided.
     * @param {...Number} types All of the possible types to match.
     * @returns {Boolean} Whether any of the types were matched.
     */
    match(...types: Tokens[]): boolean;
    /**
     * Returns true if the token two spaces ahead is of one of the types provided.
     * @param {...Number} types All of the possible types to match.
     * @returns {Boolean} Whether any of the types were matched.
     */
    matchAhead(...types: any[]): boolean;
    /**
     * Errors and goes to line end if match() fails.
     * @param {String} message Message to report as an error if it fails.
     * @param  {...Number} names Names to pass to match().
     * @returns {Boolean} match() output
     */
    expect(message: any, ...names: any[]): boolean;
    /**
     * Gobbles newlines - grabs as many newlines as it can and moves the parser past them.
     */
    gobbleNewlines(): void;
    /**
     * Skips until it finds a newline or EOF.
     */
    toLineEnd(): void;
    /**
     * Parses the input and returns an Abstract Syntax Tree describing the input.
     * @returns {Tree}
     */
    parse(): Tree;
    /**
     * Parses multiple options for a certain function.
     * @param {Number} type The type to return for the tree.
     * @param {Function} fn The function to parse as a constituent part.
     * @param {Number} separator The token type to split on.
     * @returns {Tree} Syntax tree
     */
    options(type: any, fn: any, separator?: number): Tree;
    /**
     * Parses a line. (In the grammar, this is technically a runnable,
     * since the scanner skips anything else.)
     * @returns {Tree} The AST branch for the line.
     */
    line(): Tree;
}
/**
 * Wrapper function for the parser. Takes an array of tokens as produced by the scanner and turns them into an Abstract Syntax Tree (AST).
 * @param {Token[]} tokens The tokens to parse.
 * @param {Logger} logger The function to report errors to.
 */
export declare const parse: (tokens: Token[], logger?: ParserLogger) => Tree;
export {};
