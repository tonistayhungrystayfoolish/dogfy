import { ShippingProviderRepository } from '@/domain/repositories/shipping-provider-repository';
import { ShippingProvider } from '@/domain/interfaces/shipping.provider';
import { NRWShippingProvider } from '../providers/NRW-shipping.provider';
import { TLSShippingProvider } from '../providers/TLS-shipping.provider';

export class ShippingProviderRepositoryImpl implements ShippingProviderRepository {
  private readonly providers: ShippingProvider[];

  constructor() {
    this.providers = [new NRWShippingProvider(), new TLSShippingProvider()];
  }

  findAll(): ShippingProvider[] {
    return [...this.providers];
  }
}
