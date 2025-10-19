import { FastifyInstance } from 'fastify';
import { DuplicateOrderError } from '@/domain/errors/duplicate-order-error';

export class ErrorHandler {
  static setupErrorHandler(fastify: FastifyInstance): void {
    fastify.setErrorHandler((error, _, reply) => {
      console.error('Error occurred:', error);

      if (error.validation) {
        return reply.code(400).send({
          error: 'Validation failed',
          message: error.message,
          details: error.validation,
        });
      }

      if ((error as any).code === 11000) {
        const field = (error as any).keyPattern
          ? Object.keys((error as any).keyPattern)[0]
          : 'field';
        return reply.code(409).send({
          error: 'Conflict',
          message: `Delivery already exists for this ${field}`,
        });
      }

      if (error instanceof DuplicateOrderError) {
        return reply.code(409).send({
          error: 'Conflict',
          message: error.message,
        });
      }

      if (error instanceof Error) {
        const message = error.message.toLowerCase();

        if (message.includes('validation') || message.includes('required')) {
          return reply.code(400).send({ error: error.message });
        }
        if (message.includes('not found') || message.includes('does not exist')) {
          return reply.code(404).send({ error: error.message });
        }
        if (message.includes('duplicate') || message.includes('already exists')) {
          return reply.code(409).send({ error: error.message });
        }
        if (message.includes('unauthorized') || message.includes('forbidden')) {
          return reply.code(403).send({ error: error.message });
        }
      }

      return reply.code(500).send({ error: 'Internal server error' });
    });

    fastify.setNotFoundHandler((_, reply) => {
      reply.code(404).send({ error: 'Route not found' });
    });
  }
}
