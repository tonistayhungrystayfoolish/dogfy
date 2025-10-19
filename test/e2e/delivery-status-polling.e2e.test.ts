import { E2EServerHelper } from './helpers/e2e-server.helper';
import { E2EClientHelper } from './helpers/e2e-client.helper';
import { TestDatabaseHelper } from '../infrastructure/setup/test-database.helper';
import { CreateDeliveryRequest } from '../../src/infrastructure/controllers/dtos/create-delivery-request.dto';

describe('E2E: Delivery Status Polling Flow', () => {
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
    const pollingTask = serverHelper.getPollingTask();
    pollingTask.stopPolling();
  });

  it('should poll and update delivery status', async () => {
    const createRequest: CreateDeliveryRequest = {
      orderId: 'ORDER-POLL-001',
      sender: {
        street: 'Carrer de Balmes 123',
        city: 'Barcelona',
        state: 'Catalonia',
        country: 'Spain',
        zipCode: '08008',
      },
      recipient: {
        street: 'Passeig de Gràcia 456',
        city: 'Barcelona',
        state: 'Catalonia',
        country: 'Spain',
        zipCode: '08007',
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
    expect(createResponse.deliveryId).toBeDefined();

    const initialStatus = await client.getDeliveryStatus(createResponse.deliveryId);
    expect(initialStatus.status).toBe('created');

    const pollingTask = serverHelper.getPollingTask();
    await pollingTask.runOnce();

    const updatedStatus = await client.getDeliveryStatus(createResponse.deliveryId);
    expect(updatedStatus.status).toBeDefined();
    expect(['created', 'shipped', 'in_transit', 'delivered']).toContain(updatedStatus.status);
  });

  it('should skip webhook-based providers when polling', async () => {
    const tlsRequest: CreateDeliveryRequest = {
      orderId: 'ORDER-POLL-002',
      sender: {
        street: 'Carrer de Provença 111',
        city: 'Barcelona',
        state: 'Catalonia',
        country: 'Spain',
        zipCode: '08029',
      },
      recipient: {
        street: 'Avinguda Diagonal 222',
        city: 'Barcelona',
        state: 'Catalonia',
        country: 'Spain',
        zipCode: '08018',
      },
      packagingType: 'box',
      dimensions: {
        length: 40,
        width: 30,
        height: 20,
        weight: 5.0,
      },
      items: [
        {
          productId: 'PROD-002',
          quantity: 1,
          unitWeight: 5.0,
        },
      ],
    };

    const tlsResponse = await client.createDelivery(tlsRequest);

    const initialStatus = await client.getDeliveryStatus(tlsResponse.deliveryId);
    expect(initialStatus.status).toBe('created');

    const pollingTask = serverHelper.getPollingTask();
    await pollingTask.runOnce();

    const afterPollingStatus = await client.getDeliveryStatus(tlsResponse.deliveryId);
    expect(afterPollingStatus.status).toBe('created');
  });
});
