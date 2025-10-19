import { z } from 'zod';

const OrderItemSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  quantity: z.number().int().positive('Quantity must be a positive integer'),
  unitWeight: z.number().positive('Unit weight must be a positive number'),
});

const AddressSchema = z.object({
  street: z.string().min(1, 'Street is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  country: z.string().min(1, 'Country is required'),
  zipCode: z.string().min(1, 'ZIP code is required'),
});

const DimensionsSchema = z.object({
  length: z.number().positive('Length must be a positive number'),
  width: z.number().positive('Width must be a positive number'),
  height: z.number().positive('Height must be a positive number'),
  weight: z.number().positive('Weight must be a positive number'),
});

export const CreateDeliveryRequestSchema = z.object({
  orderId: z.string().min(1, 'Order ID is required'),
  sender: AddressSchema,
  recipient: AddressSchema,
  packagingType: z.string().min(1, 'Packaging type is required'),
  dimensions: DimensionsSchema,
  items: z.array(OrderItemSchema).min(1, 'At least one item is required'),
});

export type CreateDeliveryRequest = z.infer<typeof CreateDeliveryRequestSchema>;
