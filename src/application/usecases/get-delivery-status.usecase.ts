import { DeliveryRepository } from '@/domain/interfaces/delivery.repository';
import { DeliveryId } from '@/domain/value-objects/delivery-id';

export class GetDeliveryStatusUseCase {
  constructor(readonly deliveryRepo: DeliveryRepository) {}

  async execute(deliveryId: DeliveryId) {
    const delivery = await this.deliveryRepo.findById(deliveryId);
    if (!delivery) {
      throw new Error('Delivery not found');
    }
    return delivery.status;
  }
}
