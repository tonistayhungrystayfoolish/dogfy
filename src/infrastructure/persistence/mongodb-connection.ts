import mongoose from 'mongoose';

export class MongoDBConnection {
  private static instance: MongoDBConnection;
  private isConnected = false;

  private constructor() {}

  public static getInstance(): MongoDBConnection {
    if (!MongoDBConnection.instance) {
      MongoDBConnection.instance = new MongoDBConnection();
    }
    return MongoDBConnection.instance;
  }

  public async connect(): Promise<void> {
    if (this.isConnected && mongoose.connection.readyState === 1) {
      console.log('Already connected to MongoDB, skipping connection');
      return;
    }

    console.log('Connecting to MongoDB...');

    try {
      const mongoUri = process.env.MONGODB_URI;
      if (!mongoUri) {
        throw new Error('MONGODB_URI environment variable is not set');
      }
      
      const options = {
        maxPoolSize: 5,
        minPoolSize: 1,
        serverSelectionTimeoutMS: 5000, // Shorter timeout for faster feedback
        socketTimeoutMS: 15000,
        connectTimeoutMS: 5000,
        retryWrites: false,
        retryReads: false,
        directConnection: true, // Force direct connection to avoid replica set issues
        bufferCommands: false, // Disable buffering to fail fast
        maxIdleTimeMS: 10000,
        dbName: 'test_dogfy_diet', // Explicitly set database name
      };
      
      await mongoose.connect(mongoUri, options);

      this.isConnected = true;
      console.log(`Connected to MongoDB successfully at ${mongoUri}`);
      console.log(`Mongoose connection state: ${mongoose.connection.readyState}`); // 1 = connected, 2 = connecting, 0 = disconnected
      console.log(`Mongoose database: ${mongoose.connection.db ? 'available' : 'unavailable'}`);
      console.log(`Mongoose database name: ${mongoose.connection.name}`);
    } catch (error) {
      console.error('Failed to connect to MongoDB:', error);
      throw error;
    }
  }

  public async disconnect(): Promise<void> {
    if (!this.isConnected) {
      return;
    }

    await mongoose.disconnect();
    this.isConnected = false;
    console.log('Disconnected from MongoDB');
  }

  public getConnection(): mongoose.Connection {
    return mongoose.connection;
  }
}