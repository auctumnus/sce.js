/**
 * Represents an SCE category.
 */
export class Category {
  constructor(public elements: string[], public name?: string) {}

  /**
   * Whether this category contains the given phone.
   */
  has(item: string) {
    return this.elements.includes(item)
  }

  /**
   * The index of the given phone.
   */
  index(item: string) {
    return this.elements.indexOf(item)
  }

  /**
   * The element at the given index.
   */
  at(index: number) {
    return this.elements.at(index)
  }

  toString() {
    return (
      (this.name ? `Category "${this.name}": ` : 'Anonymous category: ') +
      this.elements.join(', ')
    )
  }

  /**
   * Transforms a phone from one category to another. The new phone has the same
   * index, modulo the length of the target category. For example, given the
   * ruleset:
   * ```
   * A = a,b,c,d,e,f
   * B = g,h,i
   * [A] > [B]
   * ```
   * the word `abcdef` would be transformed into `ghighi`.
   * @param targetCategory
   * @param phone
   * @returns
   */
  transform(targetCategory: Category, phone: string) {
    const ourIndex = this.index(phone)
    if (ourIndex === -1) {
      return phone
    } else {
      const index = ourIndex % targetCategory.elements.length
      return targetCategory.at(index)
    }
  }
}
