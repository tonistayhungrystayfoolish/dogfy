import { ItemId } from '@/domain/value-objects/item-id';
import { OrderItem } from '../../../domain/order-item';
import { OrderItemDocument } from '../schemas/order-item.schema';

export class OrderItemMapper {
  static toDomain(document: OrderItemDocument): OrderItem {
    return new OrderItem(
      new ItemId(document.itemId),
      document.sku,
      document.name,
      document.quantity,
      document.unitWeight,
    );
  }

  static toPersistence(orderItem: OrderItem): OrderItemDocument {
    return {
      itemId: orderItem.itemId.value,
      sku: orderItem.sku,
      name: orderItem.name,
      quantity: orderItem.quantity,
      unitWeight: orderItem.unitWeight,
    };
  }
}
