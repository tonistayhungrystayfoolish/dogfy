export class Dimensions {
   constructor(
    readonly length: number,
    readonly width: number,
    readonly height: number,
    readonly weight: number,
  ) {
    this.validate();
  }

  private validate(): void {
    const fields = [
      { value: this.length, name: 'Length' },
      { value: this.width, name: 'Width' },
      { value: this.height, name: 'Height' },
      { value: this.weight, name: 'Weight' },
    ];

    for (const field of fields) {
      if (field.value <= 0) {
        throw new Error(`${field.name} must be greater than zero`);
      }
    }
  }

  get volume(): number {
    return this.length * this.width * this.height;
  }

  toString(): string {
    return `${this.length}x${this.width}x${this.height} (${this.weight}kg)`;
  }

  equals(other: Dimensions): boolean {
    return (
      other instanceof Dimensions &&
      this.length === other.length &&
      this.width === other.width &&
      this.height === other.height &&
      this.weight === other.weight
    );
  }
}
