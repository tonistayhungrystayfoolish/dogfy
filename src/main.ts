import 'dotenv/config';
import fastify from 'fastify';
import { serializerCompiler, validatorCompiler } from 'fastify-type-provider-zod';
import { CreateDeliveryUseCase } from './application/usecases/create-delivery.usecase';
import { GetDeliveryStatusUseCase } from './application/usecases/get-delivery-status.usecase';
import { UpdateDeliveryStatusWebhookUseCase } from './application/usecases/update-delivery-status-webhook.usecase';
import { PollDeliveryStatusUseCase } from './application/usecases/poll-delivery-status.usecase';
import { MongoDbDeliveryRepositoryImpl } from './infrastructure/persistence/repositories/mongodb-delivery-repository.impl';
import { ShippingProviderRepositoryImpl } from './infrastructure/repositories/shipping-provider-repository.impl';
import { ProviderSelectionService } from './domain/services/provider-selection.service';
import { MongoDBConnection } from './infrastructure/persistence/mongodb-connection';
import { DeliveryController } from './infrastructure/controllers/delivery.controller';
import { ErrorHandler } from './infrastructure/controllers/error-handler';
import { DeliveryStatusService } from './application/services/delivery-status.service';
import { DeliveryPollingTask } from './infrastructure/scheduler/delivery-polling.task';
import { NRWShippingProvider } from './infrastructure/providers/NRW-shipping.provider';
import { TLSShippingProvider } from './infrastructure/providers/TLS-shipping.provider';
import { WebhookController } from './infrastructure/controllers/webhook.controller';

async function bootstrap() {
  const mongoDBConnection = MongoDBConnection.getInstance();
  await mongoDBConnection.connect();

  const deliveryRepository = new MongoDbDeliveryRepositoryImpl();
  const shippingProviderRepository = new ShippingProviderRepositoryImpl();

  const providerSelectionService = new ProviderSelectionService(shippingProviderRepository);

  const createDeliveryUseCase = new CreateDeliveryUseCase(
    deliveryRepository,
    providerSelectionService,
  );

  const getDeliveryStatusUseCase = new GetDeliveryStatusUseCase(deliveryRepository);

  const shippingProviders = [new NRWShippingProvider(), new TLSShippingProvider()];
  const deliveryStatusService = new DeliveryStatusService(deliveryRepository, shippingProviders);

  const updateDeliveryStatusWebhookUseCase = new UpdateDeliveryStatusWebhookUseCase(
    deliveryStatusService,
  );
  const pollDeliveryStatusUseCase = new PollDeliveryStatusUseCase(deliveryStatusService);

  const server = fastify({
    logger: true,
  });

  server.setValidatorCompiler(validatorCompiler);
  server.setSerializerCompiler(serializerCompiler);

  ErrorHandler.setupErrorHandler(server);

  DeliveryController.registerRoutes(server, createDeliveryUseCase, getDeliveryStatusUseCase);
  WebhookController.registerRoutes(server, updateDeliveryStatusWebhookUseCase);

  const pollingTask = new DeliveryPollingTask(pollDeliveryStatusUseCase);

  pollingTask.startPolling(60 * 60 * 1000);

  const port = parseInt(process.env.PORT || '3000', 10);
  try {
    await server.listen({ port, host: '0.0.0.0' });
    console.log(`Delivery microservice listening on port ${port}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
}

bootstrap().catch((err) => {
  console.error('Failed to start delivery microservice:', err);
  process.exit(1);
});
