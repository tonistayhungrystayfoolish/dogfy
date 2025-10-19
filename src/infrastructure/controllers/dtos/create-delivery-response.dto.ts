export interface CreateDeliveryResponse {
  deliveryId: string;
  shippingLabel: {
    provider: string;
    trackingNumber: string;
    labelUrl: string;
  };
  status: string;
}
