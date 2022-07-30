import { test } from 'uvu'
import * as assert from 'uvu/assert'
import { Word } from '../src'
import { ElementType } from '../src/pattern'

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

test('category match', () => {})

test.run()
