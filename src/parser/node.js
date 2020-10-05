const nodeArray = [
  'ast',

  'line',
  'rule', 'metarule',

  'metaruleDef',
  'metaruleBlock',
  'metaruleRule',

  'categoryDef', 'temporaryCategory',
  'categoryRef',
  'categoryName',
  'categoryDefOptionContent', 'categoryDefPredicate',
  'categoryAddition', 'categorySubtraction',

  'wildcard', 'extendedWildcard',
  'nonGreedyWildcard', 'nonGreedyExtendedWildcard',

  'numericRepetition',
  'wildcardRepetition', 'nonGreedyWildcardRepetition',

  'textWithCategories',
  'text',
  'ditto', 'targetRef', 'reverseTargetRef',

  'positionNumber',
  'position',

  'optionalSequence', 'nonGreedyOptionalSequence',

  'singleReplacementTarget', 'multipleReplacementTarget', 'target',

  'nonTargetContent',
  'singleReplacementChange', 'multipleReplacementChange', 'change', 'else',

  'underscore', 'adjacency',

  'environmentContent',
  'environment', 'exception',

  'flagList', 'binaryFlag', 'ternaryFlag', 'numericFlag'
]

export const nodeType = Object.freeze(Object.fromEntries(nodeArray.map((k, i) => [k, i])))

/**
 * A tree is a node with children, as opposed to content. It can also store flags.
 * @typedef {Object} Tree
 * @property {Number} type The type of tree.
 * @property {(Tree|Node)[]} children An array of trees and nodes that are the children of this tree.
 * @property {String[]} flags The flags set on this tree.
 * @property {Boolean} isTree Whether the object is a tree. Always true.
 * @property {Boolean} isNode Whether the object is a node. Always false.
 */
export class Tree {
  /**
   * Creates a new Tree.
   * @param {Number} type The type of the tree.
   * @param {(Tree|Node)[]} children The children of the tree.
   * @param {String[]} flags Flags set on the tree.
   */
  constructor (type, children = [], flags = []) {
    this.type = type
    this.children = children
    this.flags = flags
    this.isTree = true
    this.isNode = false
  }

  /**
   * Indicates whether this tree has the flag provided.
   * @param {String} name The flag name to look for.
   * @returns {Boolean} Whether this tree has the flag provided or not.
   */
  hasFlag (name) {
    return this.flags.includes(name)
  }

  get [Symbol.toStringTag] () {
    return nodeArray[this.type]
  }
}

/**
 * A node has a type and content, but not children.
 * @typedef {Object} Node
 * @property {Number} type The type of node this is.
 * @property {String|Object} content The content of the node.
 * @property {Boolean} isTree Whether the object is a tree. Always false.
 * @property {Boolean} isNode Whether the object is a node. Always true.
 */
export class Node {
  constructor (type, content) {
    this.type = type
    this.content = content
    this.isTree = false
    this.isNode = true
  }

  get [Symbol.toStringTag] () {
    return nodeArray[this.type]
  }
}
