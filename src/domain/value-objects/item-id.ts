export class ItemId {
  constructor(readonly value: string) {
    if (!value?.trim()) {
      throw new Error('ItemId cannot be empty');
    }
  }

  equals(other: ItemId): boolean {
    return other instanceof ItemId && this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}