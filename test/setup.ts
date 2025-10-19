import { expect } from '@jest/globals';

jest.setTimeout(30000);

const originalConsole = { ...console };

beforeAll(() => {
  console.log = jest.fn();
  console.error = jest.fn();
  console.warn = jest.fn();
});

afterAll(() => {
  console.log = originalConsole.log;
  console.error = originalConsole.error;
  console.warn = originalConsole.warn;
});

expect.extend({
  toBeValidDeliveryId(received: any) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    const pass = typeof received === 'string' && uuidRegex.test(received);
    
    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid delivery ID`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid delivery ID`,
        pass: false,
      };
    }
  },
});