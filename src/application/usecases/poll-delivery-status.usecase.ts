import { DeliveryStatusService } from '../services/delivery-status.service';


export class PollDeliveryStatusUseCase {
  constructor(private readonly deliveryStatusService: DeliveryStatusService) {}

  async execute(deliveryId: string): Promise<void> {
    await this.deliveryStatusService.pollDeliveryStatus(deliveryId);
  }


  async executeForAllActiveDeliveries(): Promise<void> {
    await this.deliveryStatusService.pollAllActiveDeliveries();
  }
}
