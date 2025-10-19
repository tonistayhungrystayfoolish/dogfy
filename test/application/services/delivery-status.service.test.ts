import { DeliveryStatusService } from '../../../src/application/services/delivery-status.service';
import {
  createMockDeliveryRepository,
  createMockShippingProvider,
  createMockDelivery,
} from '../../mocks/mocks';

describe('DeliveryStatusService', () => {
  let service: DeliveryStatusService;
  let mockRepo: ReturnType<typeof createMockDeliveryRepository>;
  let mockProvider: ReturnType<typeof createMockShippingProvider>;

  beforeEach(() => {
    mockRepo = createMockDeliveryRepository();
    mockProvider = createMockShippingProvider();
    service = new DeliveryStatusService(mockRepo, [mockProvider]);
  });

  describe('pollDeliveryStatus', () => {
    it('should throw an error when delivery is not found', async () => {
      mockRepo.findById.mockResolvedValue(null);

      await expect(service.pollDeliveryStatus('delivery-123')).rejects.toThrow(
        'Delivery with ID delivery-123 not found',
      );
    });

    it('should throw an error when shipping provider is not found', async () => {
      const delivery = createMockDelivery({ providerName: 'UnknownProvider' });
      mockRepo.findById.mockResolvedValue(delivery);

      await expect(service.pollDeliveryStatus('delivery-123')).rejects.toThrow(
        'Shipping provider for delivery delivery-123 not found',
      );
    });

    it('should return early if provider supports webhooks', async () => {
      const delivery = createMockDelivery({ providerName: 'TestProvider' });
      mockRepo.findById.mockResolvedValue(delivery);
      mockProvider.supportWebhooks.mockReturnValue(true);

      await service.pollDeliveryStatus('delivery-123');

      expect(mockProvider.getDeliveryStatus).not.toHaveBeenCalled();
      expect(mockRepo.save).not.toHaveBeenCalled();
    });

    it('should poll delivery status and update if changed', async () => {
      const delivery = createMockDelivery({ status: 'shipped', providerName: 'TestProvider' });
      mockRepo.findById.mockResolvedValue(delivery);
      mockProvider.supportWebhooks.mockReturnValue(false);
      mockProvider.getDeliveryStatus.mockResolvedValue('delivered');

      await service.pollDeliveryStatus('delivery-123');

      expect(mockProvider.getDeliveryStatus).toHaveBeenCalled();
      expect(mockRepo.save).toHaveBeenCalledWith(delivery);
    });

    it('should not update delivery status if unchanged', async () => {
      const delivery = createMockDelivery({ status: 'shipped', providerName: 'TestProvider' });
      mockRepo.findById.mockResolvedValue(delivery);
      mockProvider.supportWebhooks.mockReturnValue(false);
      mockProvider.getDeliveryStatus.mockResolvedValue('shipped');

      await service.pollDeliveryStatus('delivery-123');

      expect(mockProvider.getDeliveryStatus).toHaveBeenCalled();
      expect(mockRepo.save).not.toHaveBeenCalled();
    });

    it('should handle error during status polling', async () => {
      const delivery = createMockDelivery({ providerName: 'TestProvider' });
      mockRepo.findById.mockResolvedValue(delivery);
      mockProvider.supportWebhooks.mockReturnValue(false);
      mockProvider.getDeliveryStatus.mockRejectedValue(new Error('Provider unavailable'));

      await expect(service.pollDeliveryStatus('delivery-123')).resolves.not.toThrow();
      expect(mockRepo.save).not.toHaveBeenCalled();
    });
  });

  describe('pollAllActiveDeliveries', () => {
    it('should poll status for all active deliveries', async () => {
      const delivery1 = createMockDelivery({ providerName: 'TestProvider' });
      const delivery2 = createMockDelivery({ providerName: 'TestProvider' });
      mockRepo.findActiveDeliveries.mockResolvedValue([delivery1, delivery2]);
      mockRepo.findById.mockResolvedValue(delivery1);
      mockProvider.supportWebhooks.mockReturnValue(false);
      mockProvider.getDeliveryStatus.mockResolvedValue('delivered');

      await service.pollAllActiveDeliveries();

      expect(mockRepo.findActiveDeliveries).toHaveBeenCalled();
      expect(mockProvider.getDeliveryStatus).toHaveBeenCalledTimes(2);
    });

    it('should handle empty active deliveries list', async () => {
      mockRepo.findActiveDeliveries.mockResolvedValue([]);

      await service.pollAllActiveDeliveries();

      expect(mockRepo.findActiveDeliveries).toHaveBeenCalled();
      expect(mockProvider.getDeliveryStatus).not.toHaveBeenCalled();
    });
  });
});
