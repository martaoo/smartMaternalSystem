const mongoose = require('mongoose');
const mongoUri = 'mongodb://localhost:27017/smart-maternal';

async function check() {
  await mongoose.connect(mongoUri);
  const Region = mongoose.model('Region', new mongoose.Schema({ name: String }));
  const regions = await Region.find({});
  console.log('REGIONS:', regions.map(r => r.name));
  await mongoose.disconnect();
}
check();
