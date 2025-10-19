import { Dimensions } from '../../../domain/value-objects/dimensions';
import { DimensionsDocument } from '../schemas/dimensions.schema';

export class DimensionsMapper {
  static toDomain(document: DimensionsDocument): Dimensions {
    return new Dimensions(document.length, document.width, document.height, document.weight);                         
  }

  static toPersistence(dimensions: Dimensions): DimensionsDocument {
    return {
      length: dimensions.length,
      width: dimensions.width,
      height: dimensions.height,
      weight: dimensions.weight,
    };
  }
}
