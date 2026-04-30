// Fix pregnancy records with missing or incorrect hospital IDs
// Run this in Node.js in the backend directory

const mongoose = require('mongoose');
const Pregnancy = require('./src/pregnancy/schemas/pregnancy.schema.js').Pregnancy;
const Mother = require('./src/mothers/schemas/mother.schema.js').Mother;

async function fixPregnancyHospitals() {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/smart-maternal-system');
    console.log('Connected to MongoDB');

    // Find all pregnancy records
    const pregnancies = await Pregnancy.find({}).populate('motherId');
    console.log(`Found ${pregnancies.length} pregnancy records`);

    let fixedCount = 0;
    let errorCount = 0;

    for (const pregnancy of pregnancies) {
      try {
        // Check if pregnancy has hospitalId
        if (!pregnancy.hospitalId && pregnancy.motherId) {
          // Get hospital from mother
          const mother = pregnancy.motherId;
          if (mother.healthCenter) {
            // Update pregnancy with mother's hospital
            await Pregnancy.findByIdAndUpdate(pregnancy._id, {
              hospitalId: mother.healthCenter
            });
            console.log(`Fixed pregnancy ${pregnancy._id} with hospital ${mother.healthCenter}`);
            fixedCount++;
          } else {
            console.log(`Pregnancy ${pregnancy._id} has no hospital and mother has no hospital`);
            errorCount++;
          }
        } else if (pregnancy.hospitalId) {
          console.log(`Pregnancy ${pregnancy._id} already has hospital ${pregnancy.hospitalId}`);
        }
      } catch (err) {
        console.log(`Error fixing pregnancy ${pregnancy._id}:`, err.message);
        errorCount++;
      }
    }

    console.log(`\nSummary:`);
    console.log(`- Fixed: ${fixedCount} pregnancy records`);
    console.log(`- Errors: ${errorCount} pregnancy records`);
    console.log(`- Total: ${pregnancies.length} pregnancy records`);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

fixPregnancyHospitals();
