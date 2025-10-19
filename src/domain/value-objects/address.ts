export class Address {
   constructor(
    readonly street: string,
    readonly city: string,
    readonly state: string,
    readonly country: string,
    readonly zip: string,
  ) {
    const fields = [
      { value: street, name: 'Street' },
      { value: city, name: 'City' },
      { value: state, name: 'State' },
      { value: country, name: 'Country' },
      { value: zip, name: 'ZIP code' },
    ];

    for (const field of fields) {
      this.validateField(field.value, field.name);
    }
  }

  private validateField(value: string, fieldName: string): void {
    if (!value?.trim()) {
      throw new Error(`${fieldName} is required`);
    }
  }

  get fullAddress(): string {
    return `${this.street}, ${this.city}, ${this.state} ${this.zip}, ${this.country}`;
  }

  equals(other: Address): boolean {
    return (
      other instanceof Address &&
      this.street === other.street &&
      this.city === other.city &&
      this.state === other.state &&
      this.country === other.country &&
      this.zip === other.zip
    );
  }
}
