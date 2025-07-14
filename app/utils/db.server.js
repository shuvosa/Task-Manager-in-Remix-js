import mongoose from 'mongoose'; // Import the Mongoose library for MongoDB interaction
import dotenv from 'dotenv';    // Import dotenv to load environment variables from .env file

// Load environment variables from the .env file. This makes MONGODB_URI available via process.env.
dotenv.config();

// Get the MongoDB URI from environment variables
const MONGODB_URI = process.env.MONGODB_URI;

// Check if MONGODB_URI is defined. If not, throw an error as we cannot connect without it.
if (!MONGODB_URI) {
  throw new Error(
    'Please define the MONGODB_URI environment variable inside .env'
  );
}

// Declare a global variable to store the Mongoose connection promise.
// This is crucial for development mode with hot-reloading in Remix,
// as it prevents multiple database connections from being established.
let cachedDb = global.mongoose;

// If a cached connection doesn't exist, initialize it
if (!cachedDb) {
  cachedDb = global.mongoose = { conn: null, promise: null };
}

/**
 * Connects to the MongoDB database using Mongoose.
 * This function ensures that only one connection is established and reused
 * across multiple requests, especially important in a serverless or hot-reloading environment.
 * @returns {Promise<mongoose.Connection>} A promise that resolves to the Mongoose connection object.
 */
async function connectToDatabase() {
  // If a connection is already established, return the existing connection.
  if (cachedDb.conn) {
    console.log('Using existing database connection');
    return cachedDb.conn;
  }

  // If a connection promise is in progress, return that promise.
  // This prevents multiple attempts to connect simultaneously.
  if (!cachedDb.promise) {
    // If no connection or promise exists, create a new connection promise.
    // Use Mongoose's `connect` method with the URI.
    // `useNewUrlParser` and `useUnifiedTopology` are recommended for newer versions of MongoDB driver.
    // `bufferCommands` ensures operations are buffered while connecting.
    cachedDb.promise = mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      bufferCommands: false, // Set to false to immediately fail if not connected
    }).then((m) => {
      // Once connected, store the connection object
      cachedDb.conn = m.connection;
      console.log('New database connection established');
      return m.connection;
    }).catch((error) => {
      // If connection fails, clear the promise to allow retries
      cachedDb.promise = null;
      console.error('Database connection failed:', error);
      throw error; // Re-throw the error to indicate connection failure
    });
  }

  // Wait for the connection promise to resolve and return the connection.
  return cachedDb.promise;
}

// Export the connectToDatabase function so it can be imported and used elsewhere.
export default connectToDatabase;
