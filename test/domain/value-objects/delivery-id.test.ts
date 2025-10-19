import { DeliveryId } from '@/domain/value-objects/delivery-id';

describe('DeliveryId', () => {
  describe('create', () => {
    it('should create a DeliveryId with a valid UUID', () => {
      const deliveryId = DeliveryId.create();

      expect(deliveryId.value).toBeDefined();
      expect(typeof deliveryId.value).toBe('string');
      expect(deliveryId.value).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
      );
    });

    it('should create unique DeliveryIds', () => {
      const id1 = DeliveryId.create();
      const id2 = DeliveryId.create();

      expect(id1.value).not.toBe(id2.value);
    });
  });

  describe('fromString', () => {
    it('should create DeliveryId from valid UUID string', () => {
      const uuid = '123e4567-e89b-12d3-a456-426614174000';
      const deliveryId = DeliveryId.fromString(uuid);

      expect(deliveryId.value).toBe(uuid);
    });

    it('should throw error for invalid UUID string', () => {
      const invalidUuid = 'invalid-uuid';

      expect(() => {
        DeliveryId.fromString(invalidUuid);
      }).toThrow('Invalid UUID format');
    });

    it('should throw error for empty string', () => {
      expect(() => {
        DeliveryId.fromString('');
      }).toThrow('Invalid UUID format');
    });
  });

  describe('equals', () => {
    it('should return true for same DeliveryId values', () => {
      const uuid = '123e4567-e89b-12d3-a456-426614174000';
      const id1 = DeliveryId.fromString(uuid);
      const id2 = DeliveryId.fromString(uuid);

      expect(id1.equals(id2)).toBe(true);
    });

    it('should return false for different DeliveryId values', () => {
      const id1 = DeliveryId.create();
      const id2 = DeliveryId.create();

      expect(id1.equals(id2)).toBe(false);
    });

    it('should return false for non-DeliveryId object', () => {
      const deliveryId = DeliveryId.create();

      expect(deliveryId.equals({} as any)).toBe(false);
      expect(deliveryId.equals(null as any)).toBe(false);
      expect(deliveryId.equals(undefined as any)).toBe(false);
    });
  });

  describe('toString', () => {
    it('should return the UUID string', () => {
      const uuid = '123e4567-e89b-12d3-a456-426614174000';
      const deliveryId = DeliveryId.fromString(uuid);

      expect(deliveryId.toString()).toBe(uuid);
    });
  });
});
