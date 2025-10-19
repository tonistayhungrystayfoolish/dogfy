import { Schema } from 'mongoose';
import { OrderItemSchema, OrderItemDocument } from './order-item.schema';
import { DimensionsSchema, DimensionsDocument } from './dimensions.schema';

export const ShipmentContentSchema = new Schema({
  items: { type: [OrderItemSchema], required: true },
  packagingType: { type: String, required: true, enum: ['box', 'envelope'] },
  dimensions: { type: DimensionsSchema, required: true },
  totalWeight: { type: Number, required: true },
});

export interface ShipmentContentDocument {
  items: OrderItemDocument[];
  packagingType: string;
  dimensions: DimensionsDocument;
  totalWeight: number;
}
