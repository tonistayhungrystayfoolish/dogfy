import fastify, { FastifyInstance } from 'fastify';
import { serializerCompiler, validatorCompiler } from 'fastify-type-provider-zod';
import { CreateDeliveryUseCase } from '../../../src/application/usecases/create-delivery.usecase';
import { GetDeliveryStatusUseCase } from '../../../src/application/usecases/get-delivery-status.usecase';
import { UpdateDeliveryStatusWebhookUseCase } from '../../../src/application/usecases/update-delivery-status-webhook.usecase';
import { PollDeliveryStatusUseCase } from '../../../src/application/usecases/poll-delivery-status.usecase';
import { MongoDbDeliveryRepositoryImpl } from '../../../src/infrastructure/persistence/repositories/mongodb-delivery-repository.impl';
import { ShippingProviderRepositoryImpl } from '../../../src/infrastructure/repositories/shipping-provider-repository.impl';
import { ProviderSelectionService } from '../../../src/domain/services/provider-selection.service';
import { DeliveryController } from '../../../src/infrastructure/controllers/delivery.controller';
import { WebhookController } from '../../../src/infrastructure/controllers/webhook.controller';
import { ErrorHandler } from '../../../src/infrastructure/controllers/error-handler';
import { DeliveryStatusService } from '../../../src/application/services/delivery-status.service';
import { DeliveryPollingTask } from '../../../src/infrastructure/scheduler/delivery-polling.task';
import { NRWShippingProvider } from '../../../src/infrastructure/providers/NRW-shipping.provider';
import { TLSShippingProvider } from '../../../src/infrastructure/providers/TLS-shipping.provider';

/**
 * E2E Server Helper
 * Manages Fastify server lifecycle for end-to-end tests
 *
 * This helper class provides methods to start and stop a real Fastify server
 * with all dependencies initialized, allowing E2E tests to make actual HTTP requests.
 */
export class E2EServerHelper {
  private server: FastifyInstance | null = null;
  private serverUrl: string = '';
  private pollingTask: DeliveryPollingTask | null = null;

  /**
   * Start the Fastify server on a random available port
   * Initializes all dependencies (repositories, use cases, controllers, polling task)
   * Registers all routes (delivery routes and webhook routes)
   *
   * @returns The server URL (e.g., http://localhost:12345)
   */
  async start(): Promise<string> {
    // Initialize repositories
    const deliveryRepository = new MongoDbDeliveryRepositoryImpl();
    const shippingProviderRepository = new ShippingProviderRepositoryImpl();

    // Initialize services
    const providerSelectionService = new ProviderSelectionService(shippingProviderRepository);

    // Initialize shipping providers and unified delivery status service
    const shippingProviders = [new NRWShippingProvider(), new TLSShippingProvider()];
    const deliveryStatusService = new DeliveryStatusService(deliveryRepository, shippingProviders);

    // Initialize use cases
    const createDeliveryUseCase = new CreateDeliveryUseCase(
      deliveryRepository,
      providerSelectionService,
    );
    const getDeliveryStatusUseCase = new GetDeliveryStatusUseCase(deliveryRepository);
    const updateDeliveryStatusWebhookUseCase = new UpdateDeliveryStatusWebhookUseCase(
      deliveryStatusService,
    );
    const pollDeliveryStatusUseCase = new PollDeliveryStatusUseCase(deliveryStatusService);

    // Initialize Fastify server
    this.server = fastify({
      logger: false, // Disable logging in tests for cleaner output
    });

    // Setup Zod type provider
    this.server.setValidatorCompiler(validatorCompiler);
    this.server.setSerializerCompiler(serializerCompiler);

    // Setup centralized error handling
    ErrorHandler.setupErrorHandler(this.server);

    // Register routes
    DeliveryController.registerRoutes(this.server, createDeliveryUseCase, getDeliveryStatusUseCase);
    WebhookController.registerRoutes(this.server, updateDeliveryStatusWebhookUseCase);

    // Initialize polling task (but do NOT start automatic polling)
    this.pollingTask = new DeliveryPollingTask(pollDeliveryStatusUseCase);

    // Start server on random port (port 0)
    const address = await this.server.listen({ port: 0, host: '127.0.0.1' });
    this.serverUrl = address;

    return this.serverUrl;
  }

  /**
   * Stop the Fastify server gracefully
   * Cleans up resources and stops any running polling tasks
   */
  async stop(): Promise<void> {
    // Stop polling task if running
    if (this.pollingTask) {
      this.pollingTask.stopPolling();
      this.pollingTask = null;
    }

    // Close server
    if (this.server) {
      await this.server.close();
      this.server = null;
      this.serverUrl = '';
    }
  }

  /**
   * Get the server URL
   *
   * @returns The server URL (e.g., http://localhost:12345)
   * @throws {Error} If server is not started
   */
  getServerUrl(): string {
    if (!this.serverUrl) {
      throw new Error('Server is not started. Call start() first.');
    }
    return this.serverUrl;
  }

  /**
   * Get the polling task instance for manual triggering in tests
   *
   * @returns The DeliveryPollingTask instance
   * @throws {Error} If server is not started or polling task is not initialized
   */
  getPollingTask(): DeliveryPollingTask {
    if (!this.pollingTask) {
      throw new Error('Polling task is not initialized. Call start() first.');
    }
    return this.pollingTask;
  }
}
