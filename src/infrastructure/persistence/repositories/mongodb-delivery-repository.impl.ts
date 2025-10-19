import { DeliveryRepository } from '@/domain/interfaces/delivery.repository';
import { Delivery } from '@/domain/delivery';
import { DeliveryMapper } from '../mappers/delivery.mapper';
import { DeliveryModel } from '../schemas/delivery.schema';
import { TrackingId } from '@/domain/value-objects/tracking-id';
import { DeliveryId } from '@/domain/value-objects/delivery-id';
import { DeliveryStatus } from '@/domain/value-objects/delivery-status';

export class MongoDbDeliveryRepositoryImpl implements DeliveryRepository {
  async save(delivery: Delivery): Promise<void> {
    const deliveryDoc = DeliveryMapper.toPersistence(delivery);
    await DeliveryModel.replaceOne({ id: delivery.id.value }, deliveryDoc, { upsert: true });
  }

  async findById(id: DeliveryId): Promise<Delivery | null> {
    const doc = await DeliveryModel.findOne({ id: id.value });
    return doc ? DeliveryMapper.toDomain(doc) : null;
  }

  async findByOrderId(orderId: string): Promise<Delivery | null> {
    const doc = await DeliveryModel.findOne({ orderId: orderId });
    return doc ? DeliveryMapper.toDomain(doc) : null;
  }

  async findByTrackingId(trackingId: TrackingId): Promise<Delivery | null> {
    const doc = await DeliveryModel.findOne({ 'shippingLabel.trackingNumber': trackingId.value });
    return doc ? DeliveryMapper.toDomain(doc) : null;
  }

  async updateStatus(id: DeliveryId, status: DeliveryStatus): Promise<void> {
    await DeliveryModel.updateOne({ id: id.value }, { status: status });
  }

  async findActiveDeliveries(): Promise<Delivery[]> {
    const docs = await DeliveryModel.find({
      status: { $ne: DeliveryStatus.DELIVERED },
    });
    return docs.map((doc) => DeliveryMapper.toDomain(doc));
  }
}
