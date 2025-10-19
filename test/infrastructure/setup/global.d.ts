import { StartedMongoDBContainer } from '@testcontainers/mongodb';

declare global {
  var __MONGO_CONTAINER__: StartedMongoDBContainer | undefined;
  var __MONGO_URI__: string | undefined;
}

export {};
