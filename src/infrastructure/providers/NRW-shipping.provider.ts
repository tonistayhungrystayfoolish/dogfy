import { ShippingProvider } from '@/domain/interfaces/shipping.provider';
import { ShippingLabel } from '@/domain/value-objects/shipping-label';
import { TrackingId } from '@/domain/value-objects/tracking-id';
import { Address } from '@/domain/value-objects/address';
import { ShipmentContent } from '@/domain/shipment-content';
import { DeliveryStatus } from '@/domain/value-objects/delivery-status';

const nrwExternalTrackingSystem = new Map<string, Date>();

export class NRWShippingProvider implements ShippingProvider {
  readonly name = 'NRW';

  async createShippingLabel(
    sender: Address,
    recipient: Address,
    content: ShipmentContent,
  ): Promise<ShippingLabel> {
    const trackingId = TrackingId.create();
    const labelContent = `NRW Shipping Label\nTracking: ${trackingId.value}\nFrom: ${sender.fullAddress}\nTo: ${recipient.fullAddress}\nPackaging: ${content.packagingType}\nWeight: ${content.totalWeight}kg\nDimensions: ${content.dimensions.toString()}`;

    return new ShippingLabel(labelContent, trackingId);
  }

  supportWebhooks(): boolean {
    return false;
  }

  async getDeliveryStatus(trackingId: TrackingId): Promise<DeliveryStatus> {
    const createdAt = nrwExternalTrackingSystem.get(trackingId.value);
    if (!createdAt) {
      throw new Error(`NRW API Error: Tracking ID ${trackingId.value} not found.`);
    }

    const now = new Date();
    const elapsedMinutes = (now.getTime() - createdAt.getTime()) / (1000 * 60);

    if (elapsedMinutes < 5) {
      return DeliveryStatus.CREATED;
    } else if (elapsedMinutes < 15) {
      return DeliveryStatus.SHIPPED;
    } else if (elapsedMinutes < 45) {
      return DeliveryStatus.IN_TRANSIT;
    } else {
      return DeliveryStatus.DELIVERED;
    }
  }
}
