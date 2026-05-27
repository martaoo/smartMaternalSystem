/**
 * Test script — sets upcoming dates on existing records then triggers reminders.
 * Run: node test-reminders.js
 */
const mongoose = require('mongoose');
require('dotenv').config({ path: '.env' });

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');
  const db = mongoose.connection.db;

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(12, 0, 0, 0);

  const in3days = new Date();
  in3days.setDate(in3days.getDate() + 3);
  in3days.setHours(12, 0, 0, 0);

  // ── Vaccination records ────────────────────────────────────────────────────
  // Set first SCHEDULED vaccination to tomorrow (1-day reminder)
  const vax1 = await db.collection('vaccinationrecords').findOneAndUpdate(
    { status: 'SCHEDULED' },
    { $set: { scheduledDate: tomorrow, reminderSent: false, reminder3DaySent: false, reminderSameDaySent: false } },
    { returnDocument: 'after' }
  );
  console.log('Vaccination (tomorrow):', vax1?._id || vax1?.value?._id || 'none found');

  // Set second SCHEDULED vaccination to 3 days from now (3-day reminder)
  const vax2 = await db.collection('vaccinationrecords').findOneAndUpdate(
    { status: 'SCHEDULED', scheduledDate: { $ne: tomorrow } },
    { $set: { scheduledDate: in3days, reminderSent: false, reminder3DaySent: false, reminderSameDaySent: false } },
    { returnDocument: 'after' }
  );
  console.log('Vaccination (3 days):', vax2?._id || vax2?.value?._id || 'none found');

  // ── Pregnancy records ──────────────────────────────────────────────────────
  // Set first pregnancy nextVisitDate to tomorrow
  const preg1 = await db.collection('pregnancies').findOneAndUpdate(
    { nextVisitDate: { $exists: true } },
    { $set: { nextVisitDate: tomorrow, visitReminderSent: false, reminder3DaySent: false, reminderSameDaySent: false } },
    { returnDocument: 'after' }
  );
  console.log('Pregnancy (tomorrow):', preg1?._id || preg1?.value?._id || 'none found');

  await mongoose.disconnect();
  console.log('\n✅ Test data set. Now call the trigger endpoints:');
  console.log('');
  console.log('  Vaccination reminders:');
  console.log('  POST http://localhost:3001/vaccinations/reminders/test');
  console.log('  (with Authorization: Bearer <your-token>)');
  console.log('');
  console.log('  Pregnancy reminders:');
  console.log('  POST http://localhost:3001/pregnancy/reminders/test');
  console.log('  (with Authorization: Bearer <your-token>)');
  console.log('');
  console.log('  Then check backend console for email output.');
  console.log('  Emails also saved to: backend/dev-emails/');
}

main().catch(err => { console.error(err); process.exit(1); });
