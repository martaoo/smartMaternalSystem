import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { UsersService } from './users/users.service';
import { UserRole } from './common/enums/user-role.enum';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  
  try {
    const usersService = app.get(UsersService);

    // Find existing admin
    const existingAdmin = await usersService.findByEmail('admin@maternal.gov.et');
    if (existingAdmin) {
      // Update password back to 'admin123' without hashing
      await usersService.update((existingAdmin as any)._id.toString(), {
        name: existingAdmin.name,
        email: existingAdmin.email,
        role: UserRole.MOH_ADMIN,
        password: 'admin123', // This will be hashed by the service
      });

      console.log('Admin password reset to: admin123');
      console.log('Email: admin@maternal.gov.et');
      console.log('Role: SUPER_ADMIN');
    } else {
      console.log('Admin user not found');
    }
    
  } catch (error) {
    console.error('Error during password reset:', error.message);
  } finally {
    await app.close();
  }
}

bootstrap();
