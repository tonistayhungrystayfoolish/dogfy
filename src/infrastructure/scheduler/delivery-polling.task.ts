import { UpdateDeliveryStatusUseCase } from '@/application/usecases/update-delivery-status.usecase';
import { PollingConfig } from '@/infrastructure/config/polling.config';


export class DeliveryPollingTask {
  private pollingInterval: NodeJS.Timeout | null = null;

  constructor(private readonly updateDeliveryStatusUseCase: UpdateDeliveryStatusUseCase) {}

  startPolling(intervalMs: number = PollingConfig.getPollingInterval()): void {
    if (this.pollingInterval) {
      this.stopPolling();
    }

    console.log(
      `Starting delivery status polling every ${PollingConfig.formatInterval(intervalMs)} (${intervalMs}ms)`,
    );
    console.log(`   Polling applies to: NRW (non-webhook providers)`);
    console.log(`   Skipping: TLS (webhook-based providers)`);

    this.pollingInterval = setInterval(async () => {
      try {
        await this.updateDeliveryStatusUseCase.executeFromPollingAll();
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
      await this.updateDeliveryStatusUseCase.executeFromPollingAll();
      console.log('One-time delivery status polling completed');
    } catch (error) {
      console.error('One-time delivery status polling failed:', error);
      throw error;
    }
  }
}
