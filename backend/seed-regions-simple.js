const mongoose = require('mongoose');

const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/smart-maternal';

async function seed() {
  console.log('Connecting to MongoDB...', mongoUri);
  await mongoose.connect(mongoUri);
  console.log('Connected.');

  const regionSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    code: { type: String, required: true },
    isActive: { type: Boolean, default: true }
  }, { timestamps: true });

  const Region = mongoose.models.Region || mongoose.model('Region', regionSchema);

  const regions = [
    { name: 'Addis Ababa', code: 'AA' },
    { name: 'Afar', code: 'AF' },
    { name: 'Amhara', code: 'AM' },
    { name: 'Benishangul-Gumuz', code: 'BG' },
    { name: 'Dire Dawa', code: 'DD' },
    { name: 'Gambela', code: 'GA' },
    { name: 'Harari', code: 'HA' },
    { name: 'Oromia', code: 'OR' },
    { name: 'Sidama', code: 'SI' },
    { name: 'Somali', code: 'SO' },
    { name: 'South Ethiopia', code: 'SE' },
    { name: 'Central Ethiopia', code: 'CE' },
    { name: 'Southwest Ethiopia Peoples', code: 'SW' },
    { name: 'Tigray', code: 'TI' },
  ];

  for (const r of regions) {
    try {
      const existing = await Region.findOne({ name: r.name });
      if (existing) {
        console.log(`Region ${r.name} already exists.`);
        continue;
      }
      await new Region(r).save();
      console.log(`Created region: ${r.name}`);
    } catch (e) {
      console.log(`Error creating ${r.name}: ${e.message}`);
    }
  }

  await mongoose.disconnect();
  console.log('Done.');
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
