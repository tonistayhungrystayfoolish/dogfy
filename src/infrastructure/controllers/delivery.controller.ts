import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { CreateDeliveryUseCase } from '@/application/usecases/create-delivery.usecase';
import { GetDeliveryStatusUseCase } from '@/application/usecases/get-delivery-status.usecase';
import { DeliveryId } from '@/domain/value-objects/delivery-id';

import { z } from 'zod';
import {
  mapCreateDeliveryRequestToCommand,
  mapDeliveryToCreateDeliveryResponse,
} from './mappers/create-delivery.mapper';
import {
  CreateDeliveryRequest,
  CreateDeliveryRequestSchema,
} from './dtos/create-delivery-request.dto';

export class DeliveryController {
  constructor(
    private readonly createDeliveryUseCase: CreateDeliveryUseCase,
    private readonly getDeliveryStatusUseCase: GetDeliveryStatusUseCase,
  ) {}

  async createDelivery(
    request: FastifyRequest<{ Body: CreateDeliveryRequest }>,
    reply: FastifyReply,
  ) {
    const command = mapCreateDeliveryRequestToCommand(request.body);
    const delivery = await this.createDeliveryUseCase.execute(command);
    const response = mapDeliveryToCreateDeliveryResponse(delivery);
    return reply.code(201).send(response);
  }

  async getDeliveryStatus(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ): Promise<void> {
    const { id } = request.params;
    const deliveryId = new DeliveryId(id);
    const deliveryStatus = await this.getDeliveryStatusUseCase.execute(deliveryId);

    return reply.code(200).send({
      deliveryId: deliveryId.value,
      status: deliveryStatus,
      lastUpdated: new Date().toISOString(),
    });
  }

  static registerRoutes(
    fastify: FastifyInstance,
    createDeliveryUseCase: CreateDeliveryUseCase,
    getDeliveryStatusUseCase: GetDeliveryStatusUseCase,
  ): void {
    const controller = new DeliveryController(createDeliveryUseCase, getDeliveryStatusUseCase);

    fastify.post(
      '/deliveries',
      {
        schema: {
          body: CreateDeliveryRequestSchema,
        },
      },
      controller.createDelivery.bind(controller),
    );

    fastify.get(
      '/deliveries/:id/status',
      {
        schema: {
          params: z.object({
            id: z.string().min(1, 'Delivery ID is required'),
          }),
        },
      },
      async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
        await controller.getDeliveryStatus(request, reply);
      },
    );
  }
}
