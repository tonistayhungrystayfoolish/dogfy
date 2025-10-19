import { Schema, model, Document } from 'mongoose';
import { AddressDocument, AddressSchema } from './adress.schema';
import { ShipmentContentDocument, ShipmentContentSchema } from './shipment-content.schema';
import { ShippingLabelDocument, ShippingLabelSchema } from './shipping-label.schema';

export const DeliverySchema = new Schema({
  id: { type: String, required: true, unique: true },
  orderId: { type: String, required: true, unique: true },
  status: { type: String, required: true },
  providerName: { type: String, required: true },
  sender: { type: AddressSchema, required: true },
  recipient: { type: AddressSchema, required: true },
  content: { type: ShipmentContentSchema, required: true },
  shippingLabel: { type: ShippingLabelSchema, required: true },
  createdAt: { type: Date, required: true, default: Date.now },
  updatedAt: { type: Date, required: true, default: Date.now },
});

DeliverySchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

export interface DeliveryDocument extends Document {
  id: string;
  orderId: string;
  status: string;
  providerName: string;
  sender: AddressDocument;
  recipient: AddressDocument;
  content: ShipmentContentDocument;
  shippingLabel: ShippingLabelDocument;
  createdAt: Date;
  updatedAt: Date;
}

export const DeliveryModel = model<DeliveryDocument>('Delivery', DeliverySchema);
