import { randomUUID } from 'crypto';

export class TrackingId {
  constructor(readonly value: string) {
    if (!value?.trim()) {
      throw new Error('TrackingId cannot be empty');
    }
  }

  static create(): TrackingId {
    return new TrackingId(randomUUID());
  }

  equals(other: TrackingId): boolean {
    return other instanceof TrackingId && this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
