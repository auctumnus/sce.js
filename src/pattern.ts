export const enum ElementType {
  GRAPHEME,
  CATEGORY,
  WILDCARD,
  OPTIONAL_SEQUENCE,
  DITTO,
  NUMERIC_REPETITION,
  WILDCARD_REPETITION,
}

const enum WildcardType {
  SIMPLE,
  WORD_BOUNDARY,
  NON_GREEDY,
  NON_GREEDY_WORD_BOUNDARY,
}

interface GraphemeElement {
  type: ElementType.GRAPHEME
  grapheme: string
}

interface CategoryElement {
  type: ElementType.CATEGORY
  category: string[]
}

interface WildcardElement {
  type: ElementType.WILDCARD
  wildcardType: WildcardType
}

interface OptionalElement {
  type: ElementType.OPTIONAL_SEQUENCE
  pattern: Pattern
}

interface DittoElement {
  type: ElementType.DITTO
}

interface NumericRepetitionElement {
  type: ElementType.NUMERIC_REPETITION
  count: number
}

interface WildcardRepetitionElement {
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
