import { ShippingLabel } from '../value-objects/shipping-label';
import { Address } from '../value-objects/address';
import { ShipmentContent } from '../shipment-content';
import { TrackingId } from '../value-objects/tracking-id';
import { DeliveryStatus } from '../value-objects/delivery-status';

export interface ShippingProvider {
  readonly name: string;
  createShippingLabel(
    sender: Address,
    recipient: Address,
    content: ShipmentContent,
  ): Promise<ShippingLabel>;
  supportWebhooks(): boolean;
  getDeliveryStatus(trackingId: TrackingId): Promise<DeliveryStatus>;
}
