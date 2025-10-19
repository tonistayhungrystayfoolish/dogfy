# Infrastructure Integration Tests

This directory contains integration tests for the infrastructure layer using Testcontainers with real MongoDB instances.

## Overview

These tests verify that the infrastructure components (repositories, database connections) work correctly with actual MongoDB databases, providing confidence that the persistence layer functions as expected in production.

The testing infrastructure uses a single MongoDB container for the entire test suite, with automatic data cleanup between tests to ensure isolation. This approach provides fast, reliable integration tests without the complexity of managing test databases manually.

## Test Structure

```
test/infrastructure/
├── setup/                          # Test environment setup
│   ├── global-setup.ts            # Starts MongoDB container (once per suite)
│   ├── global-teardown.ts         # Stops MongoDB container (once per suite)
│   ├── jest.setup.ts              # Connects to MongoDB and clears data (per test file)
│   ├── test-database.helper.ts    # Utility functions for database operations
│   └── global.d.ts                # TypeScript global type definitions
├── repositories/                   # Repository integration tests
│   ├── delivery.repository.test.ts
│   └── shipping-provider.repository.test.ts
└── factories/                      # Test data factories for integration tests
    └── test-data.factory.ts
```

## Running Tests

### Prerequisites

- Docker must be running on your system
- Node.js dependencies installed (`pnpm install`)

### Commands

```bash
# Run all integration tests
npm run test:integration

# Run integration tests in watch mode
npm run test:integration:watch

# Run both unit and integration tests
npm run test:all

# Run only unit tests (existing)
npm run test:unit
```

## How It Works

The testing infrastructure follows a three-phase lifecycle:

### 1. Global Setup (Once per Test Suite)

When you run `npm run test:integration`, Jest executes `global-setup.ts` which:

- Starts a MongoDB container using `@testcontainers/mongodb`
- Waits for MongoDB to be ready
- Stores the container instance in `global.__MONGO_CONTAINER__`
- Stores the connection URI in `global.__MONGO_URI__`
- Takes ~3-5 seconds on subsequent runs (first run downloads the image)

### 2. Test File Execution (Per Test File)

For each test file, `jest.setup.ts` runs and:

- Connects to MongoDB using the URI from global setup
- Reuses the connection for all tests in the file
- Registers a `beforeEach` hook that clears all collections before each test
- Registers an `afterAll` hook that disconnects when the file completes

### 3. Global Teardown (Once per Test Suite)

After all tests complete, `global-teardown.ts`:

- Retrieves the container from `global.__MONGO_CONTAINER__`
- Stops and removes the container
- Cleans up resources

### Test Isolation

Each test gets a clean database state through collection clearing:

```typescript
beforeEach(async () => {
  // Automatically clears all collections before each test
  // No manual cleanup needed in your tests
});
```

This approach is:

- **Fast**: ~10-50ms per test vs ~3-5s for container restart
- **Simple**: No transaction management or complex rollback logic
- **Reliable**: Works with all MongoDB features and versions

## Writing Integration Tests

### Basic Test Structure

Here's a minimal example of an integration test:

```typescript
import { MongoDBDeliveryRepository } from '../../../src/infrastructure/persistence/repositories/mongodb-delivery-repository.impl';
import { TestDataFactory } from '../factories/test-data.factory';

describe('DeliveryRepository Integration Tests', () => {
  let repository: MongoDBDeliveryRepository;

  beforeAll(() => {
    // Initialize your repository
    repository = new MongoDBDeliveryRepository();
  });

  it('should save and retrieve a delivery', async () => {
    // Arrange: Create test data
    const delivery = TestDataFactory.createDelivery();

    // Act: Perform database operation
    await repository.save(delivery);
    const retrieved = await repository.findById(delivery.id);

    // Assert: Verify results
    expect(retrieved).toBeDefined();
    expect(retrieved?.id.value).toBe(delivery.id.value);
  });

  // Each test automatically starts with a clean database
  it('should handle multiple deliveries independently', async () => {
    const delivery1 = TestDataFactory.createDelivery();
    const delivery2 = TestDataFactory.createDelivery();

    await repository.save(delivery1);
    await repository.save(delivery2);

    const all = await repository.findAll();
    expect(all).toHaveLength(2);
  });
});
```

