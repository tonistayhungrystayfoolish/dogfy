import { DeliveryId } from './value-objects/delivery-id';
import { OrderId } from './value-objects/order-id';
import { DeliveryStatus } from './value-objects/delivery-status';
import { ShippingLabel } from './value-objects/shipping-label';

import { ShipmentContent } from './shipment-content';
import { Address } from './value-objects/address';


export class Delivery {
  constructor(
    public readonly id: DeliveryId,
    public readonly orderId: OrderId,
    public status: DeliveryStatus,
    public readonly providerName: string,
    public readonly sender: Address,
    public readonly recipient: Address,
    public readonly content: ShipmentContent,
    public readonly createdAt: Date,
    private shippingLabel: ShippingLabel,
  ) {}

  updateStatus(newStatus: DeliveryStatus): void {
    this.status = newStatus;
  }

  updateShippingLabel(newShippingLabel: ShippingLabel): void {
    this.shippingLabel = newShippingLabel;
  }

  isDelivered(): boolean {
    return this.status === 'delivered';
  }

  isShipped(): boolean {
    return this.status === 'shipped';
  }

  canBeShipped(): boolean {
    return this.status === 'created';
  }

  getShippingLabel(): ShippingLabel {
    return this.shippingLabel;
  }

  static create(
    orderId: OrderId,
    providerName: string,
    shippingLabel: ShippingLabel,
    sender: Address,
    recipient: Address,
    content: ShipmentContent,
  ): Delivery {
    return new Delivery(
      DeliveryId.create(),
      orderId,
      'created',
      providerName,
      sender,
      recipient,
      content,
      new Date(),
      shippingLabel,
    );
  }
}
