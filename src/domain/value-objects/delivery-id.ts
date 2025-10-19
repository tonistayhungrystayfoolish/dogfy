import { randomUUID } from 'crypto';

export class DeliveryId {
   constructor(readonly value: string) {
    if (!value?.trim()) {
      throw new Error('DeliveryId cannot be empty');
    }
  }

  static create(): DeliveryId {
    return new DeliveryId(randomUUID());
  }
  
  static fromString(value: string): DeliveryId {
    if (!value || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)) {
      throw new Error('Invalid UUID format');
    }
    return new DeliveryId(value);
  }

  equals(other: DeliveryId): boolean {
    return other instanceof DeliveryId && this.value === other.value;
  }
  
  toString(): string {
    return this.value;
  }
}
