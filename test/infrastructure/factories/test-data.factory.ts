import { Delivery } from '../../../src/domain/delivery';
import { DeliveryId } from '../../../src/domain/value-objects/delivery-id';
import { DeliveryStatus } from '../../../src/domain/value-objects/delivery-status';
import { createMockDelivery } from '../../mocks/mocks';


export const createTestDeliveryForDB = (overrides?: {
  status?: DeliveryStatus;
  providerName?: string;
  id?: DeliveryId;
}): Delivery => {
  const delivery = createMockDelivery({
    status: overrides?.status || 'created',
    providerName: overrides?.providerName || 'TestProvider',
  });

  if (overrides?.id) {
    (delivery as any).id = overrides.id;
  }

  return delivery;
};

export const createMultipleTestDeliveries = (count: number = 3): Delivery[] => {
  const statuses: DeliveryStatus[] = ['created', 'shipped', 'delivered'];

  return Array.from({ length: count }, (_, index) =>
    createTestDeliveryForDB({
      status: statuses[index % statuses.length],
      providerName: `Provider${index + 1}`,
    }),
  );
};

export const createDeliveryWithTracking = (
  trackingScenario: 'active' | 'delivered' | 'created' = 'active',
): Delivery => {
  const statusMap: Record<string, DeliveryStatus> = {
    active: 'shipped',
    delivered: 'delivered',
    created: 'created',
  };

  return createTestDeliveryForDB({
    status: statusMap[trackingScenario],
  });
};
