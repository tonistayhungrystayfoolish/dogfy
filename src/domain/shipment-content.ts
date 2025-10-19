import { OrderItem } from './order-item';
import { Dimensions } from './value-objects/dimensions';

export const PackagingType = {
  BOX: 'box',
  ENVELOPE: 'envelope',
};

export type PackagingType = (typeof PackagingType)[keyof typeof PackagingType];

export class ShipmentContent {
   constructor(
    readonly items: ReadonlyArray<OrderItem>,
    readonly packagingType: PackagingType,
    readonly dimensions: Dimensions,
  ) {
    if (items.length === 0) {
      throw new Error('Shipment content must have at least one item');
    }
  }

  get totalWeight(): number {
    return this.items.reduce((sum, item) => sum + item.unitWeight * item.quantity, 0);
  }

  equals(other: ShipmentContent): boolean {
    if (!(other instanceof ShipmentContent)) return false;
    if (this.packagingType !== other.packagingType) return false;
    if (!this.dimensions.equals(other.dimensions)) return false;
    if (this.items.length !== other.items.length) return false;

    const sortById = (a: OrderItem, b: OrderItem) => a.itemId.value.localeCompare(b.itemId.value);
    const thisSorted = [...this.items].sort(sortById);
    const otherSorted = [...other.items].sort(sortById);

    return thisSorted.every((item, index) => {
      const otherItem = otherSorted[index];
      return otherItem !== undefined && item.equals(otherItem);
    });
  }
}
