import { TrackingId } from '@/domain/value-objects/tracking-id';
import { DeliveryStatus } from '@/domain/value-objects/delivery-status';
import { DeliveryStatusService } from '../services/delivery-status.service';

/**
 * Unified Use Case for Delivery Status Updates
 *
 * Handles status updates from two different sources:
 * 1. Polling (NRW provider) - System-initiated, scheduled
 * 2. Webhooks (TLS provider) - Event-driven, real-time
 */
export class UpdateDeliveryStatusUseCase {
  constructor(private readonly deliveryStatusService: DeliveryStatusService) {}

  async executeFromPolling(deliveryId: string): Promise<void> {
    await this.deliveryStatusService.pollDeliveryStatus(deliveryId);
  }

  async executeFromPollingAll(): Promise<void> {
    await this.deliveryStatusService.pollAllActiveDeliveries();
  }

  async executeFromWebhook(trackingId: TrackingId, newStatus: DeliveryStatus): Promise<void> {
    await this.deliveryStatusService.handleWebhookUpdate(trackingId.value, newStatus);
  }
}
