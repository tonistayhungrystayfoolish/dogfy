import { OrderItem } from '../../src/domain/order-item';
import { ShipmentContent } from '../../src/domain/shipment-content';
import { Dimensions } from '../../src/domain/value-objects/dimensions';
import { ItemId } from '../../src/domain/value-objects/item-id';
import { createMockDimensions, createMockOrderItem } from '../mocks/mocks';

describe('ShipmentContent Domain Entity', () => {
  it('should create a ShipmentContent with valid values', () => {
    const items = [createMockOrderItem(), createMockOrderItem()];
    const dimensions = createMockDimensions();

    const content = new ShipmentContent(items, 'box', dimensions);

    expect(content.items).toEqual(items);
    expect(content.packagingType).toBe('box');
    expect(content.dimensions).toBe(dimensions);
  });

  it('should throw an error when items array is empty', () => {
    expect(() => new ShipmentContent([], 'box', createMockDimensions())).toThrow(
      'Shipment content must have at least one item',
    );
  });

  it('should accept different packaging types', () => {
    const items = [createMockOrderItem()];

    const content1 = new ShipmentContent(items, 'box', createMockDimensions());
    expect(content1.packagingType).toBe('box');

    const content2 = new ShipmentContent(items, 'envelope', createMockDimensions());
    expect(content2.packagingType).toBe('envelope');
  });

  it('should calculate the correct total weight', () => {
    const items = [
      new OrderItem(new ItemId('item-1'), 'SKU-001', 'Product 1', 2, 1.5), // 3
      new OrderItem(new ItemId('item-2'), 'SKU-002', 'Product 2', 1, 2.0), // 2
      new OrderItem(new ItemId('item-3'), 'SKU-003', 'Product 3', 3, 0.5), // 1.5
    ];

    const content = new ShipmentContent(items, 'box', createMockDimensions());
    expect(content.totalWeight).toBe(6.5);
  });

  it('should return 0 when there is only one item', () => {
    const items = [new OrderItem(new ItemId('item-1'), 'SKU-001', 'Product 1', 2, 1.5)];
    const content = new ShipmentContent(items, 'box', createMockDimensions());

    expect(content.totalWeight).toBe(3);
  });

  it('should return true when comparing identical shipment contents', () => {
    const items1 = [createMockOrderItem(), createMockOrderItem()];
    const items2 = [createMockOrderItem(), createMockOrderItem()];
    const dimensions = createMockDimensions();

    const content1 = new ShipmentContent(items1, 'box', dimensions);
    const content2 = new ShipmentContent(items2, 'box', dimensions);

    expect(content1.equals(content2)).toBe(true);
  });

  it('should return false when comparing different packaging types', () => {
    const items = [createMockOrderItem()];
    const dimensions = createMockDimensions();

    const content1 = new ShipmentContent(items, 'box', dimensions);
    const content2 = new ShipmentContent(items, 'envelope', dimensions);

    expect(content1.equals(content2)).toBe(false);
  });

  it('should return false when comparing different dimensions', () => {
    const items = [createMockOrderItem()];

    const content1 = new ShipmentContent(items, 'box', new Dimensions(10, 5, 3, 2.5));
    const content2 = new ShipmentContent(items, 'box', new Dimensions(12, 6, 4, 3.0));

    expect(content1.equals(content2)).toBe(false);
  });

  it('should return false when comparing different item counts', () => {
    const dimensions = createMockDimensions();

    const content1 = new ShipmentContent([createMockOrderItem()], 'box', dimensions);
    const content2 = new ShipmentContent(
      [createMockOrderItem(), createMockOrderItem()],
      'box',
      dimensions,
    );

    expect(content1.equals(content2)).toBe(false);
  });

  it('should return false when comparing different items', () => {
    const items1 = [
      new OrderItem(new ItemId('item-1'), 'SKU-001', 'Product 1', 2, 1.5),
      new OrderItem(new ItemId('item-2'), 'SKU-002', 'Product 2', 1, 2.0),
    ];

    const items2 = [
      new OrderItem(new ItemId('item-1'), 'SKU-001', 'Product 1', 2, 1.5),
      new OrderItem(new ItemId('item-3'), 'SKU-003', 'Product 3', 1, 2.0),
    ];

    const dimensions = createMockDimensions();
    const content1 = new ShipmentContent(items1, 'box', dimensions);
    const content2 = new ShipmentContent(items2, 'box', dimensions);

    expect(content1.equals(content2)).toBe(false);
  });

  it('should handle items in different order', () => {
    const items1 = [
      new OrderItem(new ItemId('item-2'), 'SKU-002', 'Product 2', 1, 2.0),
      new OrderItem(new ItemId('item-1'), 'SKU-001', 'Product 1', 2, 1.5),
    ];

    const items2 = [
      new OrderItem(new ItemId('item-1'), 'SKU-001', 'Product 1', 2, 1.5),
      new OrderItem(new ItemId('item-2'), 'SKU-002', 'Product 2', 1, 2.0),
    ];

    const dimensions = createMockDimensions();
    const content1 = new ShipmentContent(items1, 'box', dimensions);
    const content2 = new ShipmentContent(items2, 'box', dimensions);

    expect(content1.equals(content2)).toBe(true);
  });

  it('should return false when comparing with non-ShipmentContent object', () => {
    const content = new ShipmentContent([createMockOrderItem()], 'box', createMockDimensions());

    // @ts-ignore - testing runtime behavior
    expect(content.equals({ items: [], packagingType: 'box' })).toBe(false);
  });
});
