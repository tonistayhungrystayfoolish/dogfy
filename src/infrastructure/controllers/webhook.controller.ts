import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { UpdateDeliveryStatusUseCase } from '@/application/usecases/update-delivery-status.usecase';
import { TrackingId } from '@/domain/value-objects/tracking-id';
import { TLSWebhookPayload, TLSWebhookPayloadSchema } from './dtos/tls-webhook-payload.dto';

export class WebhookController {
  constructor(private readonly updateDeliveryStatusUseCase: UpdateDeliveryStatusUseCase) {}

  async handleTLSWebhook(
    request: FastifyRequest<{ Body: TLSWebhookPayload }>,
    reply: FastifyReply,
  ): Promise<void> {
    const { trackingId, status } = request.body;

    const trackingIdVO = new TrackingId(trackingId);
    await this.updateDeliveryStatusUseCase.executeFromWebhook(trackingIdVO, status);

    return reply.code(200).send({ success: true });
  }

  static registerRoutes(
    fastify: FastifyInstance,
    updateDeliveryStatusUseCase: UpdateDeliveryStatusUseCase,
  ): void {
    const controller = new WebhookController(updateDeliveryStatusUseCase);

    fastify.post(
      '/webhooks/tls/status',
      {
        schema: {
          body: TLSWebhookPayloadSchema,
        },
      },
      controller.handleTLSWebhook.bind(controller),
    );
  }
}
