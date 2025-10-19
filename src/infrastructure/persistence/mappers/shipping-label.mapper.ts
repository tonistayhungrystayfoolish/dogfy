import { ShippingLabel } from '../../../domain/value-objects/shipping-label';
import { TrackingId } from '../../../domain/value-objects/tracking-id';
import { ShippingLabelDocument } from '../schemas/shipping-label.schema';

export class ShippingLabelMapper {
  static toDomain(document: ShippingLabelDocument): ShippingLabel {
    return new ShippingLabel(
      document.labelUrl,
      new TrackingId(document.trackingNumber),
      document.generatedAt,
    );
  }

  static toPersistence(shippingLabel: ShippingLabel): ShippingLabelDocument {
    return {
      trackingNumber: shippingLabel.trackingId.value,
      labelUrl: shippingLabel.content,
      generatedAt: shippingLabel.generatedAt,
    };
  }
}
