import { MongoDBContainer, StartedMongoDBContainer } from '@testcontainers/mongodb';

/**
 * Global setup for integration tests
 * Starts a MongoDB container before all tests run
 * Stores container instance and connection URI in global variables
 */
export default async function globalSetup(): Promise<void> {
  console.log('Starting MongoDB container for integration tests...');

  try {
    const container: StartedMongoDBContainer = await new MongoDBContainer('mongo:7.0').start();
    global.__MONGO_CONTAINER__ = container;
    const baseUri = container.getConnectionString();
    global.__MONGO_URI__ = baseUri.includes('?')
      ? `${baseUri}&directConnection=true`
      : `${baseUri}?directConnection=true`;

    console.log(' MongoDB container started successfully');
    console.log(`Connection URI: ${global.__MONGO_URI__}`);
    console.log(`Container ID: ${container.getId()}`);
  } catch (error) {
    console.error('Failed to start MongoDB container');
    console.error('Ensure Docker is running and accessible');
    console.error('Error details:', error);
    throw error;
  }
}
