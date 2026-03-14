import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { env } from '../config/env';
import User from '../models/User';
import Product from '../models/Product';
import Warehouse from '../models/Warehouse';
import Location from '../models/Location';
import Inventory from '../models/Inventory';
import InventoryMovement from '../models/InventoryMovement';

// ─── Helpers ─────────────────────────────────────────────────
const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomElement = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const generateDate = (daysAgo: number) => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(randomInt(8, 18), randomInt(0, 59), 0, 0);
  return d;
};

// ─── Constants ───────────────────────────────────────────────
const CATEGORIES = ['Electronics', 'Furniture', 'Office', 'Clothing', 'Raw Materials'];
const WAREHOUSES = [
  { name: 'Main Distribution Center (DFW)', code: 'DFW-1' },
  { name: 'East Coast Hub (JFK)', code: 'JFK-1' },
  { name: 'West Coast Hub (LAX)', code: 'LAX-1' },
];

const connect = async () => {
  await mongoose.connect(env.MONGO_URI);
  console.log('Connected to MongoDB.');
};

const disconnect = async () => {
  await mongoose.disconnect();
  console.log('Disconnected from MongoDB.');
};

const seedDatabase = async () => {
  console.log('\n=============================================');
  console.log('🌱 Starting CoreInventory Database Seed');
  console.log('=============================================\n');

  try {
    // ─── 0. Purge ───────────────────────────────────────────────
    console.log('1/7. Purging existing database collections...');
    await Promise.all([
      User.deleteMany({}),
      Product.deleteMany({}),
      Warehouse.deleteMany({}),
      Location.deleteMany({}),
      Inventory.deleteMany({}),
      InventoryMovement.deleteMany({}),
    ]);

    // ─── 1. Users ───────────────────────────────────────────────
    console.log('2/7. Seeding Users...');
    const hashedAdminPassword = await bcrypt.hash('password123', 10);
    const admin = await User.create({
      name: 'System Admin',
      email: 'admin@coreinventory.com',
      password: hashedAdminPassword, // pre-save won't double hash if we use standard create without modifying pass in instance, but let's be safe.
      role: 'inventory_manager'
    });
    
    // Actually, User schema pre-save hook hashes password. Let's pass raw password and let Mongoose handle it.
    await User.deleteMany({});
    const mainAdmin = new User({
      name: 'System Admin',
      email: 'admin@coreinventory.com',
      password: 'password123',
      role: 'inventory_manager'
    });
    await mainAdmin.save();

    const staff1 = new User({
      name: 'John Warehouse',
      email: 'john@coreinventory.com',
      password: 'password123',
      role: 'warehouse_staff'
    });
    await staff1.save();
    
    // ─── 2. Warehouses & Locations ──────────────────────────────
    console.log('3/7. Seeding Warehouses & Locations...');
    const createdLocations: any[] = [];
    const createdWarehouses: any[] = [];
    
    for (const wData of WAREHOUSES) {
      const warehouse = await Warehouse.create({
        name: wData.name,
        location: wData.code
      });
      createdWarehouses.push(warehouse);

      // Create 9 racks per warehouse (A1-C3 grid)
      const rows = ['A', 'B', 'C'];
      for (const row of rows) {
        for (let num = 1; num <= 3; num++) {
          const loc = await Location.create({
            warehouseId: warehouse._id,
            rackCode: `${row}${num}`,
            capacity: randomInt(500, 2000)
          });
          createdLocations.push(loc);
        }
      }
    }

    // ─── 3. Products ────────────────────────────────────────────
    console.log('4/7. Seeding Products...');
    const adjectives = ['Pro', 'Ultra', 'Basic', 'Premium', 'Industrial', 'Compact'];
    const nouns = ['Widget', 'Connector', 'Module', 'Assembly', 'Unit', 'Processor', 'Cable'];
    
    const createdProducts = [];
    for (let i = 1; i <= 50; i++) {
        const prod = await Product.create({
            name: `${randomElement(adjectives)} ${randomElement(nouns)} v${randomInt(1,5)}`,
            sku: `SKU-${Math.floor(Math.random() * 100000).toString().padStart(5, '0')}`,
            category: randomElement(CATEGORIES),
            unit: randomElement(['pcs', 'boxes', 'kg', 'meters']),
            description: `Auto-generated mock product for testing.`,
            reorderLevel: randomInt(10, 100)
        });
        createdProducts.push(prod);
    }

    // ─── 4. Initial Receipts (Inventory Base) ───────────────────
    console.log('5/7. Seeding Base Inventory (Receipts)...');
    
    for (const prod of createdProducts) {
        // Distribute each product to 1-3 random locations
        const locationsForProduct = Array.from({ length: randomInt(1, 3) }, () => randomElement(createdLocations));
        
        for (const loc of locationsForProduct) {
            const qty = randomInt(50, 500);
            
            // Create movement
            await InventoryMovement.create({
                productId: prod._id,
                type: 'RECEIPT',
                quantity: qty,
                toLocation: loc._id,
                reference: `INITIAL-STOCK-${prod.sku}`,
                supplier: 'System Base Load',
                status: 'COMPLETED',
                notes: 'Initial database seed',
                performedBy: mainAdmin._id,
                createdAt: generateDate(60) // 2 months ago
            });

            // Set Inventory directly
            await Inventory.findOneAndUpdate(
                { productId: prod._id, locationId: loc._id },
                { 
                    $inc: { quantity: qty },
                    $setOnInsert: { warehouseId: loc.warehouseId }
                },
                { upsert: true, new: true }
            );
        }
    }

    // ─── 5. Historical Operations (Trends) ──────────────────────
    console.log('6/7. Generating Historical Analytics (Deliveries, Transfers, Adjustments)...');
    const today = new Date();
    
    for(let i=0; i<150; i++) {
        const type = randomElement(['DELIVERY', 'DELIVERY', 'TRANSFER', 'ADJUSTMENT']);
        const prod = randomElement(createdProducts);
        // Find where this product is
        const invEntries = await Inventory.find({ productId: prod._id, quantity: { $gt: 10 } });
        if(invEntries.length === 0) continue;
        
        const sourceInv = randomElement(invEntries);
        const sourceLoc = await Location.findById(sourceInv.locationId);
        
        const eventDate = generateDate(randomInt(0, 30)); // scattered over last 30 days
        const user = randomElement([mainAdmin, staff1]);

        if (type === 'DELIVERY') {
            const moveQty = randomInt(1, Math.min(100, sourceInv.quantity));
            await InventoryMovement.create({
                productId: prod._id,
                type: 'DELIVERY',
                quantity: moveQty,
                fromLocation: sourceLoc?._id,
                reference: `SO-${eventDate.valueOf().toString().slice(-6)}`,
                status: 'COMPLETED',
                performedBy: user._id,
                createdAt: eventDate
            });
            await Inventory.findByIdAndUpdate(sourceInv._id, { $inc: { quantity: -moveQty } });
        } 
        else if (type === 'TRANSFER') {
            const destLoc = randomElement(createdLocations);
            if(destLoc._id.toString() !== sourceLoc?._id.toString()) {
                const moveQty = randomInt(1, Math.min(50, sourceInv.quantity));
                
                await InventoryMovement.create({
                    productId: prod._id,
                    type: 'TRANSFER',
                    quantity: moveQty,
                    fromLocation: sourceLoc?._id,
                    toLocation: destLoc._id,
                    reference: `TR-${eventDate.valueOf().toString().slice(-6)}`,
                    status: 'COMPLETED',
                    performedBy: user._id,
                    createdAt: eventDate
                });

                await Inventory.findByIdAndUpdate(sourceInv._id, { $inc: { quantity: -moveQty } });
                await Inventory.findOneAndUpdate(
                    { productId: prod._id, locationId: destLoc._id },
                    { 
                        $inc: { quantity: moveQty },
                        $setOnInsert: { warehouseId: destLoc.warehouseId }
                    },
                    { upsert: true }
                );
            }
        }
        else if (type === 'ADJUSTMENT') {
            const moveQty = randomElement([randomInt(1, 10), randomInt(-10, -1)]); // small adj
            if(sourceInv.quantity + moveQty > 0) {
                 await InventoryMovement.create({
                    productId: prod._id,
                    type: 'ADJUSTMENT',
                    quantity: Math.abs(moveQty), // movement qty is abs
                    fromLocation: moveQty < 0 ? sourceLoc?._id : null,
                    toLocation: moveQty > 0 ? sourceLoc?._id : null,
                    notes: moveQty < 0 ? 'Damaged goods' : 'Found loose stock',
                    status: 'COMPLETED',
                    performedBy: user._id,
                    createdAt: eventDate
                });
                await Inventory.findByIdAndUpdate(sourceInv._id, { $inc: { quantity: moveQty } });
            }
        }
    }

    console.log('7/7. Finalization...');
    const counts = {
        users: await User.countDocuments(),
        warehouses: await Warehouse.countDocuments(),
        locations: await Location.countDocuments(),
        products: await Product.countDocuments(),
        inventoryRows: await Inventory.countDocuments(),
        movements: await InventoryMovement.countDocuments()
    };

    console.log('\n=============================================');
    console.log('✅ Seeding Complete!');
    console.log(`Users:     ${counts.users}`);
    console.log(`Warehouses:${counts.warehouses}`);
    console.log(`Locations: ${counts.locations}`);
    console.log(`Products:  ${counts.products}`);
    console.log(`Inventory: ${counts.inventoryRows}`);
    console.log(`Movements: ${counts.movements}`);
    console.log('=============================================\n');

  } catch (error) {
    console.error('❌ SEEDING FAILED:', error);
  } finally {
    await disconnect();
  }
};

const run = async () => {
    await connect();
    await seedDatabase();
};

run();
