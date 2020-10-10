import { Scanner, Token, tokenType, scan } from './scanner';
import { Tree, Node, nodeType } from './parser/node';
import { Parser, parse } from './parser/parser';
declare const getVersion: () => string;
export { Scanner, Token, tokenType, scan, Tree, Node, nodeType, Parser, parse, getVersion };
