import { CreateDeliveryRequest } from '../../../src/infrastructure/controllers/dtos/create-delivery-request.dto.js';
import { CreateDeliveryResponse } from '../../../src/infrastructure/controllers/dtos/create-delivery-response.dto.js';
import { TLSWebhookPayload } from '../../../src/infrastructure/controllers/dtos/tls-webhook-payload.dto.js';

export interface DeliveryStatusResponse {
  deliveryId: string;
  status: string;
  lastUpdated: string;
}

export class E2EClientHelper {
  constructor(private readonly baseUrl: string) {}

  async createDelivery(payload: CreateDeliveryRequest): Promise<CreateDeliveryResponse> {
    const response = await fetch(`${this.baseUrl}/deliveries`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Failed to create delivery: ${response.status} ${response.statusText} - ${errorText}`,
      );
    }

    return response.json() as Promise<CreateDeliveryResponse>;
  }

  async getDeliveryStatus(deliveryId: string): Promise<DeliveryStatusResponse> {
    const response = await fetch(`${this.baseUrl}/deliveries/${deliveryId}/status`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Failed to get delivery status: ${response.status} ${response.statusText} - ${errorText}`,
      );
    }

    return response.json() as Promise<DeliveryStatusResponse>;
  }

  async sendTLSWebhook(payload: TLSWebhookPayload): Promise<void> {
    const response = await fetch(`${this.baseUrl}/webhooks/tls/status`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Failed to send TLS webhook: ${response.status} ${response.statusText} - ${errorText}`,
      );
    }
  }
}
