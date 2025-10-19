import { OrderId } from "../../../src/domain/value-objects/order-id";

describe('OrderId Value Object', () => {
  it('should create an OrderId with a valid value', () => {
    const orderId = new OrderId('valid-order-id-123');
    expect(orderId.value).toBe('valid-order-id-123');
  });

  it('should throw an error when value is empty string', () => {
    expect(() => new OrderId('')).toThrow('OrderId must be a non-empty string');
  });

  it('should throw an error when value is null', () => {
    expect(() => new OrderId(null as unknown as string)).toThrow(
      'OrderId must be a non-empty string',
    );
  });

  it('should throw an error when value is undefined', () => {
    expect(() => new OrderId(undefined as unknown as string)).toThrow(
      'OrderId must be a non-empty string',
    );
  });

  it('should throw an error when value contains only whitespace', () => {
    expect(() => new OrderId('   ')).toThrow('OrderId must be a non-empty string');
  });

  it('should throw an error when value is not a string', () => {
    expect(() => new OrderId(123 as unknown as string)).toThrow(
      'OrderId must be a non-empty string',
    );
  });

  it('should return true when comparing identical OrderIds', () => {
    const id1 = new OrderId('same-order-id');
    const id2 = new OrderId('same-order-id');
    expect(id1.equals(id2)).toBe(true);
  });

  it('should return false when comparing different OrderIds', () => {
    const id1 = new OrderId('order-id-1');
    const id2 = new OrderId('order-id-2');
    expect(id1.equals(id2)).toBe(false);
  });

  it('should return false when comparing with non-OrderId object', () => {
    const id1 = new OrderId('same-id');
    expect(id1.equals({ value: 'same-id' } as unknown as OrderId)).toBe(false);
  });
});
