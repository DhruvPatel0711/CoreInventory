/**
 * CoreInventory — Comprehensive Seed Script
 * Seeds: 1 admin user, 200+ products, 5 warehouses, 50 rack locations,
 *        inventory records, and movement history.
 *
 * Usage: npx ts-node src/scripts/seed.ts
 */
import mongoose from 'mongoose';
import * as bcrypt from 'bcrypt';
import dotenv from 'dotenv';
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/coreinventory';

// ─── Raw product catalogue ──────────────────────────────────
const CATALOGUE: { name: string; prefix: string; cat: string; unit: string; reorder: number }[] = [
  // Electronics (40)
  ...['Wireless Keyboard','Optical Mouse','USB-C Hub','HDMI Cable 2m','Webcam 1080p','Bluetooth Speaker','Power Bank 10000mAh','LED Monitor 24"','Laptop Stand','Surge Protector','Ethernet Cable 5m','Wireless Earbuds','Phone Charger USB-C','DisplayPort Cable','SSD 500GB','RAM DDR4 16GB','Cooling Pad','Cable Management Kit','USB Flash Drive 64GB','Smartwatch Band','VGA Adapter','Thunderbolt Dock','Screen Protector','Keyboard Cover','Mouse Pad XL','Webcam Ring Light','HDMI Splitter','Audio Interface','Studio Headphones','Graphics Tablet','Mini Projector','Smart Plug WiFi','USB Microphone','Wireless Router','Network Switch 8-Port','Cable Ties 100pk','Anti-Static Wristband','Thermal Paste 5g','Fan Filter 120mm','PCIe Riser Cable'].map((n,i)=>({name:n,prefix:`ELEC-${String(i+1).padStart(3,'0')}`,cat:'Electronics',unit:'pcs',reorder:15+Math.floor(Math.random()*20)})),
  // Furniture (30)
  ...['Ergonomic Desk Chair','Standing Desk 60"','Monitor Arm Dual','Filing Cabinet 3-Drawer','Bookshelf 5-Tier','Desk Lamp LED','Whiteboard 4x3','Cork Board 2x3','Desk Organizer','Cable Tray','Under-Desk Drawer','Footrest Ergonomic','Chair Mat','Desk Pad Leather','Task Light Clamp','Storage Bin Large','Shelf Bracket Set','L-Shaped Desk','Computer Cart','Printer Stand','Meeting Table 6-Seat','Visitor Chair','Coat Rack','Waste Bin 15L','Key Cabinet','Wall Clock 12"','Umbrella Stand','Room Divider','Acoustic Panel 4pk','Desk Fan USB'].map((n,i)=>({name:n,prefix:`FURN-${String(i+1).padStart(3,'0')}`,cat:'Furniture',unit:'pcs',reorder:5+Math.floor(Math.random()*10)})),
  // Clothing (25)
  ...['Safety Vest Hi-Vis','Steel Toe Boots Size 10','Work Gloves Leather','Hard Hat White','Dust Mask N95 50pk','Safety Goggles','Ear Plugs 100pk','Lab Coat White','Cargo Pants Khaki','Polo Shirt Navy','Winter Jacket Black','Rain Poncho','Reflective Tape Roll','Knee Pads Pro','Face Shield Clear','Coveralls Blue','Apron Heavy Duty','Welding Gloves','Anti-Slip Shoes','Thermal Socks 3pk','Baseball Cap Logo','Arm Sleeves UV','Bandana Pack 5','Sweatband Set','Belt Heavy Duty'].map((n,i)=>({name:n,prefix:`CLO-${String(i+1).padStart(3,'0')}`,cat:'Clothing',unit:'pcs',reorder:20+Math.floor(Math.random()*30)})),
  // Raw Materials (30)
  ...['Steel Rod 10mm','Copper Wire 2.5mm','PVC Pipe 4"','Aluminum Sheet 1mm','Rubber Seal Ring','Glass Panel 30x40','Nylon Bolt M8','Carbon Fiber Sheet','Silicon Wafer 6"','LED Module Strip','Ceramic Tile 12x12','Foam Padding 2"','Plywood Sheet 4x8','Acrylic Rod 10mm','Stainless Bar 20mm','Brass Tube 15mm','Fiberglass Mat','Epoxy Resin 1L','Polyethylene Film','Galvanized Wire 3mm','Zinc Ingot 1kg','Silicone Sealant','Concrete Mix 25kg','Rebar 12mm','Sandpaper 80 Grit','Wood Screw Box 500','Hex Nut M10 100pk','Washer M8 200pk','Spring Steel Wire','Titanium Rod 8mm'].map((n,i)=>({name:n,prefix:`RAW-${String(i+1).padStart(3,'0')}`,cat:'Raw Materials',unit:['pcs','kg','meters','boxes'][i%4],reorder:10+Math.floor(Math.random()*40)})),
  // Packaging (25)
  ...['Cardboard Box 12x12','Bubble Wrap Roll 50m','Packing Tape 48mm','Stretch Film 18"','Poly Mailer 10x13','Foam Insert Custom','Packing Peanuts 14cu','Label Roll 1000','Edge Protector 1m','Zip Lock Bag 6x9','Tissue Paper 480 Sheet','Shrink Wrap Roll','Corrugated Insert','Padded Envelope A4','Void Fill Paper Roll','Sealing Machine Tape','Desiccant Pack 100','Tamper Seal 500pk','Corner Board 1m','Kraft Paper Roll','Box Divider Set','Pallet Wrap Black','Anti-Static Bag 100','Shipping Label 4x6','Mailing Tube 3x24'].map((n,i)=>({name:n,prefix:`PKG-${String(i+1).padStart(3,'0')}`,cat:'Packaging',unit:['pcs','boxes','units'][i%3],reorder:50+Math.floor(Math.random()*50)})),
  // Office Supplies (25)
  ...['A4 Paper Ream 500','Ballpoint Pen Box 50','Stapler Heavy Duty','Binder Clip Assorted','Sticky Notes 3x3 12pk','Marker Set 8 Color','Scissors 8"','Tape Dispenser','Paper Clip Box 1000','Ruler 30cm Acrylic','Envelope C4 100pk','Folder Manila 25pk','Correction Tape 6pk','Rubber Band Box','Pencil HB Box 12','Eraser White 20pk','Index Tab Divider','Stamp Pad Ink','Clipboard A4','Desk Calendar 2026','Push Pin 100pk','Glue Stick 36g 12pk','Highlighter 6pk','Paper Cutter A3','Laminating Pouch A4'].map((n,i)=>({name:n,prefix:`OFC-${String(i+1).padStart(3,'0')}`,cat:'Office Supplies',unit:['pcs','boxes','units'][i%3],reorder:25+Math.floor(Math.random()*25)})),
  // Food & Beverage (25)
  ...['Coffee Beans 1kg','Green Tea Box 100','Sugar Sachets 500','Creamer Pods 50','Water Bottle 500ml Case','Energy Bar Box 24','Instant Noodle Carton','Biscuit Tin Assorted','Juice Pouch 200ml 36pk','Protein Powder 2kg','Granola Pack 500g','Dried Fruit Mix 1kg','Honey Jar 500g','Olive Oil 1L','Salt Pouch 1kg','Pepper Ground 100g','Sauce Sachet Box 200','Chocolate Bar 48pk','Chips Variety 20pk','Canned Tuna 12pk','Rice Bag 5kg','Pasta Pack 500g','Flour All Purpose 2kg','Coconut Water Case 24','Mineral Water 1.5L 12pk'].map((n,i)=>({name:n,prefix:`FOOD-${String(i+1).padStart(3,'0')}`,cat:'Food & Beverage',unit:['pcs','kg','boxes','units'][i%4],reorder:30+Math.floor(Math.random()*20)})),
];

