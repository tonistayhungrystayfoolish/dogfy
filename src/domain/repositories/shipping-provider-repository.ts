import { ShippingProvider } from '../interfaces/shipping.provider';

export interface ShippingProviderRepository {
  findAll(): ShippingProvider[];
}
