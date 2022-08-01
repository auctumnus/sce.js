export class Category {
  constructor(public elements: string[], public name?: string) {}

  has(item: string) {
    return this.elements.includes(item)
  }

  toString() {
    return (
      (this.name ? `Category "${this.name}": ` : 'Anonymous category: ') +
      this.elements.join(', ')
    )
  }
}
