import { Address } from '../../../domain/value-objects/address';
import { AddressDocument } from '../schemas/adress.schema';

export class AddressMapper {
  static toDomain(document: AddressDocument): Address {
    return new Address(
      document.street,
      document.city,
      document.state,
      document.country,
      document.zip,
    );
  }

  static toPersistence(address: Address): AddressDocument {
    return {
      street: address.street,
      city: address.city,
      state: address.state,
      country: address.country,
      zip: address.zip,
    };
  }
}
