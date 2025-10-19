import { Address } from "../../../src/domain/value-objects/address";

describe('Address Value Object', () => {
  describe('constructor', () => {
    it('should create an Address with valid values', () => {
      const address = new Address(
        '123 Main St',
        'New York',
        'NY',
        'USA',
        '10001'
      );

      expect(address.street).toBe('123 Main St');
      expect(address.city).toBe('New York');
      expect(address.state).toBe('NY');
      expect(address.country).toBe('USA');
      expect(address.zip).toBe('10001');
    });

    it('should throw an error when street is empty', () => {
      expect(() => {
        new Address('', 'New York', 'NY', 'USA', '10001');
      }).toThrow('Street is required');
    });

    it('should throw an error when city is empty', () => {
      expect(() => {
        new Address('123 Main St', '', 'NY', 'USA', '10001');
      }).toThrow('City is required');
    });

    it('should throw an error when state is empty', () => {
      expect(() => {
        new Address('123 Main St', 'New York', '', 'USA', '10001');
      }).toThrow('State is required');
    });

    it('should throw an error when country is empty', () => {
      expect(() => {
        new Address('123 Main St', 'New York', 'NY', '', '10001');
      }).toThrow('Country is required');
    });

    it('should throw an error when zip is empty', () => {
      expect(() => {
        new Address('123 Main St', 'New York', 'NY', 'USA', '');
      }).toThrow('ZIP code is required');
    });

    it('should throw an error when any field contains only whitespace', () => {
      expect(() => {
        new Address('   ', 'New York', 'NY', 'USA', '10001');
      }).toThrow('Street is required');

      expect(() => {
        new Address('123 Main St', '   ', 'NY', 'USA', '10001');
      }).toThrow('City is required');

      expect(() => {
        new Address('123 Main St', 'New York', '   ', 'USA', '10001');
      }).toThrow('State is required');

      expect(() => {
        new Address('123 Main St', 'New York', 'NY', '   ', '10001');
      }).toThrow('Country is required');

      expect(() => {
        new Address('123 Main St', 'New York', 'NY', 'USA', '   ');
      }).toThrow('ZIP code is required');
    });
  });

  describe('fullAddress', () => {
    it('should return formatted full address', () => {
      const address = new Address(
        '123 Main St',
        'New York',
        'NY',
        'USA',
        '10001'
      );

      expect(address.fullAddress).toBe('123 Main St, New York, NY 10001, USA');
    });
  });

  describe('equals', () => {
    it('should return true when comparing identical addresses', () => {
      const address1 = new Address('123 Main St', 'New York', 'NY', 'USA', '10001');
      const address2 = new Address('123 Main St', 'New York', 'NY', 'USA', '10001');
      
      expect(address1.equals(address2)).toBe(true);
    });

    it('should return false when comparing different addresses', () => {
      const address1 = new Address('123 Main St', 'New York', 'NY', 'USA', '10001');
      const address2 = new Address('456 Oak Ave', 'New York', 'NY', 'USA', '10001');
      const address3 = new Address('123 Main St', 'Los Angeles', 'CA', 'USA', '90001');
      
      expect(address1.equals(address2)).toBe(false);
      expect(address1.equals(address3)).toBe(false);
    });

    it('should return false when comparing with non-Address object', () => {
      const address = new Address('123 Main St', 'New York', 'NY', 'USA', '10001');
      const mockObject = {
        street: '123 Main St',
        city: 'New York',
        state: 'NY',
        country: 'USA',
        zip: '10001'
      };
      
      // TypeScript will prevent this, but testing the method implementation
      // @ts-ignore - we're testing the internal logic
      expect(address.equals(mockObject)).toBe(false);
    });
  });
});