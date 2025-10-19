import { TrackingId } from './tracking-id';

export class ShippingLabel {
  constructor(
    readonly content: string,
    readonly trackingId: TrackingId,
    readonly generatedAt: Date = new Date(),
  ) {
    if (!content?.trim()) {
      throw new Error('Shipping label content is required');
    }
  }

  toString(): string {
    return `${this.content}\nTracking ID: ${this.trackingId.value}\nGenerated: ${this.generatedAt.toISOString()}`;
  }
}
