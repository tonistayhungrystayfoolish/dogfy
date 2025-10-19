import { faker } from '@faker-js/faker';
import { Delivery } from '../src/domain/delivery';
import { OrderItem } from '../src/domain/order-item';
import { ShipmentContent } from '../src/domain/shipment-content';
import { Address } from '../src/domain/value-objects/address';
import { Dimensions } from '../src/domain/value-objects/dimensions';
import { DeliveryId } from '../src/domain/value-objects/delivery-id';
import { TrackingId } from '../src/domain/value-objects/tracking-id';
import { ShippingLabel } from '../src/domain/value-objects/shipping-label';
import { OrderId } from '../src/domain/value-objects/order-id';
import { DeliveryStatus } from '../src/domain/value-objects/delivery-status';
import { ItemId } from '../src/domain/value-objects/item-id';

export const createMockAddress = (): Address => {
  return new Address(
    faker.location.streetAddress(),
    faker.location.city(),
    faker.location.state(),
    faker.location.country(),
    faker.location.zipCode(),
  );
};

export const createMockDimensions = (): Dimensions => {
  return new Dimensions(
    faker.number.float({ min: 1, max: 100, fractionDigits: 1 }),
    faker.number.float({ min: 1, max: 100, fractionDigits: 1 }),
    faker.number.float({ min: 1, max: 100, fractionDigits: 1 }),
    faker.number.float({ min: 0.1, max: 50, fractionDigits: 1 }),
  );
};

export const createMockOrderItem = (overrides?: Partial<OrderItem>): OrderItem => {
  const orderItem = new OrderItem(
    new ItemId(overrides?.itemId?.value || faker.string.uuid()),
    overrides?.sku || faker.commerce.product(),
    overrides?.name || faker.commerce.productName(),
    overrides?.quantity || faker.number.int({ min: 1, max: 10 }),
    overrides?.unitWeight || faker.number.float({ min: 0.1, max: 10, fractionDigits: 1 }),
  );

  return orderItem;
};

export const createMockShipmentContent = (): ShipmentContent => {
  return new ShipmentContent(
    [createMockOrderItem(), createMockOrderItem()],
    'box',
    createMockDimensions(),
  );
};

export const createMockShippingLabel = (): ShippingLabel => {
  return new ShippingLabel(faker.lorem.paragraph(), TrackingId.create(), faker.date.recent());
};

export const createMockDelivery = (overrides?: Partial<Delivery>): Delivery => {
  const orderId = new OrderId(faker.string.uuid());
  const delivery = new Delivery(
    DeliveryId.create(),
    orderId,
    overrides?.status || 'created',
    overrides?.providerName || faker.company.name(),
    overrides?.sender || createMockAddress(),
    overrides?.recipient || createMockAddress(),
    overrides?.content || createMockShipmentContent(),
    faker.date.recent(),
    createMockShippingLabel(),
  );

  return delivery;
};

export const createMockDeliveryWithStatus = (status: DeliveryStatus): Delivery => {
  return createMockDelivery({ status });
};

export const createMockActiveDelivery = (): Delivery => {
  const status = faker.helpers.arrayElement(['created', 'shipped'] as DeliveryStatus[]);
  return createMockDeliveryWithStatus(status);
};

export const createMockDeliveredDelivery = (): Delivery => {
  return createMockDeliveryWithStatus('delivered');
};

export const createMockDeliveryRepository = () => {
  return {
    save: jest.fn(),
    findById: jest.fn(),
    findByTrackingId: jest.fn(),
    updateStatus: jest.fn(),
    findActiveDeliveries: jest.fn(),
  };
};

export const createMockShippingProvider = () => {
  return {
    name: 'TestProvider',
    createShippingLabel: jest.fn(),
    supportWebhooks: jest.fn(),
    getDeliveryStatus: jest.fn(),
  };
};