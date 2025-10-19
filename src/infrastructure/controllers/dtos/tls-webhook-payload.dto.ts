import { z } from 'zod';
import { DeliveryStatus } from '../../../domain/value-objects/delivery-status';

export interface TLSWebhookPayload {
  trackingId: string;
  status: DeliveryStatus;
  timestamp: string;
}

export const TLSWebhookPayloadSchema = z.object({
  trackingId: z.string().min(1),
  status: z.enum([
    DeliveryStatus.CREATED,
    DeliveryStatus.SHIPPED,
    DeliveryStatus.IN_TRANSIT,
    DeliveryStatus.DELIVERED,
    DeliveryStatus.FAILED,
  ]),
  timestamp: z.string().datetime(),
});
