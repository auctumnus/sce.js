import { Category } from '../category'

export interface Source {
  content: string
  path: string
}

/**
 * A location in the SCE source.
 */
export interface Location {
  /**
   * The character index.
   */
  index: number
  /**
   * The column in the source.
   */
  column: number
  /**
   * The row in the source.
   */
  row: number
}

export class Span {
  constructor(
    public start: Location,
    public end: Location,
    public source: Source
  ) {}
  /**
   * Joins two spans. The first and second need not be ordered.
   * @param first
   * @param second
   * @returns A combined span that covers the entire area of the first and second.
   */
  static join(first: Span, second: Span) {
    if (
      first.start.index < second.start.index &&
      first.end.index > second.end.index
    ) {
      return first
    } else if (
      first.start.index > second.start.index &&
      first.end.index < second.end.index
    ) {
      return second
    } else if (first.start.index < second.start.index) {
      return { start: first.start, end: second.end }
    } else {
      return { start: second.start, end: first.end }
    }
  }
  toString() {
    return this.source.content.slice(this.start.index, this.end.index)
  }
}

/**
 * Parses SCE source.
 */
export class Parser {
  /**
   * Where the Parser is currently at.
   */
  public location: Location = { index: 0, column: 0, row: 0 }

  /**
   * The current stack of spans.
   */
  #spanStack: Location[] = []

  public categories: Record<string, Category>

  constructor(public source: Source) {}

  static from(content: string, path?: string) {
    path = path || '(anonymous)'
    return new Parser({ content, path })
  }

  /** Returns the next character, or `null` for EOF. */
  next(): string | null {
    if (this.location.index < this.source.content.length) {
      const character = this.source.content[this.location.index++]
      if (character === '\n') {
        this.location.row++
        this.location.column = 0
      } else {
        this.location.column++
      }
      return character
    } else {
      return null
    }
  }

  /**
   * Peeks at the next character without returning it.
   * @returns The next character in the source.
   */
  peek(): string | null {
    return this.source.content[this.location.index] || null
  }

  /**
   * Skips over characters.
   * @param fn A function which returns true while characters should still be skipped.
   */
  skip(fn: (char: string) => boolean): void {
    while (true) {
      const char = this.peek()
      if (char === null || !fn(char)) {
        break
      }
      this.next()
    }
  }

  /**
   * Begins a `Span`, or area of text.
   */
  startSpan(): void {
    this.#spanStack.push({ ...this.location })
  }

  /**
   * Ends the last span, or area of text.
   * @returns A `Span` covering the last span.
   */
  endSpan(): Span {
    const start = this.#spanStack.pop()
    const end = { ...this.location }
    return new Span(start, end, this.source)
  }

  /**
   * Report an error.
   */
  error() {}
}
