import { E2EServerHelper } from './helpers/e2e-server.helper';
import { E2EClientHelper } from './helpers/e2e-client.helper';
import { TestDatabaseHelper } from '../infrastructure/setup/test-database.helper';
import { CreateDeliveryRequest } from '../../src/infrastructure/controllers/dtos/create-delivery-request.dto';
import { DeliveryStatus } from '../../src/domain/value-objects/delivery-status';

describe('E2E: Delivery Status Webhook Flow', () => {
  let serverHelper: E2EServerHelper;
  let client: E2EClientHelper;
  let serverUrl: string;

  beforeAll(async () => {
    serverHelper = new E2EServerHelper();
    serverUrl = await serverHelper.start();
    client = new E2EClientHelper(serverUrl);
  });

  afterAll(async () => {
    await serverHelper.stop();
  });

  beforeEach(async () => {
    await TestDatabaseHelper.clearAllCollections();
  });

  it('should update delivery status via webhook', async () => {
    const createRequest: CreateDeliveryRequest = {
      orderId: 'ORDER-WEBHOOK-001',
      sender: {
        street: 'Carrer de Mallorca 123',
        city: 'Barcelona',
        state: 'Catalonia',
        country: 'Spain',
        zipCode: '08036',
      },
      recipient: {
        street: 'Rambla de Catalunya 456',
        city: 'Barcelona',
        state: 'Catalonia',
        country: 'Spain',
        zipCode: '08008',
      },
      packagingType: 'box',
      dimensions: {
        length: 30,
        width: 20,
        height: 15,
        weight: 2.5,
      },
      items: [
        {
          productId: 'PROD-001',
          quantity: 1,
          unitWeight: 2.5,
        },
      ],
    };

    const createResponse = await client.createDelivery(createRequest);
    const trackingNumber = createResponse.shippingLabel.trackingNumber;
    const deliveryId = createResponse.deliveryId;

    const initialStatus = await client.getDeliveryStatus(deliveryId);
    expect(initialStatus.status).toBe('created');

    await client.sendTLSWebhook({
      trackingId: trackingNumber,
      status: DeliveryStatus.SHIPPED,
      timestamp: new Date().toISOString(),
    });

    const updatedStatus = await client.getDeliveryStatus(deliveryId);
    expect(updatedStatus.status).toBe('shipped');
  });

  it('should handle multiple webhook updates', async () => {
    const createRequest: CreateDeliveryRequest = {
      orderId: 'ORDER-WEBHOOK-002',
      sender: {
        street: 'Carrer de València 789',
        city: 'Barcelona',
        state: 'Catalonia',
        country: 'Spain',
        zipCode: '08015',
      },
      recipient: {
        street: 'Gran Via de les Corts Catalanes 321',
        city: 'Barcelona',
        state: 'Catalonia',
        country: 'Spain',
        zipCode: '08004',
      },
      packagingType: 'envelope',
      dimensions: {
        length: 25,
        width: 18,
        height: 5,
        weight: 0.5,
      },
      items: [
        {
          productId: 'PROD-002',
          quantity: 1,
          unitWeight: 0.5,
        },
      ],
    };

    const createResponse = await client.createDelivery(createRequest);
    const trackingNumber = createResponse.shippingLabel.trackingNumber;
    const deliveryId = createResponse.deliveryId;

    await client.sendTLSWebhook({
      trackingId: trackingNumber,
      status: DeliveryStatus.SHIPPED,
      timestamp: new Date().toISOString(),
    });

    let status = await client.getDeliveryStatus(deliveryId);
    expect(status.status).toBe('shipped');

    await client.sendTLSWebhook({
      trackingId: trackingNumber,
      status: DeliveryStatus.IN_TRANSIT,
      timestamp: new Date().toISOString(),
    });

    status = await client.getDeliveryStatus(deliveryId);
    expect(status.status).toBe('in_transit');

    await client.sendTLSWebhook({
      trackingId: trackingNumber,
      status: DeliveryStatus.DELIVERED,
      timestamp: new Date().toISOString(),
    });

    status = await client.getDeliveryStatus(deliveryId);
    expect(status.status).toBe('delivered');
  });

  it('should return 404 for non-existent tracking ID', async () => {
    await expect(
      client.sendTLSWebhook({
        trackingId: 'INVALID-TRACKING-ID',
        status: DeliveryStatus.SHIPPED,
        timestamp: new Date().toISOString(),
      }),
    ).rejects.toThrow(/404/);
  });

  it('should return 400 for invalid payload', async () => {
    const invalidPayload = {
      trackingId: 'SOME-ID',
      status: 'invalid_status',
      timestamp: new Date().toISOString(),
    };

    const response = await fetch(`${serverUrl}/webhooks/tls/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(invalidPayload),
    });

    expect(response.status).toBe(400);
  });
});
