import { MongoClient } from 'mongodb';

let connectedClient;

const DATABASE_NAME = 'Stemkasa';
const COLLECTION_NAME = "chatData";
const MONGODB_URI = "mongodb://localhost:27017/";



export const connectClient = async () => {

  
  if (connectedClient) {
    return connectedClient.db(DATABASE_NAME);
  }

  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  await client.db(DATABASE_NAME);
  console.info("Connected to MongoDB");

  connectedClient = client;

  return connectedClient.db(DATABASE_NAME);
};

export const stopClient = async () => {
  await connectedClient?.close();
};

  

    