import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { UsersService } from './users/users.service';
import { WoredasService } from './woredas/woredas.service';
import { UserRole } from './common/enums/user-role.enum';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  
  try {
    const usersService = app.get(UsersService);
    const woredasService = app.get(WoredasService);

    // Create sample woredas (commented out - only create SUPER_ADMIN)
    /*
    const existingWoredas = await woredasService.findAll();
    let testWoreda: any = null;
    
    if (existingWoredas.length === 0) {
      testWoreda = await woredasService.create({
        name: 'Bole Woreda 01',
        city: 'Bole',
        region: 'Addis Ababa',
      });
      
      await woredasService.create({
        name: 'Kirkos Woreda 01',
        city: 'Kirkos',
        region: 'Addis Ababa',
      });
      
      await woredasService.create({
        name: 'Arada Woreda 01',
        city: 'Arada',
        region: 'Addis Ababa',
      });
      
      console.log('Sample woredas created successfully');
    } else {
      testWoreda = existingWoredas[0];
      console.log('Woredas already exist');
    }
    */

    // Create/update super admin user
    const existingAdmin = await usersService.findByEmail('admin@maternal.gov.et');
    if (!existingAdmin) {
      await usersService.create({
        name: 'Super Administrator',
        email: 'admin@maternal.gov.et',
        password: 'admin123',
        role: UserRole.SUPER_ADMIN,
      });

      console.log('Super Admin created');
      console.log('Email: admin@maternal.gov.et');
      console.log('Password: admin123');
      console.log('Role: SUPER_ADMIN');
    } else {
      // Update existing user to have SUPER_ADMIN role
      await usersService.update((existingAdmin as any)._id.toString(), {
        name: existingAdmin.name,
        email: existingAdmin.email,
        role: UserRole.SUPER_ADMIN,
        // Don't update password to keep existing one
      });
      console.log('Updated existing user to SUPER_ADMIN role');
      console.log('Email: admin@maternal.gov.et');
      console.log('Password: admin123');
      console.log('Role: SUPER_ADMIN');
    }
    
    // Create sample system admin for Addis Ababa (commented out)
    /*
    const existingSystemAdmin = await usersService.findByEmail('addis.admin@maternal.gov.et');
    if (!existingSystemAdmin) {
      await usersService.create({
        name: 'Addis Ababa System Admin',
        email: 'addis.admin@maternal.gov.et',
        password: 'admin123',
        role: UserRole.SYSTEM_ADMIN,
        assignedRegion: 'Addis Ababa',
      });

      console.log('Addis Ababa System Admin created');
      console.log('Email: addis.admin@maternal.gov.et');
      console.log('Password: admin123');
      console.log('Role: SYSTEM_ADMIN');
      console.log('Region: Addis Ababa');
    } else {
      console.log('Addis Ababa system admin already exists');
    }
    */
    
  } catch (error) {
    console.error('Error during seeding:', error.message);
  } finally {
    await app.close();
  }
}

bootstrap();
