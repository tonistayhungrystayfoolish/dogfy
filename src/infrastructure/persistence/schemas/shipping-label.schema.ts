import { Schema } from 'mongoose';

export const ShippingLabelSchema = new Schema({
  trackingNumber: { type: String, required: true },
  labelUrl: { type: String, required: true },
  generatedAt: { type: Date, required: true, default: Date.now }
});

export interface ShippingLabelDocument {
  trackingNumber: string;
  labelUrl: string;
  generatedAt: Date;
}