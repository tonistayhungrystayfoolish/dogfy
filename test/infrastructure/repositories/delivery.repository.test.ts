import { MongoDbDeliveryRepositoryImpl } from '../../../src/infrastructure/persistence/repositories/mongodb-delivery-repository.impl';
import { DeliveryRepository } from '../../../src/domain/interfaces/delivery.repository';
import { DeliveryId } from '../../../src/domain/value-objects/delivery-id';
import {
  createTestDeliveryForDB,
  createDeliveryWithTracking,
} from '../factories/test-data.factory';

describe('DeliveryRepository Integration Tests', () => {
  let deliveryRepository: DeliveryRepository;

  beforeEach(() => {
    deliveryRepository = new MongoDbDeliveryRepositoryImpl();
  });

  describe('save', () => {
    it('should save delivery to MongoDB', async () => {
      const delivery = createTestDeliveryForDB();

      await deliveryRepository.save(delivery);

      const savedDelivery = await deliveryRepository.findById(delivery.id);
      expect(savedDelivery).toBeDefined();
      expect(savedDelivery!.id.value).toBe(delivery.id.value);
      expect(savedDelivery!.status).toBe(delivery.status);
    });

    it('should update existing delivery', async () => {
      const delivery = createTestDeliveryForDB({ status: 'created' });
      await deliveryRepository.save(delivery);

      delivery.updateStatus('shipped');
      await deliveryRepository.save(delivery);

      const updatedDelivery = await deliveryRepository.findById(delivery.id);
      expect(updatedDelivery!.status).toBe('shipped');
    });
  });

  describe('findById', () => {
    it('should find delivery by id', async () => {
      const delivery = createTestDeliveryForDB();
      await deliveryRepository.save(delivery);

      const foundDelivery = await deliveryRepository.findById(delivery.id);

      expect(foundDelivery).toBeDefined();
      expect(foundDelivery!.id.value).toBe(delivery.id.value);
      expect(foundDelivery!.orderId.value).toBe(delivery.orderId.value);
    });

    it('should return null for non-existent delivery', async () => {
      const nonExistentId = DeliveryId.create();

      const result = await deliveryRepository.findById(nonExistentId);

      expect(result).toBeNull();
    });
  });

  describe('findByTrackingId', () => {
    it('should find delivery by tracking id', async () => {
      const delivery = createTestDeliveryForDB();
      await deliveryRepository.save(delivery);

      const foundDelivery = await deliveryRepository.findByTrackingId(
        delivery.getShippingLabel().trackingId,
      );

      expect(foundDelivery).toBeDefined();
      expect(foundDelivery!.id.value).toBe(delivery.id.value);
    });

    it('should return null for non-existent tracking id', async () => {
      const delivery = createTestDeliveryForDB();

      const result = await deliveryRepository.findByTrackingId(
        delivery.getShippingLabel().trackingId,
      );

      expect(result).toBeNull();
    });
  });

  describe('findActiveDeliveries', () => {
    it('should find only active deliveries', async () => {
      const activeDelivery1 = createDeliveryWithTracking('active');
      const activeDelivery2 = createTestDeliveryForDB({ status: 'created' });
      const deliveredDelivery = createDeliveryWithTracking('delivered');

      await deliveryRepository.save(activeDelivery1);
      await deliveryRepository.save(activeDelivery2);
      await deliveryRepository.save(deliveredDelivery);

      const activeDeliveries = await deliveryRepository.findActiveDeliveries();

      expect(activeDeliveries).toHaveLength(2);
      expect(activeDeliveries.map((d) => d.status)).toEqual(
        expect.arrayContaining(['shipped', 'created']),
      );
    });

    it('should return empty array when no active deliveries exist', async () => {
      const deliveredDelivery = createDeliveryWithTracking('delivered');
      await deliveryRepository.save(deliveredDelivery);

      const activeDeliveries = await deliveryRepository.findActiveDeliveries();

      expect(activeDeliveries).toHaveLength(0);
    });
  });

  describe('updateStatus', () => {
    it('should update delivery status', async () => {
      const delivery = createTestDeliveryForDB({ status: 'created' });
      await deliveryRepository.save(delivery);

      await deliveryRepository.updateStatus(delivery.id, 'shipped');

      const updatedDelivery = await deliveryRepository.findById(delivery.id);
      expect(updatedDelivery!.status).toBe('shipped');
    });

    it('should handle non-existent delivery gracefully', async () => {
      const nonExistentId = DeliveryId.create();

      await expect(
        deliveryRepository.updateStatus(nonExistentId, 'shipped'),
      ).resolves.not.toThrow();
    });
  });
});
