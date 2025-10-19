import { ShippingProviderRepositoryImpl } from '../../../src/infrastructure/repositories/shipping-provider-repository.impl';
import { ShippingProviderRepository } from '../../../src/domain/repositories/shipping-provider-repository';


describe('ShippingProviderRepository Integration Tests', () => {
  let shippingProviderRepository: ShippingProviderRepository;

  beforeEach(() => {
    shippingProviderRepository = new ShippingProviderRepositoryImpl();
  });

  describe('findAll', () => {
    it('should return all configured shipping providers', () => {
      const providers = shippingProviderRepository.findAll();

      expect(providers).toBeDefined();
      expect(Array.isArray(providers)).toBe(true);
      expect(providers.length).toBeGreaterThan(0);
    });

    it('should return providers with required properties', () => {
      const providers = shippingProviderRepository.findAll();

      providers.forEach((provider) => {
        expect(provider.name).toBeDefined();
        expect(typeof provider.name).toBe('string');
        expect(provider.createShippingLabel).toBeDefined();
        expect(typeof provider.createShippingLabel).toBe('function');
        expect(provider.supportWebhooks).toBeDefined();
        expect(typeof provider.supportWebhooks).toBe('function');
        expect(provider.getDeliveryStatus).toBeDefined();
        expect(typeof provider.getDeliveryStatus).toBe('function');
      });
    });

    it('should include expected provider names', () => {
      const providers = shippingProviderRepository.findAll();
      const providerNames = providers.map((p) => p.name);

      expect(providerNames).toContain('NRW');
      expect(providerNames).toContain('TLS');
    });
  });

  describe('provider functionality', () => {
    it('should have working provider methods', async () => {
      const providers = shippingProviderRepository.findAll();
      expect(providers.length).toBeGreaterThan(0);

      const provider = providers[0];
      expect(provider).toBeDefined();

      const supportsWebhooks = provider!.supportWebhooks();
      expect(typeof supportsWebhooks).toBe('boolean');
    });
  });
});
