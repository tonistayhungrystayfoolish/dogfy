import { ItemId } from "./value-objects/item-id";

export class OrderItem {
   constructor(
    readonly itemId: ItemId,
    readonly sku: string,
    readonly name: string,
    readonly quantity: number,
    readonly unitWeight: number,
  ) {
    this.validate();
  }

  private validate(): void {
    this.validateRequiredString(this.sku, 'SKU');
    this.validateRequiredString(this.name, 'Item name');
    this.validatePositiveInteger(this.quantity, 'Quantity');
    this.validatePositiveNumber(this.unitWeight, 'Unit weight');
  }

  private validateRequiredString(value: string, fieldName: string): void {
    if (!value?.trim()) {
      throw new Error(`${fieldName} is required`);
    }
  }

  private validatePositiveInteger(value: number, fieldName: string): void {
    if (!Number.isInteger(value) || value <= 0) {
      throw new Error(`${fieldName} must be a positive integer`);
    }
  }

  private validatePositiveNumber(value: number, fieldName: string): void {
    if (value <= 0) {
      throw new Error(`${fieldName} must be a positive number`);
    }
  }

  get totalWeight(): number {
    return this.quantity * this.unitWeight;
  }

  equals(other: OrderItem): boolean {
    return (
      other instanceof OrderItem &&
      this.itemId.value === other.itemId.value &&
      this.sku === other.sku &&
      this.name === other.name &&
      this.quantity === other.quantity &&
      this.unitWeight === other.unitWeight
    );
  }
}
