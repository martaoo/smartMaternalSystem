import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { UsersService } from './users/users.service';
import { HospitalsService } from './hospitals/hospitals.service';
import { UserRole } from './common/enums/user-role.enum';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const usersService = app.get(UsersService);
    const hospitalsService = app.get(HospitalsService);

    // Create harHC hospital if it doesn't exist
    let hospital;
    try {
      hospital = await hospitalsService.create({
        name: 'harHC',
        type: 'HEALTH_CENTER',
        location: 'Harar, Ethiopia',
        contact: '+251911000000',
        woredaId: '000000000000000000000000', // Default woreda
      });
      console.log('Created harHC hospital');
      console.log('Hospital ID:', (hospital as any)._id);
    } catch (error) {
      console.log('harHC hospital already exists or error:', error.message);
      // Try to find existing
      const existingHospitals = await hospitalsService.findAll();
      hospital = existingHospitals.find(h => h.name === 'harHC');
    }

    // Create system admin if doesn't exist
    try {
      await usersService.create({
        name: 'System Administrator',
        email: 'admin@maternal.gov.et',
        password: 'admin123',
        role: UserRole.SUPER_ADMIN,
        phoneNumber: '+251900000001',
      });
      console.log('System Admin created');
      console.log('Email: admin@maternal.gov.et');
      console.log('Password: admin123');
    } catch (error) {
      console.log('System Admin already exists or error:', error.message);
    }

    // Create liaison officer for harHC if doesn't exist
    if (hospital) {
      try {
        await usersService.create({
          name: 'Liaison Officer',
          email: 'liaison@test.et',
          password: 'liaison123',
          role: UserRole.LIAISON_OFFICER,
          hospitalId: (hospital as any)._id.toString(),
          phoneNumber: '+251913333333',
        });
        console.log('Liaison Officer created');
        console.log('Email: liaison@test.et');
        console.log('Password: liaison123');
        console.log('Assigned to hospital: harHC');
      } catch (error) {
        console.log('Liaison Officer already exists or error:', error.message);
      }
    }

  } catch (error) {
    console.error('Error in seed:', error.message);
  } finally {
    await app.close();
  }
}

bootstrap();
