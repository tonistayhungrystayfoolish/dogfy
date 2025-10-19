import { TLSShippingProvider } from '../../../src/infrastructure/providers/TLS-shipping.provider';
import { Address } from '../../../src/domain/value-objects/address';
import { ShipmentContent } from '../../../src/domain/shipment-content';
import { OrderItem } from '../../../src/domain/order-item';
import { Dimensions } from '../../../src/domain/value-objects/dimensions';
import { ItemId } from '../../../src/domain/value-objects/item-id';

describe('TLSShippingProvider', () => {
  let provider: TLSShippingProvider;
  let sender: Address;
  let recipient: Address;
  let content: ShipmentContent;

  beforeEach(() => {
    provider = new TLSShippingProvider();
    sender = new Address('Sender St 123', 'Barcelona', 'Catalonia', 'Spain', '08001');
    recipient = new Address('Recipient Ave 456', 'Madrid', 'Madrid', 'Spain', '28001');

    const items = [
      new OrderItem(new ItemId('item-1'), 'SKU-001', 'Product 1', 2, 1.5),
      new OrderItem(new ItemId('item-2'), 'SKU-002', 'Product 2', 1, 2.0),
    ];
    const dimensions = new Dimensions(30, 20, 15, 5.0);
    content = new ShipmentContent(items, 'box', dimensions);
  });

  describe('name', () => {
    it('should have correct provider name', () => {
      expect(provider.name).toBe('TLS');
    });
  });

  describe('createShippingLabel', () => {
    it('should create a shipping label with all required information', async () => {
      const label = await provider.createShippingLabel(sender, recipient, content);

      expect(label).toBeDefined();
      expect(label.content).toBeDefined();
      expect(label.trackingId).toBeDefined();
    });

    it('should include TLS branding in label', async () => {
      const label = await provider.createShippingLabel(sender, recipient, content);

      expect(label.content).toContain('TLS Shipping Label');
    });

    it('should include tracking ID in label content', async () => {
      const label = await provider.createShippingLabel(sender, recipient, content);

      expect(label.content).toContain('Tracking:');
      expect(label.content).toContain(label.trackingId.value);
    });

    it('should include sender address in label', async () => {
      const label = await provider.createShippingLabel(sender, recipient, content);

      expect(label.content).toContain('From:');
      expect(label.content).toContain('Sender St 123');
      expect(label.content).toContain('Barcelona');
      expect(label.content).toContain('Spain');
    });

    it('should include recipient address in label', async () => {
      const label = await provider.createShippingLabel(sender, recipient, content);

      expect(label.content).toContain('To:');
      expect(label.content).toContain('Recipient Ave 456');
      expect(label.content).toContain('Madrid');
      expect(label.content).toContain('Spain');
    });

    it('should include packaging type in label', async () => {
      const label = await provider.createShippingLabel(sender, recipient, content);

      expect(label.content).toContain('Packaging:');
      expect(label.content).toContain('box');
    });

    it('should include total weight in label', async () => {
      const label = await provider.createShippingLabel(sender, recipient, content);

      expect(label.content).toContain('Weight:');
      expect(label.content).toContain('5kg');
    });

    it('should include dimensions in label', async () => {
      const label = await provider.createShippingLabel(sender, recipient, content);

      expect(label.content).toContain('Dimensions:');
      expect(label.content).toContain('30');
      expect(label.content).toContain('20');
      expect(label.content).toContain('15');
    });

    it('should generate unique tracking IDs for different labels', async () => {
      const label1 = await provider.createShippingLabel(sender, recipient, content);
      const label2 = await provider.createShippingLabel(sender, recipient, content);

      expect(label1.trackingId.value).not.toBe(label2.trackingId.value);
    });

    it('should handle envelope packaging type', async () => {
      const envelopeItems = [new OrderItem(new ItemId('item-1'), 'SKU-001', 'Document', 1, 0.1)];
      const envelopeDimensions = new Dimensions(25, 18, 2, 0.1);
      const envelopeContent = new ShipmentContent(envelopeItems, 'envelope', envelopeDimensions);

      const label = await provider.createShippingLabel(sender, recipient, envelopeContent);

      expect(label.content).toContain('Packaging: envelope');
      expect(label.content).toContain('Weight: 0.1kg');
    });
  });
});