const WAREHOUSES = [
  { name: 'Main Warehouse — Mumbai', location: 'Plot 42, MIDC Andheri East, Mumbai 400093' },
  { name: 'North Hub — Delhi', location: 'Sector 18, Noida Industrial Area, Delhi NCR 201301' },
  { name: 'South Center — Bangalore', location: 'Peenya Industrial Estate, Phase 3, Bangalore 560058' },
  { name: 'West Depot — Pune', location: 'Hinjewadi IT Park, Phase 2, Pune 411057' },
  { name: 'East Terminal — Kolkata', location: 'Salt Lake Sector V, Kolkata 700091' },
];

const RACK_ROWS = ['A', 'B', 'C', 'D', 'E'];
const RACK_COLS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

async function seed() {
  console.log('⏳ Connecting to MongoDB...');
  await mongoose.connect(MONGO_URI);
  console.log('✅ Connected.');

  const db = mongoose.connection.db!;

  // ── Drop existing collections ──────────────────────────────
  const collections = ['users', 'products', 'warehouses', 'locations', 'inventories', 'movements'];
  for (const c of collections) {
    try { await db.dropCollection(c); } catch {}
  }
  console.log('🗑️  Cleared old data.');

  // ── 1. Seed Admin User ─────────────────────────────────────
  const salt = await bcrypt.genSalt(12);
  const hashedPassword = await bcrypt.hash('admin123', salt);
  await db.collection('users').insertOne({
    name: 'Admin User',
    email: 'admin@coreinventory.com',
    password: hashedPassword,
    role: 'admin',
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  console.log('👤 Admin user created: admin@coreinventory.com / admin123');

  // ── 2. Seed Products ───────────────────────────────────────
  const productDocs = CATALOGUE.map((p, i) => ({
    name: p.name,
    sku: p.prefix,
    category: p.cat,
    unit: p.unit,
    reorderLevel: p.reorder,
    description: `${p.name} — standard warehouse inventory item.`,
    createdAt: new Date(Date.now() - (CATALOGUE.length - i) * 3600000),
    updatedAt: new Date(),
  }));
  const prodResult = await db.collection('products').insertMany(productDocs);
  const productIds = Object.values(prodResult.insertedIds);
  console.log(`📦 ${productIds.length} products seeded.`);

  // ── 3. Seed Warehouses ─────────────────────────────────────
  const whDocs = WAREHOUSES.map(w => ({ ...w, createdAt: new Date(), updatedAt: new Date() }));
  const whResult = await db.collection('warehouses').insertMany(whDocs);
  const warehouseIds = Object.values(whResult.insertedIds);
  console.log(`🏭 ${warehouseIds.length} warehouses seeded.`);

  // ── 4. Seed Locations (50 racks across 5 warehouses) ───────
  const locationDocs: any[] = [];
  for (let wi = 0; wi < warehouseIds.length; wi++) {
    for (let r = 0; r < RACK_ROWS.length; r++) {
      for (let c = 0; c < 2; c++) {   // 2 cols per row × 5 rows × 5 warehouses = 50
        locationDocs.push({
          warehouseId: warehouseIds[wi],
          rackCode: `${RACK_ROWS[r]}${RACK_COLS[c + wi * 2]}`,
          capacity: 300 + Math.floor(Math.random() * 700),
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
    }
  }
  const locResult = await db.collection('locations').insertMany(locationDocs);
  const locationIds = Object.values(locResult.insertedIds);
  console.log(`📍 ${locationIds.length} rack locations seeded.`);

  // ── 5. Seed Inventory (spread products across racks) ───────
  const inventoryDocs: any[] = [];
  for (let i = 0; i < productIds.length; i++) {
    const locIdx = i % locationIds.length;
    const capacity = locationDocs[locIdx].capacity;
    const isLowStock = i % 12 === 0;
    const isEmpty = i % 25 === 0 && i > 0;
    const qty = isEmpty ? 0 : isLowStock ? Math.floor(Math.random() * 5) + 1 : Math.floor(Math.random() * capacity * 0.8) + 10;
    inventoryDocs.push({
      productId: productIds[i],
      locationId: locationIds[locIdx],
      quantity: qty,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
  await db.collection('inventories').insertMany(inventoryDocs);
  console.log(`📊 ${inventoryDocs.length} inventory records seeded.`);

  // ── 6. Seed Movement History ───────────────────────────────
  const MOVE_TYPES = ['RECEIPT', 'DELIVERY', 'TRANSFER', 'ADJUSTMENT'];
  const movementDocs: any[] = [];
  for (let i = 0; i < 500; i++) {
    const type = MOVE_TYPES[i % 4];
    const prodIdx = i % productIds.length;
    const locIdx = i % locationIds.length;
    const qty = Math.floor(Math.random() * 100) + 1;
    const daysAgo = Math.floor(Math.random() * 60);
    const doc: any = {
      productId: productIds[prodIdx],
      quantity: qty,
      type,
      status: 'COMPLETED',
      notes: `Seed movement #${i + 1}`,
      createdAt: new Date(Date.now() - daysAgo * 86400000),
      updatedAt: new Date(),
    };
    if (type === 'RECEIPT') {
      doc.toLocation = locationIds[locIdx];
      doc.reference = `PO-${String(10000 + i).padStart(5, '0')}`;
      doc.supplier = ['Acme Corp', 'GlobalTech', 'FastShip Inc', 'MetalWorks', 'PackPro'][i % 5];
    } else if (type === 'DELIVERY') {
      doc.fromLocation = locationIds[locIdx];
      doc.reference = `SO-${String(80000 + i).padStart(5, '0')}`;
      doc.customer = ['RetailMax', 'TechStore', 'MegaMart', 'QuickBuy', 'ShopEase'][i % 5];
    } else if (type === 'TRANSFER') {
      doc.fromLocation = locationIds[locIdx];
      doc.toLocation = locationIds[(locIdx + 1) % locationIds.length];
    } else {
      doc.toLocation = locationIds[locIdx];
      doc.notes = ['Damaged goods', 'Expired items', 'Cycle count correction', 'Quality rejection', 'Shrinkage adjustment'][i % 5];
    }
    movementDocs.push(doc);
  }
  await db.collection('movements').insertMany(movementDocs);
  console.log(`🔄 ${movementDocs.length} movements seeded.`);

  console.log('\n🎉 Seed complete! Login with:');
  console.log('   Email:    admin@coreinventory.com');
  console.log('   Password: admin123\n');

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch(err => { console.error('Seed failed:', err); process.exit(1); });
