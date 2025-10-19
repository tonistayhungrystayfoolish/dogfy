export const DeliveryStatus = {
  CREATED: 'created',
  SHIPPED: 'shipped',
  IN_TRANSIT: 'in_transit',
  DELIVERED: 'delivered',
  FAILED: 'failed',
} as const;

export type DeliveryStatus = (typeof DeliveryStatus)[keyof typeof DeliveryStatus];

export const isValidDeliveryStatus = (value: string): value is DeliveryStatus => {
  return Object.values(DeliveryStatus).includes(value as DeliveryStatus);
};
