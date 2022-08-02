import { test } from 'uvu'
import * as assert from 'uvu/assert'
import { Word } from '../src'
import { Category } from '../src/category'
import { ElementType, WildcardElement, WildcardType } from '../src/pattern'

const abc = Word.parse('abc')

const graphemeElement = (grapheme: string) =>
  ({
    type: ElementType.GRAPHEME,
    grapheme,
  } as const)

const categoryElement = (category: string[]) =>
  ({
    type: ElementType.CATEGORY,
    category,
  } as const)

test('one-long match', () => {
  const matches = abc.match([graphemeElement('a')])
  assert.is(matches.length, 1)
  assert.is(matches[0].length, 1)
})

test('grapheme pattern match', () => {
  const matches = abc.match([graphemeElement('a'), graphemeElement('b')])

  assert.is(matches.length, 1)

  const match = matches[0]

  assert.ok(match.match)

  assert.is(match.startIndex, 1)
  assert.is(match.length, 2)
  assert.is(match.content[0], 'a')
  assert.is(match.content[1], 'b')
})

test('ditto after grapheme', () => {
  const matches = Word.parse('baa').match([
    graphemeElement('a'),
    {
      type: ElementType.DITTO,
    },
  ])

  assert.is(matches.length, 1)
})

test('ditto initially', () => {
  const matches = Word.parse('aama').match([
    {
      type: ElementType.DITTO,
    },
    graphemeElement('m'),
  ])
  assert.is(matches.length, 1)
})

test('optional sequence', () => {
  const matches = Word.parse('anta').match([
    {
      type: ElementType.OPTIONAL_SEQUENCE,
      pattern: [graphemeElement('n')],
    },
    graphemeElement('t'),
  ])

  //console.log(matches)

  assert.is(matches.length, 2)
  assert.ok(matches[0].match)
  assert.is(matches[0].length, 2)
})

test('long optional sequence', () => {
  const matches = Word.parse('anata').match([
    {
      type: ElementType.OPTIONAL_SEQUENCE,
      pattern: [graphemeElement('n'), graphemeElement('a')],
    },
    graphemeElement('t'),
  ])

  //console.log(matches)

  assert.is(matches.length, 2)
  assert.ok(matches[0].match)
  assert.is(matches[0].length, 3)
})

test('optional sequence at end', () => {
  const matches = Word.parse('atna').match([
    graphemeElement('t'),
    {
      type: ElementType.OPTIONAL_SEQUENCE,
      pattern: [graphemeElement('n'), graphemeElement('a')],
    },
  ])

  assert.is(matches.length, 1)
})

test('medial optional sequence', () => {
  const matches = Word.parse('tatna').match([
    graphemeElement('t'),
    {
      type: ElementType.OPTIONAL_SEQUENCE,
      pattern: [graphemeElement('n')],
    },
    graphemeElement('a'),
  ])
  assert.is(matches.length, 2)
})

test('failing optional sequence', () => {
  const matches = Word.parse('at').match([
    graphemeElement('t'),
    {
      type: ElementType.OPTIONAL_SEQUENCE,
      pattern: [graphemeElement('n'), graphemeElement('a')],
    },
  ])
  assert.is(matches.length, 1)
})

const c = new Category(['a', 'b'])

test('category match', () => {
  const matches = Word.parse('ak').match([
    categoryElement(c.elements),
    graphemeElement('k'),
  ])
  assert.is(matches.length, 1)
})

test('failing category match', () => {
  const matches = Word.parse('ck').match([
    categoryElement(c.elements),
    graphemeElement('k'),
  ])
  assert.is(matches.length, 0)
})

const wildcardElement = (wildcardType: WildcardType): WildcardElement => ({
  type: ElementType.WILDCARD,
  wildcardType,
})

test('wildcard match, greedy, no rest', () => {
  const matches = Word.parse('abcd').match([
    graphemeElement('a'),
    wildcardElement(WildcardType.SIMPLE),
  ])
  assert.is(matches.length, 1)
  assert.is(matches[0].length, 4)
  assert.is(matches[0].matchRanges.length, 2)
  assert.is(matches[0].matchRanges[1].length, 3)
})

test('non-greedy wildcard match, no rest', () => {
  const matches = Word.parse('abcd').match([
    graphemeElement('a'),
    wildcardElement(WildcardType.NON_GREEDY),
  ])
  assert.is(matches.length, 1)
  assert.is(matches[0].length, 2)
})

test('word boundary wildcard match', () => {
  const matches = Word.parse('ab cd').match([
    graphemeElement('a'),
    wildcardElement(WildcardType.WORD_BOUNDARY),
  ])
  assert.is(matches.length, 1)
  assert.ok(matches[0].content.includes('#'))
})

test('word boundary match at end', () => {
  const matches = Word.parse('a').match([
    graphemeElement('a'),
    wildcardElement(WildcardType.NON_GREEDY_WORD_BOUNDARY),
  ])
  assert.is(matches.length, 1)
  assert.ok(matches[0].content.includes('#'))
})

test('non-word boundary match at end', () => {
  const matches = Word.parse('a').match([
    graphemeElement('a'),
    wildcardElement(WildcardType.NON_GREEDY),
  ])
  assert.is(matches.length, 0)
})

test('greedy match with rest', () => {
  const matches = Word.parse('abcd').match([
    graphemeElement('a'),
    wildcardElement(WildcardType.SIMPLE),
    graphemeElement('d'),
  ])
  assert.is(matches.length, 1)
})

test('greedy match, failing', () => {
  const matches = Word.parse('abc').match([
    graphemeElement('a'),
    wildcardElement(WildcardType.SIMPLE),
    graphemeElement('d'),
  ])
  assert.is(matches.length, 0)
})

test('greedy match is maximal', () => {
  const matches = Word.parse('abcdbcd').match([
    graphemeElement('a'),
    wildcardElement(WildcardType.SIMPLE),
    graphemeElement('d'),
  ])
  assert.is(matches.length, 1)
  assert.is(matches[0].length, 7)
})

test('non-greedy match is not maximal', () => {
  const matches = Word.parse('abcdbcd').match([
    graphemeElement('a'),
    wildcardElement(WildcardType.NON_GREEDY),
    graphemeElement('d'),
  ])
  assert.is(matches.length, 1)
  assert.is(matches[0].length, 4)
})

test('numeric repetition', () => {
  const matches = Word.parse('aaa').match([
    {
      type: ElementType.NUMERIC_REPETITION,
      pattern: [graphemeElement('a')],
      count: 3,
    },
  ])
  assert.is(matches.length, 1)
  assert.is(matches[0].length, 3)
})

test('failing numeric repetition', () => {
  const matches = Word.parse('aa').match([
    {
      type: ElementType.NUMERIC_REPETITION,
      pattern: [graphemeElement('a')],
      count: 3,
    },
  ])
  assert.is(matches.length, 0)
})

test.run()
