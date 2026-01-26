import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { StoreModel } from '../src/modules/Store/store.model';
import ProductModel from '../src/modules/Product/product.model';
import { UserModel } from '../src/modules/User/user.model';
import OrderModel from '../src/modules/Orders/orders.model';

dotenv.config();

const seedStores = async () => {
  try {
    await mongoose.connect(process.env.DATABASE_URL as string);
    console.log('Connected to Database');

    // 1. Create BestBuy4uBd Store
    let bestBuyStore = await StoreModel.findOne({ name: 'BestBuy4uBd' });
    if (!bestBuyStore) {
      bestBuyStore = await StoreModel.create({
        name: 'BestBuy4uBd',
        domains: ['bestbuy4ubd.com', 'www.bestbuy4ubd.com', 'localhost'], // localhost for dev
        identity: {
          logoUrl: 'https://bestbuy4ubd.com/logo.png', // Replace with actual
          faviconUrl: 'https://bestbuy4ubd.com/favicon.ico', // Replace with actual
          primaryColor: '#0046be',
          secondaryColor: '#ffeb3b',
        },
        settings: {
          supportEmail: 'support@bestbuy4ubd.com',
          supportPhone: '01610403011',
          address: 'Dhaka, Bangladesh',
          gtmId: 'GTM-XXXXXX', // Replace with actual
        },
      });
      console.log('Created BestBuy4uBd Store');
    } else {
      console.log('BestBuy4uBd Store already exists');
    }

    // 2. Create TopDealsBd Store
    let topDealsStore = await StoreModel.findOne({ name: 'TopDealsBd' });
    if (!topDealsStore) {
      topDealsStore = await StoreModel.create({
        name: 'TopDealsBd',
        domains: ['topdealsbd.com', 'www.topdealsbd.com'],
        identity: {
          logoUrl: 'https://topdealsbd.com/logo.png', // Replace with actual
          faviconUrl: 'https://topdealsbd.com/favicon.ico', // Replace with actual
          primaryColor: '#ff0000',
          secondaryColor: '#ffffff',
        },
        settings: {
          supportEmail: 'support@topdealsbd.com',
          supportPhone: '+8801XXXXXXXXX',
          address: 'Dhaka, Bangladesh',
        },
      });
      console.log('Created TopDealsBd Store');
    } else {
      console.log('TopDealsBd Store already exists');
    }

    // 3. Backfill Data - Assign everything to BestBuy4uBd
    const bestBuyId = bestBuyStore._id;

    const productsUpdate = await ProductModel.updateMany(
      { storeId: { $exists: false } },
      { $set: { storeId: bestBuyId } }
    );
    console.log(`Updated ${productsUpdate.modifiedCount} products`);

    const usersUpdate = await UserModel.updateMany(
      { storeId: { $exists: false } },
      { $set: { storeId: bestBuyId } }
    );
    console.log(`Updated ${usersUpdate.modifiedCount} users`);

    const ordersUpdate = await OrderModel.updateMany(
      { storeId: { $exists: false } },
      { $set: { storeId: bestBuyId } }
    );
    console.log(`Updated ${ordersUpdate.modifiedCount} orders`);

    console.log('Seeding and Backfilling Complete');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding stores:', error);
    process.exit(1);
  }
};

seedStores();
