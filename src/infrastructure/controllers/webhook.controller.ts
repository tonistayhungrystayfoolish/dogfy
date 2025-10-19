import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { UpdateDeliveryStatusWebhookUseCase } from '@/application/usecases/update-delivery-status-webhook.usecase';
import { TrackingId } from '@/domain/value-objects/tracking-id';
import { TLSWebhookPayload, TLSWebhookPayloadSchema } from './dtos/tls-webhook-payload.dto';

export class WebhookController {
  constructor(
    private readonly updateDeliveryStatusWebhookUseCase: UpdateDeliveryStatusWebhookUseCase,
  ) {}

  async handleTLSWebhook(
    request: FastifyRequest<{ Body: TLSWebhookPayload }>,
    reply: FastifyReply,
  ): Promise<void> {
    const { trackingId, status } = request.body;

    const trackingIdVO = new TrackingId(trackingId);
    await this.updateDeliveryStatusWebhookUseCase.execute(trackingIdVO, status);

    return reply.code(200).send({ success: true });
  }

  static registerRoutes(
    fastify: FastifyInstance,
    updateDeliveryStatusWebhookUseCase: UpdateDeliveryStatusWebhookUseCase,
  ): void {
    const controller = new WebhookController(updateDeliveryStatusWebhookUseCase);

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
