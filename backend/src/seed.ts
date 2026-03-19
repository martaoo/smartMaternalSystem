import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { UsersService } from './users/users.service';
import { HospitalsService } from './hospitals/hospitals.service';
import { WoredasService } from './woredas/woredas.service';
import { UserRole } from './common/enums/user-role.enum';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  
  try {
    const usersService = app.get(UsersService);
    const hospitalsService = app.get(HospitalsService);
    const woredasService = app.get(WoredasService);

    // Create a test woreda
    const woreda = await woredasService.create({
      name: 'Test Woreda',
      region: 'Addis Ababa',
    });

    console.log('Test Woreda created');
    console.log('Woreda ID:', (woreda as any)._id);

    // Create a test hospital
    const hospital = await hospitalsService.create({
      name: 'Test General Hospital',
      type: 'HOSPITAL',
      location: '123 Main St, Addis Ababa',
      contact: '+251911000000',
      woredaId: (woreda as any)._id.toString(),
    });

    console.log('Test Hospital created');
    console.log('Hospital ID:', (hospital as any)._id);

    await usersService.create({
      name: 'System Administrator',
      email: 'admin@maternal.gov.et',
      password: 'admin123', // Service will hash this automatically
      role: UserRole.MOH_ADMIN,
      phoneNumber: '+251900000001',
    });

    console.log('System Admin created');
    console.log('Email: admin@maternal.gov.et');
    console.log('Password: admin123');
    console.log('Role: MOH_ADMIN');

    // Create a test doctor
    await usersService.create({
      name: 'Test Doctor',
      email: 'doctor@test.et',
      password: 'doc123',
      role: UserRole.DOCTOR,
      hospitalId: (hospital as any)._id.toString(),
      phoneNumber: '+251911123456',
      department: 'Obstetrics',
      licenseNumber: 'MD001234',
    });

    console.log('Test Doctor created');
    console.log('Email: doctor@test.et');
    console.log('Password: doc123');
    
  } catch (error) {
    console.error('Error creating admin:', error.message);
  } finally {
    await app.close();
  }
}

bootstrap();
