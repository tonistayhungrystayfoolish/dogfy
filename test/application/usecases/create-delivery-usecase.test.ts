import { CreateDeliveryUseCase } from '../../../src/application/usecases/create-delivery.usecase';
import { Delivery } from '../../../src/domain/delivery';
import { DeliveryRepository } from '../../../src/domain/interfaces/delivery.repository';
import { ShippingProvider } from '../../../src/domain/interfaces/shipping.provider';
import { ShippingProviderSelectionService } from '../../../src/domain/services/provider-selection.service';
import {
  createMockDeliveryRepository,
  createMockShippingProvider,
  createMockProviderSelectionService,
  createMockOrderId,
  createMockAddress,
  createMockShipmentContent,
  createMockShippingLabel,
} from '../../mocks/mocks';

describe('CreateDeliveryUseCase', () => {
  let createDeliveryUseCase: CreateDeliveryUseCase;
  let deliveryRepository: jest.Mocked<DeliveryRepository>;
  let providerSelectionService: jest.Mocked<ShippingProviderSelectionService>;
  let mockShippingProvider: jest.Mocked<ShippingProvider>;

  beforeEach(() => {
    deliveryRepository = createMockDeliveryRepository();
    mockShippingProvider = createMockShippingProvider();
    providerSelectionService = createMockProviderSelectionService();

    providerSelectionService.selectProvider.mockReturnValue(mockShippingProvider);

    createDeliveryUseCase = new CreateDeliveryUseCase(deliveryRepository, providerSelectionService);
  });

  describe('execute', () => {
    it('should create a delivery successfully', async () => {
      const request = {
        orderId: createMockOrderId(),
        sender: createMockAddress(),
        recipient: createMockAddress(),
        shippingContent: createMockShipmentContent(),
      };

      mockShippingProvider.createShippingLabel.mockResolvedValue(createMockShippingLabel());

      const result = await createDeliveryUseCase.execute(request);

      expect(providerSelectionService.selectProvider).toHaveBeenCalledWith(
        request.shippingContent.dimensions,
      );
      expect(mockShippingProvider.createShippingLabel).toHaveBeenCalledWith(
        request.sender,
        request.recipient,
        request.shippingContent,
      );
      expect(deliveryRepository.save).toHaveBeenCalledWith(result);
      expect(result).toBeInstanceOf(Delivery);
    });

    it('should handle shipping provider errors', async () => {
      const request = {
        orderId: createMockOrderId(),
        sender: createMockAddress(),
        recipient: createMockAddress(),
        shippingContent: createMockShipmentContent(),
      };

      mockShippingProvider.createShippingLabel.mockRejectedValue(new Error('Provider error'));

      await expect(createDeliveryUseCase.execute(request)).rejects.toThrow('Provider error');
      expect(deliveryRepository.save).not.toHaveBeenCalled();
    });
  });
});
