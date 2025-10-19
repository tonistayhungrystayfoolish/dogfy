import { ShippingProvider } from '@/domain/interfaces/shipping.provider';
import { ShippingLabel } from '@/domain/value-objects/shipping-label';
import { TrackingId } from '@/domain/value-objects/tracking-id';
import { Address } from '@/domain/value-objects/address';
import { ShipmentContent } from '@/domain/shipment-content';
import { DeliveryStatus } from '@/domain/value-objects/delivery-status';

export class TLSShippingProvider implements ShippingProvider {
  readonly name = 'TLS';

  async createShippingLabel(
    sender: Address,
    recipient: Address,
    content: ShipmentContent,
  ): Promise<ShippingLabel> {
    const trackingId = TrackingId.create();
    const labelContent = `TLS Shipping Label\nTracking: ${trackingId.value}\nFrom: ${sender.fullAddress}\nTo: ${recipient.fullAddress}\nPackaging: ${content.packagingType}\nWeight: ${content.totalWeight}kg\nDimensions: ${content.dimensions.toString()}`;

    return new ShippingLabel(labelContent, trackingId);
  }

  supportWebhooks(): boolean {
    return true;
  }

  async getDeliveryStatus(trackingId: TrackingId): Promise<DeliveryStatus> {
    console.warn(
      `TLS getDeliveryStatus called for ${trackingId.value}. Relying on webhooks for updates.`,
    );
    return DeliveryStatus.CREATED;
  }
}
