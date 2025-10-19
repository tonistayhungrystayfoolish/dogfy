import { DeliveryStatus, isValidDeliveryStatus } from "../../../src/domain/value-objects/delivery-status";

describe('DeliveryStatus Type and Validation', () => {
  it('should have the correct status values', () => {
    expect(DeliveryStatus.CREATED).toBe('created');
    expect(DeliveryStatus.SHIPPED).toBe('shipped');
    expect(DeliveryStatus.IN_TRANSIT).toBe('in_transit');
    expect(DeliveryStatus.DELIVERED).toBe('delivered');
    expect(DeliveryStatus.FAILED).toBe('failed');
  });

  it('should return true for valid delivery status', () => {
    expect(isValidDeliveryStatus('created')).toBe(true);
    expect(isValidDeliveryStatus('shipped')).toBe(true);
    expect(isValidDeliveryStatus('in_transit')).toBe(true);
    expect(isValidDeliveryStatus('delivered')).toBe(true);
    expect(isValidDeliveryStatus('failed')).toBe(true);
  });

  it('should return false for invalid delivery status', () => {
    expect(isValidDeliveryStatus('invalid')).toBe(false);
    expect(isValidDeliveryStatus('processing')).toBe(false);
    expect(isValidDeliveryStatus('')).toBe(false);
  });

  it('should return false for non-string values', () => {
    expect(isValidDeliveryStatus(123 as any)).toBe(false);
    expect(isValidDeliveryStatus(null as any)).toBe(false);
  });
});
