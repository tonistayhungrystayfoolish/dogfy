import mongoose from 'mongoose';


export class TestDatabaseHelper {

  static async clearAllCollections(): Promise<void> {
    if (!mongoose.connection.db) {
      throw new Error(
        'Database connection not available. Ensure MongoDB is connected before clearing collections.',
      );
    }

    const collections = await mongoose.connection.db.collections();

    if (collections.length === 0) {
      return;
    }

    await Promise.all(
      collections.map(async (collection) => {
        await collection.deleteMany({});
      }),
    );
  }

  static async clearCollection(collectionName: string): Promise<void> {
    if (!mongoose.connection.db) {
      throw new Error(
        'Database connection not available. Ensure MongoDB is connected before clearing collection.',
      );
    }

    const collections = await mongoose.connection.db.collections();
    const collection = collections.find((c) => c.collectionName === collectionName);

    if (!collection) {
      throw new Error(`Collection "${collectionName}" not found in database.`);
    }

    await collection.deleteMany({});
  }

  
  static getConnection(): mongoose.Connection {
    return mongoose.connection;
  }

  
  static isConnected(): boolean {
    return mongoose.connection.readyState === 1;
  }
}
