import { Schema } from 'mongoose';

export const OrderItemSchema = new Schema({
  itemId: { type: String, required: true },
  sku: { type: String, required: true },
  name: { type: String, required: true },
  quantity: { type: Number, required: true },
  unitWeight: { type: Number, required: true }
});

export interface OrderItemDocument {
  itemId: string;
  sku: string;
  name: string;
  quantity: number;
  unitWeight: number;
}