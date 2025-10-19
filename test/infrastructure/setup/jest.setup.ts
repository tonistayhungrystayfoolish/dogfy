import mongoose from 'mongoose';

let isConnected = false;

export async function clearAllCollections(): Promise<void> {
  if (!mongoose.connection.db) {
    console.warn('Database connection not available');
    return;
  }

  try {
    const collections = await mongoose.connection.db.collections();

    if (collections.length === 0) {
      return;
    }

    await Promise.all(
      collections.map(async (collection) => {
        try {
          await collection.deleteMany({});
        } catch (error) {
          console.warn(`Failed to clear collection ${collection.collectionName}:`, error);
        }
      }),
    );
  } catch (error) {
    console.warn('Failed to clear collections:', error);
  }
}


export function getConnection(): mongoose.Connection {
  return mongoose.connection;
}


export function isMongoConnected(): boolean {
  return isConnected && mongoose.connection.readyState === 1;
}


async function connectToMongoDB(): Promise<void> {
  if (isConnected && mongoose.connection.readyState === 1) {
    console.log('Already connected to MongoDB, reusing connection');
    return;
  }

  const mongoUri = global.__MONGO_URI__;

  if (!mongoUri) {
    throw new Error(
      'MongoDB URI not found in global variables. ' + 'Ensure global setup has run successfully.',
    );
  }

  console.log('Connecting to MongoDB for integration tests...');
  console.log(`URI: ${mongoUri}`);

  try {
    const options = {
      maxPoolSize: 10,
      minPoolSize: 2,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
      family: 4, 
    };

    await mongoose.connect(mongoUri, options);
    isConnected = true;

    console.log('Connected to MongoDB successfully');
    console.log(`Connection state: ${mongoose.connection.readyState}`);
    console.log(`Database: ${mongoose.connection.name}`);
  } catch (error) {
    console.error(' Failed to connect to MongoDB');
    console.error(`URI: ${mongoUri}`);
    console.error('Error details:', error);
    throw error;
  }
}


async function disconnectFromMongoDB(): Promise<void> {
  if (!isConnected) {
    return;
  }

  try {
    await mongoose.disconnect();
    isConnected = false;
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Failed to disconnect from MongoDB:', error);
    
  }
}

beforeAll(async () => {
  await connectToMongoDB();
});

beforeEach(async () => {
  await clearAllCollections();
});

afterAll(async () => {
  await disconnectFromMongoDB();
});
