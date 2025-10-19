/**
 * Global teardown for integration tests
 * Stops and removes the MongoDB container after all tests complete
 * Cleans up global variables
 */
export default async function globalTeardown(): Promise<void> {
  console.log('Stopping MongoDB container.');

  try {
    const container = global.__MONGO_CONTAINER__;

    if (container) {
      await container.stop();
      console.log('MongoDB container stopped successfully');
      console.log(`Container ID: ${container.getId()}`);
    } else {
      console.warn(' No container found to stop');
    }
  } catch (error) {

    console.error('Failed to stop MongoDB container');
    console.error('Error details:', error);
    console.error('Container may need manual cleanup');
  } finally {
    global.__MONGO_CONTAINER__ = undefined;
    global.__MONGO_URI__ = undefined;
  }
}
