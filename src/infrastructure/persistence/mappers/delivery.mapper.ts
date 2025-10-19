import { Delivery } from '../../../domain/delivery';
import { DeliveryId } from '../../../domain/value-objects/delivery-id';
import { OrderId } from '../../../domain/value-objects/order-id';
import { DeliveryStatus as DeliveryStatusType } from '../../../domain/value-objects/delivery-status';
import { ShipmentContentMapper } from './shipment-content.mapper';
import { ShippingLabelMapper } from './shipping-label.mapper';
import { AddressMapper } from './address.mapper';
import { DeliveryDocument } from '../schemas/delivery.schema';

export class DeliveryMapper {
  static toDomain(document: DeliveryDocument): Delivery {
    return new Delivery(
      new DeliveryId(document.id),
      new OrderId(document.orderId),
      document.status as DeliveryStatusType,
      document.providerName,
      AddressMapper.toDomain(document.sender),
      AddressMapper.toDomain(document.recipient),
      ShipmentContentMapper.toDomain(document.content),
      document.createdAt,
      ShippingLabelMapper.toDomain(document.shippingLabel),
    );
  }

  static toPersistence(delivery: Delivery): any {
    return {
      id: delivery.id.value,
      orderId: delivery.orderId.value,
      status: delivery.status as DeliveryStatusType,
      providerName: delivery.providerName,
      sender: AddressMapper.toPersistence(delivery.sender),
      recipient: AddressMapper.toPersistence(delivery.recipient),
      content: ShipmentContentMapper.toPersistence(delivery.content),
      createdAt: delivery.createdAt,
      shippingLabel: ShippingLabelMapper.toPersistence(delivery.getShippingLabel()),
    };
  }
}
