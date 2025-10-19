import { PollDeliveryStatusUseCase } from '@/application/usecases/poll-delivery-status.usecase';

export class DeliveryPollingTask {
  private pollingInterval: NodeJS.Timeout | null = null;

  constructor(private readonly pollDeliveryStatusUseCase: PollDeliveryStatusUseCase) {}

  startPolling(intervalMs: number = 60000): void {
    if (this.pollingInterval) {
      this.stopPolling();
    }

    console.log(`Starting delivery status polling every ${intervalMs}ms`);

    this.pollingInterval = setInterval(async () => {
      try {
        await this.pollDeliveryStatusUseCase.executeForAllActiveDeliveries();
        console.log('Delivery status polling completed successfully');
      } catch (error) {
        console.error('Delivery status polling failed:', error);
      }
    }, intervalMs);
  }

  stopPolling(): void {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
      console.log('Delivery status polling stopped');
    }
  }

  async runOnce(): Promise<void> {
    try {
      await this.pollDeliveryStatusUseCase.executeForAllActiveDeliveries();
      console.log('One-time delivery status polling completed');
    } catch (error) {
      console.error('One-time delivery status polling failed:', error);
      throw error;
    }
  }
}
