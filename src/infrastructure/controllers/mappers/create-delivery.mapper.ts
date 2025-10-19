import { OrderId } from '@/domain/value-objects/order-id';
import { Address } from '@/domain/value-objects/address';
import { ShipmentContent } from '@/domain/shipment-content';
import { OrderItem } from '@/domain/order-item';
import { Dimensions } from '@/domain/value-objects/dimensions';
import { Delivery } from '@/domain/delivery';
import { CreateDeliveryRequest } from '../dtos/create-delivery-request.dto';
import { CreateDeliveryResponse } from '../dtos/create-delivery-response.dto';
import { ItemId } from '@/domain/value-objects/item-id';

export type CreateDeliveryCommand = {
  orderId: OrderId;
  sender: Address;
  recipient: Address;
  shippingContent: ShipmentContent;
};

export function mapCreateDeliveryRequestToCommand(
  dto: CreateDeliveryRequest,
): CreateDeliveryCommand {
  const { orderId, sender, recipient, packagingType, dimensions, items } = dto;

  return {
    orderId: new OrderId(orderId),
    sender: new Address(sender.street, sender.city, sender.state, sender.country, sender.zipCode),
    recipient: new Address(
      recipient.street,
      recipient.city,
      recipient.state,
      recipient.country,
      recipient.zipCode,
    ),
    shippingContent: new ShipmentContent(
      items.map(
        (item: { productId: string; quantity: number; unitWeight: number }, index: number) =>
          new OrderItem(
            new ItemId(`item-${orderId}-${index}`),
            item.productId,
            `Product ${item.productId}`,
            item.quantity,
            item.unitWeight,
          ),
      ),
      packagingType,
      new Dimensions(dimensions.length, dimensions.width, dimensions.height, dimensions.weight),
    ),
  };
}

export function mapDeliveryToCreateDeliveryResponse(delivery: Delivery): CreateDeliveryResponse {
  const label = delivery.getShippingLabel();
  return {
    deliveryId: delivery.id.value,
    shippingLabel: {
      provider: delivery.providerName,
      trackingNumber: label.trackingId.value,
      labelUrl: label.content,
    },
    status: delivery.status,
  };
}
