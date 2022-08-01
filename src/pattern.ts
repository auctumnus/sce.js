export const enum ElementType {
  GRAPHEME,
  CATEGORY,
  WILDCARD,
  OPTIONAL_SEQUENCE,
  DITTO,
  NUMERIC_REPETITION,
  WILDCARD_REPETITION,
}

export const enum WildcardType {
  SIMPLE,
  WORD_BOUNDARY,
  NON_GREEDY,
  NON_GREEDY_WORD_BOUNDARY,
}

export interface GraphemeElement {
  type: ElementType.GRAPHEME
  grapheme: string
}

export interface CategoryElement {
  type: ElementType.CATEGORY
  category: string[]
}

export interface WildcardElement {
  type: ElementType.WILDCARD
  wildcardType: WildcardType
}

export interface OptionalElement {
  type: ElementType.OPTIONAL_SEQUENCE
  pattern: Pattern
}

export interface DittoElement {
  type: ElementType.DITTO
}

export interface NumericRepetitionElement {
  type: ElementType.NUMERIC_REPETITION
  count: number
  pattern: Pattern
}

export interface WildcardRepetitionElement {
  type: ElementType.WILDCARD_REPETITION
  wildcardType: WildcardType.SIMPLE | WildcardType.NON_GREEDY
}

export type PatternElement =
  | GraphemeElement
  | CategoryElement
  | WildcardElement
  | OptionalElement
  | DittoElement
  | NumericRepetitionElement
  | WildcardRepetitionElement

export type Pattern = PatternElement[]
