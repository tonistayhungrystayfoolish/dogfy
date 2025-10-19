import { DeliveryRepository } from '@/domain/interfaces/delivery.repository';
import { ShippingProvider } from '@/domain/interfaces/shipping.provider';
import { DeliveryId } from '@/domain/value-objects/delivery-id';
import { TrackingId } from '@/domain/value-objects/tracking-id';
import { DeliveryStatus } from '@/domain/value-objects/delivery-status';

export class DeliveryStatusService {
  constructor(
    private readonly deliveryRepository: DeliveryRepository,
    private readonly shippingProviders: ShippingProvider[],
  ) {}


  async updateDeliveryStatus(deliveryId: string, newStatus: DeliveryStatus): Promise<void> {
    const delivery = await this.deliveryRepository.findById(new DeliveryId(deliveryId));

    if (!delivery) {
      throw new Error(`Delivery with ID ${deliveryId} not found`);
    }

    if (delivery.status !== newStatus) {
      console.log(`Updating delivery ${deliveryId} status from ${delivery.status} to ${newStatus}`);
      delivery.updateStatus(newStatus);
      await this.deliveryRepository.save(delivery);
    }
  }

  async pollDeliveryStatus(deliveryId: string): Promise<void> {
    const delivery = await this.deliveryRepository.findById(new DeliveryId(deliveryId));

    if (!delivery) {
      throw new Error(`Delivery with ID ${deliveryId} not found`);
    }

    const provider = this.shippingProviders.find((p) => p.name === delivery.providerName);

    if (!provider) {
      throw new Error(`Shipping provider for delivery ${deliveryId} not found`);
    }

    if (provider.supportWebhooks()) {
      return;
    }

    try {
      const newStatus = await provider.getDeliveryStatus(delivery.getShippingLabel().trackingId);

      await this.updateDeliveryStatus(deliveryId, newStatus);
    } catch (error) {
      console.error(`Failed to poll status for delivery ${deliveryId}:`, error);
    }
  }

  async handleWebhookUpdate(trackingId: string, newStatus: DeliveryStatus): Promise<void> {
    const delivery = await this.deliveryRepository.findByTrackingId(new TrackingId(trackingId));

    if (!delivery) {
      throw new Error(`Delivery with tracking ID ${trackingId} not found`);
    }

    await this.updateDeliveryStatus(delivery.id.value, newStatus);
  }

  async pollAllActiveDeliveries(): Promise<void> {
    const deliveries = await this.deliveryRepository.findActiveDeliveries();

    const pollingDeliveries = deliveries.filter((d) => {
      const provider = this.shippingProviders.find((p) => p.name === d.providerName);
      return provider && !provider.supportWebhooks();
    });

    console.log(
      `Polling ${pollingDeliveries.length} deliveries (${deliveries.length - pollingDeliveries.length} webhook-based deliveries skipped)`,
    );

    for (const delivery of pollingDeliveries) {
      await this.pollDeliveryStatus(delivery.id.value);
    }
  }
}
