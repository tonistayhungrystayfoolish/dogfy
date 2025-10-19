import { OrderItem } from '../../src/domain/order-item';
import { ItemId } from '../../src/domain/value-objects/item-id';

describe('OrderItem', () => {
  it('should create an order item with valid properties', () => {
    const orderItem = new OrderItem(new ItemId('item-123'), 'SKU123', 'Test Item', 1, 1.5);

    expect(orderItem.itemId.value).toBe('item-123');
    expect(orderItem.sku).toBe('SKU123');
    expect(orderItem.name).toBe('Test Item');
    expect(orderItem.quantity).toBe(1);
    expect(orderItem.unitWeight).toBe(1.5);
  });

  it('should throw error for empty itemId', () => {
    expect(() => new OrderItem(new ItemId(''), 'SKU123', 'Test Item', 1, 1.5)).toThrow(
      'ItemId cannot be empty',
    );
  });

  it('should throw error for empty sku', () => {
    expect(() => new OrderItem(new ItemId('item-123'), '', 'Test Item', 1, 1.5)).toThrow(
      'SKU is required',
    );
  });

  it('should throw error for empty name', () => {
    expect(() => new OrderItem(new ItemId('item-123'), 'SKU123', '', 1, 1.5)).toThrow(
      'Item name is required',
    );
  });

  it('should throw error for zero quantity', () => {
    expect(() => new OrderItem(new ItemId('item-123'), 'SKU123', 'Test Item', 0, 1.5)).toThrow(
      'Quantity must be a positive integer',
    );
  });

  it('should throw error for negative quantity', () => {
    expect(() => new OrderItem(new ItemId('item-123'), 'SKU123', 'Test Item', -1, 1.5)).toThrow(
      'Quantity must be a positive integer',
    );
  });

  it('should throw error for non-integer quantity', () => {
    expect(() => new OrderItem(new ItemId('item-123'), 'SKU123', 'Test Item', 1.5, 1.5)).toThrow(
      'Quantity must be a positive integer',
    );
  });

  it('should throw error for zero unit weight', () => {
    expect(() => new OrderItem(new ItemId('item-123'), 'SKU123', 'Test Item', 1, 0)).toThrow(
      'Unit weight must be a positive number',
    );
  });

  it('should throw error for negative unit weight', () => {
    expect(() => new OrderItem(new ItemId('item-123'), 'SKU123', 'Test Item', 1, -1.5)).toThrow(
      'Unit weight must be a positive number',
    );
  });

  it('should accept valid order item with trimmed strings', () => {
    expect(
      () => new OrderItem(new ItemId('  item-123  '), '  SKU123  ', '  Test Item  ', 1, 1.5),
    ).not.toThrow();
  });

  it('should accept valid positive integer quantity', () => {
    expect(
      () => new OrderItem(new ItemId('item-123'), 'SKU123', 'Test Item', 5, 1.5),
    ).not.toThrow();
  });

  it('should accept valid positive decimal unit weight', () => {
    expect(
      () => new OrderItem(new ItemId('item-123'), 'SKU123', 'Test Item', 1, 0.5),
    ).not.toThrow();
  });
});