### Key Points

1. **No manual cleanup needed**: The `beforeEach` hook automatically clears collections
2. **Use test factories**: Create test data using `TestDataFactory` for consistency
3. **Test real operations**: No mocks - test against actual MongoDB
4. **Keep tests focused**: One operation or scenario per test

### Testing Repository CRUD Operations

```typescript
describe('Repository CRUD Operations', () => {
  let repository: MongoDBDeliveryRepository;

  beforeAll(() => {
    repository = new MongoDBDeliveryRepository();
  });

  it('should create a new delivery', async () => {
    const delivery = TestDataFactory.createDelivery();

    await repository.save(delivery);

    const found = await repository.findById(delivery.id);
    expect(found).toBeDefined();
  });

  it('should update an existing delivery', async () => {
    const delivery = TestDataFactory.createDelivery();
    await repository.save(delivery);

    delivery.updateStatus('IN_TRANSIT');
    await repository.save(delivery);

    const updated = await repository.findById(delivery.id);
    expect(updated?.status.value).toBe('IN_TRANSIT');
  });

  it('should delete a delivery', async () => {
    const delivery = TestDataFactory.createDelivery();
    await repository.save(delivery);

    await repository.delete(delivery.id);

    const found = await repository.findById(delivery.id);
    expect(found).toBeNull();
  });

  it('should return null for non-existent delivery', async () => {
    const nonExistentId = TestDataFactory.createDeliveryId();

    const found = await repository.findById(nonExistentId);

    expect(found).toBeNull();
  });
});
```

### Testing Complex Queries

```typescript
describe('Repository Query Methods', () => {
  let repository: MongoDBDeliveryRepository;

  beforeAll(() => {
    repository = new MongoDBDeliveryRepository();
  });

  it('should find deliveries by status', async () => {
    // Create test data with different statuses
    const pending = TestDataFactory.createDelivery({ status: 'PENDING' });
    const inTransit = TestDataFactory.createDelivery({ status: 'IN_TRANSIT' });
    const delivered = TestDataFactory.createDelivery({ status: 'DELIVERED' });

    await repository.save(pending);
    await repository.save(inTransit);
    await repository.save(delivered);

    // Query for specific status
    const activeDeliveries = await repository.findByStatus('IN_TRANSIT');

    expect(activeDeliveries).toHaveLength(1);
    expect(activeDeliveries[0].id.value).toBe(inTransit.id.value);
  });

  it('should find deliveries by date range', async () => {
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const today = new Date();

    const oldDelivery = TestDataFactory.createDelivery({ createdAt: yesterday });
    const newDelivery = TestDataFactory.createDelivery({ createdAt: today });

    await repository.save(oldDelivery);
    await repository.save(newDelivery);

    const recent = await repository.findByDateRange(today, new Date());

    expect(recent).toHaveLength(1);
    expect(recent[0].id.value).toBe(newDelivery.id.value);
  });
});
```

### Using Test Database Helper

For advanced scenarios, use `TestDatabaseHelper`:

```typescript
import { TestDatabaseHelper } from '../setup/test-database.helper';

describe('Advanced Database Operations', () => {
  it('should manually clear specific collection', async () => {
    // Setup: Create data in multiple collections
    await repository.save(TestDataFactory.createDelivery());

    // Clear only the deliveries collection
    await TestDatabaseHelper.clearCollection('deliveries');

    const deliveries = await repository.findAll();
    expect(deliveries).toHaveLength(0);
  });

  it('should check connection state', () => {
    expect(TestDatabaseHelper.isConnected()).toBe(true);
  });

  it('should access raw connection for custom operations', async () => {
    const connection = TestDatabaseHelper.getConnection();
    const collections = await connection.db.collections();

    expect(collections).toBeDefined();
  });
});
```

