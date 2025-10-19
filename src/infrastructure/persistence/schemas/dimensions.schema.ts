import { Schema } from 'mongoose';

export const DimensionsSchema = new Schema({
  length: { type: Number, required: true },
  width: { type: Number, required: true },
  height: { type: Number, required: true },
  weight: { type: Number, required: true }
});

export interface DimensionsDocument {
  length: number;
  width: number;
  height: number;
  weight: number;
}