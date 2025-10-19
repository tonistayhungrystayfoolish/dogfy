import { Delivery } from '../delivery';
import { TrackingId } from '../value-objects/tracking-id';
import { DeliveryId } from '../value-objects/delivery-id';
import { DeliveryStatus } from '../value-objects/delivery-status';

export interface DeliveryRepository {
  save(delivery: Delivery): Promise<void>;
  findById(id: DeliveryId): Promise<Delivery | null>;
  findByOrderId(orderId: string): Promise<Delivery | null>;
  findByTrackingId(trackingId: TrackingId): Promise<Delivery | null>;
  updateStatus(id: DeliveryId, status: DeliveryStatus): Promise<void>;
  findActiveDeliveries(): Promise<Delivery[]>;
}