### Best Practices

1. **Use descriptive test names**: Clearly state what is being tested
2. **Follow AAA pattern**: Arrange, Act, Assert
3. **Test one thing per test**: Keep tests focused and simple
4. **Use factories for test data**: Ensures consistency and reduces boilerplate
5. **Test edge cases**: Null values, empty results, validation errors
6. **Don't test Mongoose**: Focus on your repository logic, not the framework
7. **Keep tests fast**: Avoid unnecessary operations or complex setups

## Performance Characteristics

Understanding the performance profile helps set expectations:

### Timing Breakdown

For a typical test suite with 20 integration tests across 3 files:

- **Container startup**: ~5 seconds (one-time cost)
- **Connections**: ~0.3 seconds (3 files × 100ms each)
- **Collection clearing**: ~0.5 seconds (20 tests × 25ms each)
- **Test execution**: Depends on test complexity
- **Total overhead**: ~6 seconds

### First Run vs Subsequent Runs

- **First run**: ~15 seconds (downloads MongoDB image ~400MB)
- **Subsequent runs**: ~5 seconds (image cached)

### Optimization Tips

1. **Minimize test data**: Create only what's needed for each test
2. **Use factories**: Consistent, efficient test data creation
3. **Avoid unnecessary operations**: Don't save data you won't query
4. **Keep assertions simple**: Focus on core functionality
5. **Consider parallel execution**: Once tests are stable, increase `maxWorkers`

## Configuration

The integration tests use a separate Jest configuration (`jest.integration.config.ts`) with:

```typescript
{
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/test/infrastructure/**/*.test.ts'],
  setupFilesAfterEnv: ['<rootDir>/test/infrastructure/setup/jest.setup.ts'],
  globalSetup: '<rootDir>/test/infrastructure/setup/global-setup.ts',
  globalTeardown: '<rootDir>/test/infrastructure/setup/global-teardown.ts',
  testTimeout: 60000,  // 60 seconds for container operations
  maxWorkers: 1        // Run tests serially for now
}
```

### Key Configuration Options

- **testTimeout**: 60 seconds to allow for container startup and operations
- **maxWorkers**: Set to 1 for serial execution (can be increased for parallel tests)
- **globalSetup/Teardown**: Manages container lifecycle
- **setupFilesAfterEnv**: Handles connection and cleanup per test file

## Troubleshooting

### Docker Not Running

**Symptom**: Error message "Failed to start MongoDB container" or "Cannot connect to Docker daemon"

**Solution**:

1. Ensure Docker Desktop is running (macOS/Windows) or Docker daemon is active (Linux)
2. Verify Docker is working: `docker ps`
3. Check Docker has sufficient resources allocated (at least 2GB RAM)

### Container Startup Timeout

**Symptom**: Tests timeout during global setup phase

**Possible Causes**:

- Slow internet connection (first run downloads MongoDB image ~400MB)
- Docker resource constraints
- System performance issues

**Solutions**:

1. Increase timeout in `jest.integration.config.ts`:
   ```typescript
   testTimeout: 120000; // Increase to 2 minutes
   ```
2. Pre-pull the MongoDB image:
   ```bash
   docker pull mongo:latest
   ```
3. Check Docker resource allocation in Docker Desktop settings

### Connection Refused Errors

**Symptom**: "ECONNREFUSED" or "Connection refused" errors

**Possible Causes**:

- Container started but MongoDB not ready
- Port conflicts
- Network issues

**Solutions**:

1. The setup includes automatic retry logic, but you can add delays:
   ```typescript
   // In global-setup.ts, add wait time after container start
   await new Promise((resolve) => setTimeout(resolve, 2000));
   ```
2. Check no other MongoDB instances are running:
   ```bash
   docker ps | grep mongo
   ```
3. Restart Docker and try again

### Tests Failing Due to Data Pollution

**Symptom**: Tests pass individually but fail when run together

**Possible Causes**:

