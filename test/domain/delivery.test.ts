import { Delivery } from '../../src/domain/delivery';
import { DeliveryId } from '../../src/domain/value-objects/delivery-id';
import {
  createMockOrderId,
  createMockShippingLabel,
  createMockAddress,
  createMockShipmentContent,
} from '../mocks/mocks';

describe('Delivery Domain Entity', () => {
  describe('Delivery.create', () => {
    it('should create a new delivery with correct initial state', () => {
      const delivery = Delivery.create(
        createMockOrderId(),
        'provider-name',
        createMockShippingLabel(),
        createMockAddress(),
        createMockAddress(),
        createMockShipmentContent(),
      );

      expect(delivery).toBeInstanceOf(Delivery);
      expect(delivery.id).toBeInstanceOf(DeliveryId);
      expect(delivery.status).toBe('created');
      expect(delivery.providerName).toBe('provider-name');
      expect(delivery.createdAt).toBeInstanceOf(Date);
    });

    it('should generate a new delivery ID', () => {
      const delivery1 = Delivery.create(
        createMockOrderId(),
        'provider-name',
        createMockShippingLabel(),
        createMockAddress(),
        createMockAddress(),
        createMockShipmentContent(),
      );

      const delivery2 = Delivery.create(
        createMockOrderId(),
        'provider-name',
        createMockShippingLabel(),
        createMockAddress(),
        createMockAddress(),
        createMockShipmentContent(),
      );

      expect(delivery1.id.value).not.toBe(delivery2.id.value);
    });
  });

  describe('constructor', () => {
    it('should initialize all properties correctly', () => {
      const deliveryId = new DeliveryId('delivery-123');
      const orderId = createMockOrderId();
      const createdAt = new Date();
      const shippingLabel = createMockShippingLabel();

      const delivery = new Delivery(
        deliveryId,
        orderId,
        'shipped',
        'provider-name',
        createMockAddress(),
        createMockAddress(),
        createMockShipmentContent(),
        createdAt,
        shippingLabel,
      );

      expect(delivery.id).toBe(deliveryId);
      expect(delivery.orderId).toBe(orderId);
      expect(delivery.status).toBe('shipped');
      expect(delivery.createdAt).toBe(createdAt);
    });
  });

  describe('updateStatus', () => {
    it('should update the delivery status', () => {
      const delivery = Delivery.create(
        createMockOrderId(),
        'provider-name',
        createMockShippingLabel(),
        createMockAddress(),
        createMockAddress(),
        createMockShipmentContent(),
      );

      delivery.updateStatus('shipped');
      expect(delivery.status).toBe('shipped');
    });
  });

  describe('updateShippingLabel', () => {
    it('should update the shipping label', () => {
      const delivery = Delivery.create(
        createMockOrderId(),
        'provider-name',
        createMockShippingLabel(),
        createMockAddress(),
        createMockAddress(),
        createMockShipmentContent(),
      );

      const newLabel = createMockShippingLabel();
      delivery.updateShippingLabel(newLabel);

      expect(delivery.getShippingLabel()).toBe(newLabel);
    });
  });

  describe('getShippingLabel', () => {
    it('should return the current shipping label', () => {
      const shippingLabel = createMockShippingLabel();
      const delivery = Delivery.create(
        createMockOrderId(),
        'provider-name',
        shippingLabel,
        createMockAddress(),
        createMockAddress(),
        createMockShipmentContent(),
      );

      expect(delivery.getShippingLabel()).toBe(shippingLabel);
    });
  });

  describe('isDelivered', () => {
    it('should return true when status is delivered', () => {
      const delivery = Delivery.create(
        createMockOrderId(),
        'provider-name',
        createMockShippingLabel(),
        createMockAddress(),
        createMockAddress(),
        createMockShipmentContent(),
      );

      delivery.updateStatus('delivered');
      expect(delivery.isDelivered()).toBe(true);
    });

    it('should return false when status is not delivered', () => {
      const delivery = Delivery.create(
        createMockOrderId(),
        'provider-name',
        createMockShippingLabel(),
        createMockAddress(),
        createMockAddress(),
        createMockShipmentContent(),
      );

      expect(delivery.isDelivered()).toBe(false);
    });
  });

  describe('isShipped', () => {
    it('should return true when status is shipped', () => {
      const delivery = Delivery.create(
        createMockOrderId(),
        'provider-name',
        createMockShippingLabel(),
        createMockAddress(),
        createMockAddress(),
        createMockShipmentContent(),
      );

      delivery.updateStatus('shipped');
      expect(delivery.isShipped()).toBe(true);
    });

    it('should return false when status is not shipped', () => {
      const delivery = Delivery.create(
        createMockOrderId(),
        'provider-name',
        createMockShippingLabel(),
        createMockAddress(),
        createMockAddress(),
        createMockShipmentContent(),
      );

      expect(delivery.isShipped()).toBe(false);
    });
  });

  describe('canBeShipped', () => {
    it('should return true when status is created', () => {
      const delivery = Delivery.create(
        createMockOrderId(),
        'provider-name',
        createMockShippingLabel(),
        createMockAddress(),
        createMockAddress(),
        createMockShipmentContent(),
      );

      expect(delivery.canBeShipped()).toBe(true);
    });

    it('should return false when status is not created', () => {
      const delivery = Delivery.create(
        createMockOrderId(),
        'provider-name',
        createMockShippingLabel(),
        createMockAddress(),
        createMockAddress(),
        createMockShipmentContent(),
      );

      delivery.updateStatus('shipped');
      expect(delivery.canBeShipped()).toBe(false);
    });
  });
});
