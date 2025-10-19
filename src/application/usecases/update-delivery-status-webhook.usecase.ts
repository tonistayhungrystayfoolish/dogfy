import { TrackingId } from '@/domain/value-objects/tracking-id';
import { DeliveryStatus } from '@/domain/value-objects/delivery-status';
import { DeliveryStatusService } from '../services/delivery-status.service';

export class UpdateDeliveryStatusWebhookUseCase {
  constructor(private readonly deliveryStatusService: DeliveryStatusService) {}

  async execute(trackingId: TrackingId, newStatus: DeliveryStatus): Promise<void> {
    await this.deliveryStatusService.handleWebhookUpdate(trackingId.value, newStatus);
  }
}
