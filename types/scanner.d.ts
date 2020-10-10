/// <reference types="lodash" />
/// <reference types="node" />
export declare const enum Tokens {
    text = 0,
    number = 1,
    leftparen = 2,
    rightparen = 3,
    leftbrace = 4,
    rightbrace = 5,
    leftcurly = 6,
    rightcurly = 7,
    leftangle = 8,
    rightangle = 9,
    copy = 10,
    move = 11,
    wildcard = 12,
    extendedWildcard = 13,
    nonGreedyWildcard = 14,
    nonGreedyExtendedWildcard = 15,
    quote = 16,
    percent = 17,
    underscore = 18,
    tilde = 19,
    at = 20,
    equals = 21,
    slash = 22,
    exclamation = 23,
    question = 24,
    plus = 25,
    minus = 26,
    comma = 27,
    semicolon = 28,
    bar = 29,
    catPlus = 30,
    catMinus = 31,
    greaterThanOrEqual = 32,
    lessThanOrEqual = 33,
    newline = 34,
    eof = 35
}
export declare const tokenType: Readonly<import("lodash").Dictionary<number>>;
/**
 * A token created by the scanner.
 * @typedef {Object} Token
 * @property {Number} type The type of the token.
 * @property {String} content The content of the token.
 * @property {Number} line The line that the token occurs on.
 * @property {Number} linePos The column the token occurs in.
 */
export declare class Token {
    type: number;
    content: string | number;
    line: number;
    linePos: number;
    constructor(type: number, content: string | number, line: number, linePos: number);
    get [Symbol.toStringTag](): string;
}
interface ScannerLogger {
    (ScannerError: any): any;
}
export declare class Scanner {
    /**
     * Creates a new Scanner to step through the input string source.
     * @param {String} source The input source for the SCE ruleset.
     * @param {Logger} logger The function to pass errors to. If none is given, the default is console.error. If a function is provided, the errors will provided as an object matching {line: (line), message: (message)}.
     */
    source: string;
    logger: ScannerLogger | Console['error'];
    tokens: Token[];
    hadError: boolean;
    current: number;
    start: number;
    length: number;
    line: number;
    linePos: number;
    constructor(source: string, logger?: ScannerLogger | Console['error']);
    /**
     * Sets hadError to true and reports the error to the logger.
     * @param {String} message The message to report.
     */
    error(message: string): void;
    /**
     * Tokenizes the input source string.
     * @returns {Token[]} An array of {@link Token} class objects containing information about the tokens scanned from the input.
     */
    scanTokens(): Token[];
    /**
     * Indicates whether the scanner has reached the end of the input.
     * @returns {Boolean} Whether the scanner is at the end of the input.
     */
    isAtEnd(): boolean;
    /**
     * Increments the current character and returns the new character to be read.
     * @returns {String} The character now pointed to by the value of current.
     */
    advance(): string;
    /**
     * Returns the next character without incrementing the value of current.
     * @returns {String} The next character in the source text.
     */
    peek(): string;
    /**
     * Peeks at the next character and returns true if the next character matches queryChar. Otherwise, returns false.
     * @param {...String} queryChars The character(s) to match.
     * @returns {Boolean} Whether the character was found in the next position.
     */
    match(...queryChars: string[]): boolean;
    /**
     * Adds a new token to the tokens array of the scanner.
     * @param {Number} type The type of the token.
     * @param {String|Number} content The full text content of the token.
     */
    addToken(type: Tokens, content: string | number): void;
    /**
     * Skips past all characters in a comment, since we don't care about the content of a comment.
     */
    comment(): void;
    /**
     * Returns true if this.match() would return true for a number.
     */
    matchNumber(): boolean;
    /**
     * Scans a number.
     */
    number(): void;
    /**
     * Consumes a block of text and returns it as one text token.
     */
    text(): void;
    /**
     * Skips past whitespace.
     */
    whitespace(): void;
    /**
     * Scans the next token.
     */
    scanToken(): void;
}
/**
 * Wrapper function for the scanner. Turns a string into an array of tokens.
 * @param {String} text The text to turn into tokens.
 * @param {Logger} logger The logger to report errors to.
 */
export declare const scan: (text: string, logger?: Scanner['logger']) => Token[];
export {};
