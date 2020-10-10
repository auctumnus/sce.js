export declare const enum Nodes {
    ast = 0,
    line = 1,
    rule = 2,
    metarule = 3,
    metaruleDef = 4,
    metaruleBlock = 5,
    metaruleRule = 6,
    categoryDef = 7,
    temporaryCategory = 8,
    categoryRef = 9,
    categoryName = 10,
    categoryDefOptionContent = 11,
    categoryDefPredicate = 12,
    categoryAddition = 13,
    categorySubtraction = 14,
    wildcard = 15,
    extendedWildcard = 16,
    nonGreedyWildcard = 17,
    nonGreedyExtendedWildcard = 18,
    numericRepetition = 19,
    wildcardRepetition = 20,
    nonGreedyWildcardRepetition = 21,
    textWithCategories = 22,
    text = 23,
    ditto = 24,
    targetRef = 25,
    reverseTargetRef = 26,
    positionNumber = 27,
    position = 28,
    optionalSequence = 29,
    nonGreedyOptionalSequence = 30,
    singleReplacementTarget = 31,
    multipleReplacementTarget = 32,
    target = 33,
    nonTargetContent = 34,
    singleReplacementChange = 35,
    multipleReplacementChange = 36,
    change = 37,
    else = 38,
    underscore = 39,
    adjacency = 40,
    globalCount = 41,
    comparisonOperator = 42,
    countNumber = 43,
    environmentContent = 44,
    environment = 45,
    exception = 46,
    flagList = 47,
    binaryFlag = 48,
    ternaryFlag = 49,
    numericFlag = 50,
    repeatFlag = 51,
    chanceFlag = 52,
    persistFlag = 53
}
export declare const nodeType: Readonly<{
    [k: string]: number;
}>;
/**
 * A node has a type and content, but not children.
 * @typedef {Object} Node
 * @property {Number} type The type of node this is.
 * @property {String|Number} content The content of the node.
 * @property {Boolean} isTree Whether the object is a tree. Always false.
 * @property {Boolean} isNode Whether the object is a node. Always true.
 */
export declare class Node {
    type: Nodes;
    content: string | number;
    isTree: false;
    isNode: true;
    constructor(type: Nodes, content: string | number);
    get [Symbol.toStringTag](): string;
}
/**
 * A tree is a node with children, as opposed to content. It can also store flags.
 * @typedef {Object} Tree
 * @property {Number} type The type of tree.
 * @property {(Tree|Node)[]} children An array of trees and nodes that are the children of this tree.
 * @property {String[]} flags The flags set on this tree.
 * @property {Boolean} isTree Whether the object is a tree. Always true.
 * @property {Boolean} isNode Whether the object is a node. Always false.
 */
export declare class Tree {
    type: Nodes;
    children: Array<Tree | Node>;
    flags: string[];
    isTree: true;
    isNode: false;
    /**
     * Creates a new Tree.
     * @param {Number} type The type of the tree.
     * @param {(Tree|Node)[]} children The children of the tree.
     * @param {String[]} flags Flags set on the tree.
     */
    constructor(type: Nodes, children?: Array<Tree | Node>, flags?: string[]);
    /**
     * Indicates whether this tree has the flag provided.
     * @param {String} name The flag name to look for.
     * @returns {Boolean} Whether this tree has the flag provided or not.
     */
    hasFlag(name: string): boolean;
    get [Symbol.toStringTag](): string;
}
