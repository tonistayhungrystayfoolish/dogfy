import { ShipmentContent } from '../../../domain/shipment-content';
import { ShipmentContentDocument } from '../schemas/shipment-content.schema';
import { OrderItemMapper } from './order-item.mapper';
import { DimensionsMapper } from './dimensions.mapper';
import { OrderItem } from '@/domain/order-item';

export class ShipmentContentMapper {
  static toDomain(document: ShipmentContentDocument): ShipmentContent {
    const items = document.items
      ? document.items.map((item) => OrderItemMapper.toDomain(item))
      : [];

    return new ShipmentContent(
      items,
      document.packagingType,
      DimensionsMapper.toDomain(document.dimensions),
    );
  }

  static toPersistence(shipmentContent: ShipmentContent): ShipmentContentDocument {
    return {
      items: shipmentContent.items.map((item: OrderItem) => OrderItemMapper.toPersistence(item)),
      packagingType: shipmentContent.packagingType,
      dimensions: DimensionsMapper.toPersistence(shipmentContent.dimensions),
      totalWeight: shipmentContent.totalWeight,
    };
  }
}
