import { Schema } from 'mongoose';

export const AddressSchema = new Schema<AddressDocument>({
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  country: { type: String, required: true },
  zip: { type: String, required: true },
});

export interface AddressDocument {
  street: string;
  city: string;
  state: string;
  country: string;
  zip: string;
}