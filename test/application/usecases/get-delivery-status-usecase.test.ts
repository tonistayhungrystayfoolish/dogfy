import { GetDeliveryStatusUseCase } from '../../../src/application/usecases/get-delivery-status.usecase';
import { DeliveryRepository } from '../../../src/domain/interfaces/delivery.repository';
import { DeliveryId } from '../../../src/domain/value-objects/delivery-id';
import { createMockDeliveryRepository, createMockDelivery } from '../../mocks/mocks';

describe('GetDeliveryStatusUseCase', () => {
  let getDeliveryStatusUseCase: GetDeliveryStatusUseCase;
  let deliveryRepository: jest.Mocked<DeliveryRepository>;

  beforeEach(() => {
    deliveryRepository = createMockDeliveryRepository();
    getDeliveryStatusUseCase = new GetDeliveryStatusUseCase(deliveryRepository);
  });

  describe('execute', () => {
    it('should return delivery status for existing delivery', async () => {
      const deliveryId = new DeliveryId('delivery-123');
      const mockDelivery = createMockDelivery({ status: 'delivered' });

      deliveryRepository.findById.mockResolvedValue(mockDelivery);

      const result = await getDeliveryStatusUseCase.execute(deliveryId);

      expect(deliveryRepository.findById).toHaveBeenCalledWith(deliveryId);
      expect(result).toBe('delivered');
    });

    it('should throw error when delivery is not found', async () => {
      const deliveryId = new DeliveryId('non-existent-delivery');
      deliveryRepository.findById.mockResolvedValue(null);

      await expect(getDeliveryStatusUseCase.execute(deliveryId)).rejects.toThrow(
        'Delivery not found',
      );
    });
  });
});
