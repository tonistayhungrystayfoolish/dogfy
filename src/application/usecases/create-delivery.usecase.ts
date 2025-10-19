import { Delivery } from '@/domain/delivery';
import { DeliveryRepository } from '@/domain/interfaces/delivery.repository';
import { ShippingProviderSelectionService } from '@/domain/services/provider-selection.service';
import { ShipmentContent } from '@/domain/shipment-content';
import { Address } from '@/domain/value-objects/address';
import { OrderId } from '@/domain/value-objects/order-id';
import { DuplicateOrderError } from '@/domain/errors/duplicate-order-error';

interface CreateDeliveryCommand {
  orderId: OrderId;
  sender: Address;
  recipient: Address;
  shippingContent: ShipmentContent;
}

export class CreateDeliveryUseCase {
  constructor(
    readonly deliveryRepo: DeliveryRepository,
    readonly providerSelectionService: ShippingProviderSelectionService,
  ) {}

  async execute(command: CreateDeliveryCommand): Promise<Delivery> {
    const existingDelivery = await this.deliveryRepo.findByOrderId(command.orderId.value);
    if (existingDelivery) {
      throw new DuplicateOrderError(command.orderId.value);
    }

    const provider = this.providerSelectionService.selectProvider(
      command.shippingContent.dimensions,
    );

    const shippingLabel = await provider.createShippingLabel(
      command.sender,
      command.recipient,
      command.shippingContent,
    );

    const delivery = Delivery.create(
      command.orderId,
      provider.name,
      shippingLabel,
      command.sender,
      command.recipient,
      command.shippingContent,
    );

    await this.deliveryRepo.save(delivery);

    return delivery;
  }
}
