export class OrderId {
   constructor(readonly value: string) {
    if (typeof value !== 'string' || !value.trim()) {
      throw new Error('OrderId must be a non-empty string');
    }
  }

  equals(other: OrderId): boolean {
    return other instanceof OrderId && this.value === other.value;
  }
}
