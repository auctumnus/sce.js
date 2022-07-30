/**
 * Tests if there are any polygraphs in the given list of graphemes.
 * @param g A list of graphemes.
 * @returns Whether there are any polygraphs.
 */
import { ElementType, Pattern } from './pattern'

const noPolygraphs = (g: string[]) =>
  !g.length || g.every((s) => s.length === 1)

interface Match {
  match: true
  length: number
  startIndex: number
  content: string[]
  info?: string[]
}

type PatternMatch = Match | { match: false; info?: string[] }

/**
 * Represents a word, parsing/storing it in a way that respects polygraphs.
 */
export class Word {
  /**
   * The phonemes in the word.
   */
  phones: string[]
  /**
   * A list of graphemes to use in parsing the word.
   */
  graphs: string[]
  /**
   * The string to separate polygraphs.
   */
  separator: string

  private constructor(phones: string[], graphs: string[], separator = '') {
    this.phones = phones
    this.graphs = graphs
    this.separator = separator
  }

  /**
   * Parses a string into a word given a list of graphemes.
   * @param str The string to parse.
   * @param graphs A list of graphemes to use to parse the string.
   * @param separator The string which separates graphemes. Blank by default.
   * @returns A parsed word class.
   */
  static parse(str: string, graphs: string[] = [], separator = '') {
    // '#' is the "whitespace" character. Here we replace all whitespace and
    // add #s to each end.
    str = ` ${str} `.replaceAll(/\s+/g, '#')

    // Sort from the longest string to the shortest string.
    // Technically, we could do this outside of the parsing function, and
    // sort whenever more is added to the `graphs` category, but this way we
    // shouldn't have to check on the name before modifying a category.
    graphs.sort((a, b) => b.length - a.length)

    if (noPolygraphs(graphs)) {
      return new Word(
        str.replaceAll(separator, '').split(''),
        graphs,
        separator
      )
    }

    const phones = []

    while (str) {
      if (str.startsWith(separator)) {
        str = str.substring(separator.length)
      }

      // The graphs array is sorted by length, meaning whichever graph shows up
      // first here is the most maximal one possible.
      const graph = graphs.filter((g) => str.startsWith(g))[0]
      if (!graph) {
        phones.push(str[0])
        str = str.substring(1)
      } else {
        phones.push(graph)
        str = str.substring(graph.length)
      }
    }

    return new Word(phones, graphs, separator)
  }

  /**
   * The toString() method returns a string representing the specified word.
   * @returns A string representing the specified word.
   */
  toString() {
    if (noPolygraphs(this.graphs)) {
      return this.phones.join('').replaceAll('#', ' ').trim()
    }

    return this.phones
      .reduce((string, graph) => {
        string += graph
        if (this.graphs.some((g) => g.startsWith(graph) && g !== graph)) {
          string += this.separator
        }
        return string
      }, '')
      .replaceAll('#', ' ')
      .trim()
  }

  /**
   * Finds a pattern from a given index.
   * @param pattern The pattern to match.
   * @param startIndex The index to start from.
   * @private
   * @returns An object describing the given match.
   */
  #matchOne(pattern: Pattern, startIndex: number, depth = 0): PatternMatch {
    const info: string[] = []
    info.push(`matching pattern to ${this.toString()}`)
    let index = startIndex
    info.push(`matching from ${startIndex} (${this.phones[startIndex]})`)
    for (let elementIndex = 0; elementIndex < pattern.length; elementIndex++) {
      const element = pattern[elementIndex]
      const phone = this.phones[index]
      info.push(`looking at ${phone}`)

      const failedMatch: PatternMatch = {
        match: false,
        info,
      }

      switch (element.type) {
        case ElementType.GRAPHEME: {
          if (phone !== element.grapheme) {
            info.push(`expected ${element.grapheme}, got ${phone}`)
            return failedMatch
          }
          info.push(`got ${phone}`)
          break
        }

        case ElementType.CATEGORY: {
          if (!element.category.includes(phone)) return failedMatch
          break
        }

        case ElementType.DITTO: {
          if (index === 0 || phone !== this.phones[index - 1])
            return failedMatch
          break
        }

        case ElementType.OPTIONAL_SEQUENCE: {
          info.push('matching optional sequence')
          const result = this.#matchOne(element.pattern, index, depth + 1)
          if (result.match) {
            info.push('optional sequence matched!')
            index += result.length - 1
            info.push(
              `length is ${result.length}, index is now ${index} (${this.phones[index]})`
            )
            break
          } else {
            info.push('optional sequence failed :(')
            continue
          }
        }

        case ElementType.WILDCARD: {
          break
        }

        case ElementType.NUMERIC_REPETITION: {
          info.push(`matching numeric repetition, count of ${element.count}`)
          if (index === 0) return failedMatch

          const lastElement = pattern[elementIndex - 1]
          if (!lastElement) return failedMatch

          let count = element.count
          while (count !== 0) {
            info.push(`count is ${count}`)
            const result = this.#matchOne([lastElement], index, depth + 1)
            if (result.match) {
              info.push(`repetition matched!`)
              index += result.length
            } else {
              info.push('repetition failed :(')
              return failedMatch
            }
            count--
          }
          // TODO: why does this go one over
          index--
          break
        }

        case ElementType.WILDCARD_REPETITION: {
          break
        }
      }
      index++
    }
    info.push('successful match!')
    return {
      match: true,
      startIndex,
      length: index - startIndex,
      content: this.phones.slice(startIndex, index),
      info,
    }
  }

  /**
   * Finds a pattern within this word. Matches may be overlapping.
   *
   * @param pattern The pattern to match.
   * @returns An array of matches.
   */
  match(pattern: Pattern) {
    return this.phones
      .map((_, i) => this.#matchOne(pattern, i))
      .filter(({ match }) => match) as Match[]
  }
}
