import { MongoClient } from 'mongodb';
import { MongoMemoryServer } from 'mongodb-memory-server';
import fs from 'fs';
import path from 'path';

export const collections = {
  users: null,
  clients: null,
  subscriptions: null,
  menuItems: null,
  qrCodes: null,
  auditLogs: null,
  sessions: null, // Legacy & active session tracking
  notifications: null,
};

let mongoClient = null;
export let database = null;

export async function connectDB(uri) {
  if (mongoClient) return database;
  
  if (!uri) {
    throw new Error('MONGODB_URI is required.');
  }

  mongoClient = new MongoClient(uri);
  await mongoClient.connect();
  database = mongoClient.db(process.env.MONGODB_DATABASE || 'menuqr');

  collections.users = database.collection('users');
  collections.clients = database.collection('clients');
  collections.subscriptions = database.collection('subscriptions');
  collections.menuItems = database.collection('menu_items');
  collections.qrCodes = database.collection('qr_codes');
  collections.auditLogs = database.collection('audit_logs');
  collections.sessions = database.collection('admin_sessions');
  collections.notifications = database.collection('notifications');

  // Initialize Indexes
  await Promise.all([
    collections.users.createIndex({ email: 1 }, { unique: true }),
    collections.users.createIndex({ tenantId: 1 }),

    collections.clients.createIndex({ id: 1 }, { unique: true }), // Legacy ID
    collections.clients.createIndex({ publicId: 1 }, { unique: true, sparse: true }),
    collections.clients.createIndex({ menuSlug: 1 }, { unique: true }),

    collections.subscriptions.createIndex({ tenantId: 1 }, { unique: true }),
    collections.subscriptions.createIndex({ status: 1 }),

    collections.menuItems.createIndex({ tenantId: 1 }),
    collections.menuItems.createIndex({ id: 1 }, { unique: true }), // Item ID

    collections.qrCodes.createIndex({ qrId: 1 }, { unique: true }),
    collections.qrCodes.createIndex({ tenantId: 1 }, { unique: true }),

    collections.sessions.createIndex({ token: 1 }, { unique: true }),
    collections.sessions.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
    
    collections.notifications.createIndex({ id: 1 }, { unique: true }),
    collections.notifications.createIndex({ createdAt: -1 }),
  ]);

  console.log(`Connected to MongoDB database "${database.databaseName}".`);
  return database;
}
