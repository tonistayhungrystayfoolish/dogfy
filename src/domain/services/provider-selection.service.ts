import { ShippingProvider } from '../interfaces/shipping.provider';
import { Dimensions } from '../value-objects/dimensions';
import { ShippingProviderRepository } from '../repositories/shipping-provider-repository';

export interface ShippingProviderSelectionService {
  selectProvider(dimensions: Dimensions): ShippingProvider;
}

export class ProviderSelectionService implements ShippingProviderSelectionService {
  private static readonly WEIGHT_THRESHOLD = 20;
  private static readonly HEAVY_PROVIDER = 'NRW';
  private static readonly LIGHT_PROVIDER = 'TLS';

  private readonly providers: ShippingProvider[];

  constructor(providerRepository: ShippingProviderRepository) {
    this.providers = providerRepository.findAll();
    this.validateProviders();
  }

  selectProvider(dimensions: Dimensions): ShippingProvider {
    const providerName = this.getProviderName(dimensions.weight);
    return this.findProvider(providerName);
  }

  private validateProviders(): void {
    if (this.providers.length === 0) {
      throw new Error('At least one shipping provider is required');
    }
  }

  private getProviderName(weight: number): string {
    return weight > ProviderSelectionService.WEIGHT_THRESHOLD
      ? ProviderSelectionService.HEAVY_PROVIDER
      : ProviderSelectionService.LIGHT_PROVIDER;
  }

  private findProvider(name: string): ShippingProvider {
    const provider = this.providers.find((p) => p.name === name);

    if (!provider) {
      throw new Error(`No shipping provider found for preferred name: ${name}`);
    }

    return provider;
  }
}