- Collection cleanup not working
- Tests running in parallel
- Shared state between tests

**Solutions**:

1. Verify `beforeEach` hook is running:
   ```typescript
   beforeEach(async () => {
     console.log('Clearing collections...');
     // Cleanup code
   });
   ```
2. Ensure `maxWorkers: 1` in Jest config for serial execution
3. Manually clear collections in specific tests:
   ```typescript
   await TestDatabaseHelper.clearAllCollections();
   ```

### Memory Leaks or Hanging Tests

**Symptom**: Tests don't complete, memory usage grows, or Jest hangs

**Possible Causes**:

- Connections not closed properly
- Event listeners not cleaned up
- Container not stopped

**Solutions**:

1. Ensure `afterAll` hooks are running:
   ```typescript
   afterAll(async () => {
     await mongoose.disconnect();
   });
   ```
2. Check for open handles:
   ```bash
   npm run test:integration -- --detectOpenHandles
   ```
3. Force cleanup if needed:
   ```bash
   docker stop $(docker ps -q --filter ancestor=mongo)
   ```

### TypeScript Compilation Errors

**Symptom**: "Cannot find name 'global'" or type errors with `__MONGO_URI__`

**Solution**:
Ensure `global.d.ts` is included in your `tsconfig.test.json`:

```json
{
  "include": ["test/**/*", "test/infrastructure/setup/global.d.ts"]
}
```

### Port Already in Use

**Symptom**: "Port already allocated" or similar errors

**Solution**:
Testcontainers automatically finds available ports, but if issues persist:

1. Stop all Docker containers:
   ```bash
   docker stop $(docker ps -aq)
   ```
2. Clean up Docker networks:
   ```bash
   docker network prune
   ```

### Slow Test Execution

**Symptom**: Tests take longer than expected

**Optimization Tips**:

1. Container startup is one-time cost (~5s), amortized across all tests
2. Collection clearing is fast (~10-50ms per test)
3. Reduce test data size - create minimal required data
4. Use `test.only()` during development to run single tests
5. Consider parallel execution once tests are stable:
   ```typescript
   maxWorkers: '50%'; // Use half of CPU cores
   ```

### Debug Mode

Enable verbose logging to diagnose issues:

```bash
# Testcontainers debug logs
DEBUG=testcontainers* npm run test:integration

# Mongoose debug logs
DEBUG=mongoose:* npm run test:integration

# Both
DEBUG=testcontainers*,mongoose:* npm run test:integration
```

### CI/CD Specific Issues

**Symptom**: Tests pass locally but fail in CI/CD

**Common Causes**:

- Docker not available in CI environment
- Insufficient resources in CI
- Network restrictions

**Solutions**:

1. Ensure Docker is available in CI pipeline
2. Increase timeout for CI environment:
   ```typescript
   testTimeout: process.env.CI ? 120000 : 60000;
   ```
3. Use Docker-in-Docker or Docker socket mounting
4. Check CI logs for specific error messages

## Additional Resources

### Useful Commands

```bash
# Run specific test file
npm run test:integration -- delivery.repository.test.ts

# Run tests matching pattern
npm run test:integration -- --testNamePattern="should save"

# Run with coverage
npm run test:integration -- --coverage

# Run in watch mode (for development)
npm run test:integration -- --watch

# Run with verbose output
npm run test:integration -- --verbose

# Check for open handles (memory leaks)
npm run test:integration -- --detectOpenHandles
```

### Docker Commands

```bash
# List running containers
docker ps

# View MongoDB logs
docker logs <container-id>

# Stop all MongoDB containers
docker stop $(docker ps -q --filter ancestor=mongo)

# Remove all stopped containers
docker container prune

# Check Docker disk usage
docker system df
```

### Related Documentation

- [Testcontainers Documentation](https://node.testcontainers.org/)
- [Mongoose Documentation](https://mongoosejs.com/docs/)
- [Jest Configuration](https://jestjs.io/docs/configuration)
- [MongoDB Docker Image](https://hub.docker.com/_/mongo)
