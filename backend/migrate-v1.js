import { randomUUID } from 'crypto';
import { connectDB, collections, database } from './db.js';
import { config as loadEnv } from 'dotenv';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const directory = dirname(fileURLToPath(import.meta.url));
loadEnv({ path: join(directory, '.env') });

function generatePublicId() {
  return 'cl_' + randomBytes(8).toString('hex');
}

import { randomBytes } from 'node:crypto';

async function migrate() {
  await connectDB(process.env.MONGODB_URI);
  
  console.log('Starting Migration v1: Separating MenuItems, Subscriptions, and Users');
  
  const clients = await collections.clients.find({}).toArray();
  console.log(`Found ${clients.length} clients to migrate.`);
  
  for (const client of clients) {
    // 1. Generate permanent IDs if missing
    const publicId = client.publicId || generatePublicId();
    const tenantId = client.id;
    
    // 2. Create default Subscription if none exists
    const existingSub = await collections.subscriptions.findOne({ tenantId });
    if (!existingSub) {
      await collections.subscriptions.insertOne({
        tenantId,
        planId: client.plan || 'Starter',
        status: client.status || 'Active',
        startedAt: client.createdAt || new Date().toISOString(),
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year default
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      console.log(`Created Subscription for ${tenantId}`);
    }
    
    // 3. Create QR Code mapping
    const existingQr = await collections.qrCodes.findOne({ tenantId });
    if (!existingQr) {
      await collections.qrCodes.insertOne({
        tenantId,
        publicId,
        qrId: 'qr_' + randomBytes(8).toString('hex'),
        destinationType: 'menu',
        isActive: true,
        createdAt: new Date().toISOString(),
      });
      console.log(`Created QR Code for ${tenantId}`);
    }
    
    // 4. Extract Menu Items
    if (client.menuItems && Array.isArray(client.menuItems) && client.menuItems.length > 0) {
      const itemsToInsert = client.menuItems.map(item => ({
        ...item,
        tenantId,
      }));
      
      // Upsert to prevent duplicates on re-run
      for (const item of itemsToInsert) {
        await collections.menuItems.updateOne(
          { id: item.id },
          { $set: item },
          { upsert: true }
        );
      }
      console.log(`Extracted ${itemsToInsert.length} menu items for ${tenantId}`);
      
      // Optional: We do NOT delete them from the client document yet to avoid breaking current code completely.
      // We will phase out reading from client.menuItems.
    }
    
    // Update client with publicId
    await collections.clients.updateOne(
      { id: tenantId },
      { $set: { publicId } }
    );
  }
  
  console.log('Migration v1 complete.');
  process.exit(0);
}

migrate().catch(console.error);
