import { Delivery } from '../../src/domain/delivery';
import { OrderItem } from '../../src/domain/order-item';
import { ShipmentContent } from '../../src/domain/shipment-content';
import { Address } from '../../src/domain/value-objects/address';
import { DeliveryId } from '../../src/domain/value-objects/delivery-id';
import { DeliveryStatus } from '../../src/domain/value-objects/delivery-status';
import { Dimensions } from '../../src/domain/value-objects/dimensions';
import { OrderId } from '../../src/domain/value-objects/order-id';
import { ShippingLabel } from '../../src/domain/value-objects/shipping-label';
import { TrackingId } from '../../src/domain/value-objects/tracking-id';
import { DeliveryRepository } from '../../src/domain/interfaces/delivery.repository';
import { ShippingProvider } from '../../src/domain/interfaces/shipping.provider';
import { ShippingProviderRepository } from '../../src/domain/repositories/shipping-provider-repository';
import { ItemId } from '../../src/domain/value-objects/item-id';

export const createMockAddress = (): Address => {
  return new Address('123 Main St', 'Springfield', 'IL', 'USA', '62701');
};

export const createMockDimensions = (): Dimensions => {
  return new Dimensions(10, 10, 10, 1.5);
};

export const createMockOrderItem = (): OrderItem => {
  return new OrderItem(new ItemId('item-123'), 'SKU123', 'Test Item', 1, 1.5);
};

export const createMockShipmentContent = (): ShipmentContent => {
  return new ShipmentContent(
    [createMockOrderItem(), createMockOrderItem()],
    'box',
    createMockDimensions(),
  );
};

export const createMockShippingLabel = (): ShippingLabel => {
  return new ShippingLabel('Test Label Content', TrackingId.create(), new Date());
};

export const createMockDelivery = (overrides?: Partial<Delivery>): Delivery => {
  const orderId =
    overrides?.orderId ||
    new OrderId(`order-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
  const defaultDelivery = new Delivery(
    DeliveryId.create(),
    orderId,
    overrides?.status || ('created' as DeliveryStatus),
    overrides?.providerName || 'Test Provider',
    overrides?.sender || createMockAddress(),
    overrides?.recipient || createMockAddress(),
    overrides?.content || createMockShipmentContent(),
    new Date(),
    createMockShippingLabel(),
  );

  if (overrides) {
    if (overrides.status !== undefined) {
      defaultDelivery.status = overrides.status;
    }
  }

  return defaultDelivery;
};

export const createMockDeliveryRepository = () => {
  return {
    save: jest.fn(),
    findById: jest.fn(),
    findByOrderId: jest.fn(),
    findByTrackingId: jest.fn(),
    updateStatus: jest.fn(),
    findActiveDeliveries: jest.fn(),
  } as jest.Mocked<DeliveryRepository>;
};

export const createMockShippingProvider = () => {
  return {
    name: 'TestProvider',
    createShippingLabel: jest.fn(),
    supportWebhooks: jest.fn(),
    getDeliveryStatus: jest.fn(),
  } as jest.Mocked<ShippingProvider>;
};

export const createMockOrderId = (): OrderId => {
  return new OrderId('order-123');
};

export const createMockShippingProviderRepository = () => {
  return {
    findAll: jest.fn(),
  } as jest.Mocked<ShippingProviderRepository>;
};

export const createMockProviderSelectionService = () => {
  return {
    selectProvider: jest.fn(),
  } as jest.Mocked<{ selectProvider: jest.Mock }>;
};
