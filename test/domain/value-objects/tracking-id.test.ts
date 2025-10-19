import { TrackingId } from '@/domain/value-objects/tracking-id';
import { randomUUID } from 'crypto';

describe('TrackingId Value Object', () => {
  describe('constructor', () => {
    it('should create a TrackingId with a valid value', () => {
      const id = new TrackingId('valid-tracking-id-123');
      expect(id.value).toBe('valid-tracking-id-123');
    });

    it('should throw an error when value is empty', () => {
      expect(() => {
        new TrackingId('');
      }).toThrow('TrackingId cannot be empty');
    });

    it('should throw an error when value is null', () => {
      expect(() => {
        new TrackingId(null as unknown as string);
      }).toThrow('TrackingId cannot be empty');
    });

    it('should throw an error when value is undefined', () => {
      expect(() => {
        new TrackingId(undefined as unknown as string);
      }).toThrow('TrackingId cannot be empty');
    });

    it('should throw an error when value contains only whitespace', () => {
      expect(() => {
        new TrackingId('   ');
      }).toThrow('TrackingId cannot be empty');
    });
  });

  describe('create', () => {
    it('should create a TrackingId with a valid UUID', () => {
      const trackingId = TrackingId.create();
      expect(trackingId).toBeInstanceOf(TrackingId);
      expect(trackingId.value).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
    });

    it('should generate unique IDs each time', () => {
      const id1 = TrackingId.create();
      const id2 = TrackingId.create();
      expect(id1.value).not.toBe(id2.value);
    });
  });

  describe('equals', () => {
    it('should return true when comparing identical TrackingIds', () => {
      const id1 = new TrackingId('same-id');
      const id2 = new TrackingId('same-id');
      expect(id1.equals(id2)).toBe(true);
    });

    it('should return false when comparing different TrackingIds', () => {
      const id1 = new TrackingId('id-1');
      const id2 = new TrackingId('id-2');
      expect(id1.equals(id2)).toBe(false);
    });

    it('should return false when comparing with non-TrackingId object', () => {
      const id1 = new TrackingId('same-id');
      const mockObject = { value: 'same-id' };
      expect(id1.equals(mockObject as unknown as TrackingId)).toBe(false);
    });
  });
});