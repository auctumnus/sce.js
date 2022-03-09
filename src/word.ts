/**
 * Tests if there are any polygraphs in the given list of graphemes.
 * @param g A list of graphemes.
 * @returns Whether there are any polygraphs.
 */
const noPolygraphs = (g: string[]) =>
  !g.length || g.every((s) => s.length === 1)

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
  separator = ''

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
   *
   * @returns A string representing the specified word.
   */
  toString() {
    if (noPolygraphs(this.graphs)) {
      return this.phones.join('').replaceAll('#', ' ').trim()
    }

    return this.phones
        .reduce((string, graph) => {
          string += graph
          if(this.graphs.some(g => g.startsWith(graph) && g !== graph)) {
            string += this.separator
          }
          return string
        }, '')
        .replaceAll('#', ' ')
        .trim()

  }
}
