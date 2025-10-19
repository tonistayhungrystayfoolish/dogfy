import { ProviderSelectionService } from '../../../src/domain/services/provider-selection.service';
import { Dimensions } from '../../../src/domain/value-objects/dimensions';
import {
  createMockShippingProvider,
  createMockShippingProviderRepository,
} from '../../mocks/mocks';

describe('ProviderSelectionService', () => {
  let mockRepo: ReturnType<typeof createMockShippingProviderRepository>;
  let nrwProvider: ReturnType<typeof createMockShippingProvider>;
  let tlsProvider: ReturnType<typeof createMockShippingProvider>;

  beforeEach(() => {
    nrwProvider = { ...createMockShippingProvider(), name: 'NRW' };
    tlsProvider = { ...createMockShippingProvider(), name: 'TLS' };
    mockRepo = createMockShippingProviderRepository();
    mockRepo.findAll.mockReturnValue([nrwProvider, tlsProvider]);
  });

  describe('constructor', () => {
    it('should initialize with providers from repository', () => {
      new ProviderSelectionService(mockRepo);
      expect(mockRepo.findAll).toHaveBeenCalled();
    });

    it('should throw an error when no providers are available', () => {
      mockRepo.findAll.mockReturnValue([]);
      expect(() => new ProviderSelectionService(mockRepo)).toThrow(
        'At least one shipping provider is required',
      );
    });
  });

  describe('selectProvider', () => {
    it('should select NRW provider for heavy packages (weight > 20)', () => {
      const service = new ProviderSelectionService(mockRepo);
      const provider = service.selectProvider(new Dimensions(10, 10, 10, 25));
      expect(provider.name).toBe('NRW');
    });

    it('should select TLS provider for light packages (weight <= 20)', () => {
      const service = new ProviderSelectionService(mockRepo);
      const provider = service.selectProvider(new Dimensions(10, 10, 10, 15));
      expect(provider.name).toBe('TLS');
    });

    it('should select TLS provider for packages with weight equal to threshold', () => {
      const service = new ProviderSelectionService(mockRepo);
      const provider = service.selectProvider(new Dimensions(10, 10, 10, 20));
      expect(provider.name).toBe('TLS');
    });

    it('should throw an error when no provider is found for the selected name', () => {
      const otherProvider = { ...createMockShippingProvider(), name: 'OTHER' };
      mockRepo.findAll.mockReturnValue([otherProvider]);
      const service = new ProviderSelectionService(mockRepo);

      expect(() => service.selectProvider(new Dimensions(10, 10, 10, 25))).toThrow(
        'No shipping provider found for preferred name: NRW',
      );
    });
  });

  describe('weight threshold behavior', () => {
    it('should select NRW for weights just above threshold', () => {
      const service = new ProviderSelectionService(mockRepo);
      const provider = service.selectProvider(new Dimensions(10, 10, 10, 20.1));
      expect(provider.name).toBe('NRW');
    });

    it('should select TLS for weights just below threshold', () => {
      const service = new ProviderSelectionService(mockRepo);
      const provider = service.selectProvider(new Dimensions(10, 10, 10, 19.9));
      expect(provider.name).toBe('TLS');
    });
  });
});
