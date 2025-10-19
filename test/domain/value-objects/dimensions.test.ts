import { Dimensions } from "../../../src/domain/value-objects/dimensions";

describe('Dimensions Value Object', () => {
  it('should create Dimensions with valid values', () => {
    const dimensions = new Dimensions(10, 5, 3, 2.5);

    expect(dimensions.length).toBe(10);
    expect(dimensions.width).toBe(5);
    expect(dimensions.height).toBe(3);
    expect(dimensions.weight).toBe(2.5);
  });

  it('should throw an error when length is zero or negative', () => {
    expect(() => new Dimensions(0, 5, 3, 2.5)).toThrow('Length must be greater than zero');
    expect(() => new Dimensions(-1, 5, 3, 2.5)).toThrow('Length must be greater than zero');
  });

  it('should throw an error when width is zero or negative', () => {
    expect(() => new Dimensions(10, 0, 3, 2.5)).toThrow('Width must be greater than zero');
    expect(() => new Dimensions(10, -1, 3, 2.5)).toThrow('Width must be greater than zero');
  });

  it('should throw an error when height is zero or negative', () => {
    expect(() => new Dimensions(10, 5, 0, 2.5)).toThrow('Height must be greater than zero');
    expect(() => new Dimensions(10, 5, -1, 2.5)).toThrow('Height must be greater than zero');
  });

  it('should throw an error when weight is zero or negative', () => {
    expect(() => new Dimensions(10, 5, 3, 0)).toThrow('Weight must be greater than zero');
    expect(() => new Dimensions(10, 5, 3, -1)).toThrow('Weight must be greater than zero');
  });

  it('should calculate the correct volume', () => {
    const dimensions = new Dimensions(10, 5, 3, 2.5);
    expect(dimensions.volume).toBe(150);
  });

  it('should return formatted string representation', () => {
    const dimensions = new Dimensions(10, 5, 3, 2.5);
    expect(dimensions.toString()).toBe('10x5x3 (2.5kg)');
  });

  it('should return true when comparing identical dimensions', () => {
    const dims1 = new Dimensions(10, 5, 3, 2.5);
    const dims2 = new Dimensions(10, 5, 3, 2.5);
    expect(dims1.equals(dims2)).toBe(true);
  });

  it('should return false when comparing different dimensions', () => {
    const dims1 = new Dimensions(10, 5, 3, 2.5);
    expect(dims1.equals(new Dimensions(11, 5, 3, 2.5))).toBe(false);
    expect(dims1.equals(new Dimensions(10, 6, 3, 2.5))).toBe(false);
  });
});
