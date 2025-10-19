import { ShippingLabel } from '../../../src/domain/value-objects/shipping-label';
import { TrackingId } from '../../../src/domain/value-objects/tracking-id';

describe('ShippingLabel Value Object', () => {
  it('should create a ShippingLabel with valid content and tracking ID', () => {
    const trackingId = new TrackingId('tracking-123');
    const generatedAt = new Date();
    const shippingLabel = new ShippingLabel('label content', trackingId, generatedAt);

    expect(shippingLabel.content).toBe('label content');
    expect(shippingLabel.trackingId).toBe(trackingId);
    expect(shippingLabel.generatedAt).toBe(generatedAt);
  });

  it('should use current date if no generatedAt is provided', () => {
    const trackingId = new TrackingId('tracking-123');
    const before = new Date();
    const shippingLabel = new ShippingLabel('label content', trackingId);
    const after = new Date();

    expect(shippingLabel.generatedAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
    expect(shippingLabel.generatedAt.getTime()).toBeLessThanOrEqual(after.getTime());
  });

  it('should throw an error when content is empty', () => {
    const trackingId = new TrackingId('tracking-123');
    expect(() => new ShippingLabel('', trackingId)).toThrow('Shipping label content is required');
  });

  it('should throw an error when content is null', () => {
    const trackingId = new TrackingId('tracking-123');
    expect(() => new ShippingLabel(null as any, trackingId)).toThrow(
      'Shipping label content is required',
    );
  });

  it('should throw an error when content is undefined', () => {
    const trackingId = new TrackingId('tracking-123');
    expect(() => new ShippingLabel(undefined as any, trackingId)).toThrow(
      'Shipping label content is required',
    );
  });

  it('should throw an error when content contains only whitespace', () => {
    const trackingId = new TrackingId('tracking-123');
    expect(() => new ShippingLabel('   ', trackingId)).toThrow(
      'Shipping label content is required',
    );
  });

  it('should return formatted string representation', () => {
    const trackingId = new TrackingId('ABC123XYZ');
    const generatedAt = new Date('2023-01-01T10:00:00Z');
    const shippingLabel = new ShippingLabel('sample label content', trackingId, generatedAt);

    const result = shippingLabel.toString();
    expect(result).toContain('sample label content');
    expect(result).toContain('Tracking ID: ABC123XYZ');
    expect(result).toContain('Generated: 2023-01-01T10:00:00.000Z');
  });
});
