const path = require('path');
const dotenv = require('dotenv');
const { connectDB } = require('./config/db');
const store = require('./data/store');

dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config();

async function seed() {
  await connectDB();
  await store.resetDemoData();
  await store.ensureDemoData();
  console.log('Demo data seeded.');
  process.exit(0);
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
