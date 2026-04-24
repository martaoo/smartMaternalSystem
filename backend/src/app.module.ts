import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { HospitalsModule } from './hospitals/hospitals.module';
import { WoredasModule } from './woredas/woredas.module';
import { MothersModule } from './mothers/mothers.module';
import { PregnancyModule } from './pregnancy/pregnancy.module';
import { ChildrenModule } from './children/children.module';
import { VaccinationsModule } from './vaccinations/vaccinations.module';
import { AppController } from './app.controller';
import { ScheduleModule } from '@nestjs/schedule';
import { ReferralsModule } from './referrals/referrals.module';



 @Module({
  imports: [
    // 1. Database Configuration
    MongooseModule.forRoot(process.env.MONGODB_URI || 'mongodb://localhost:27017/maternal-health'),
    
    // 2. Task Scheduling (CRITICAL: Must be inside the imports array)
    ScheduleModule.forRoot(), 
    
    // 3. Feature Modules
    AuthModule,
    UsersModule,
    ReferralsModule,
    HospitalsModule,
    WoredasModule,
    MothersModule,
    PregnancyModule,
    ChildrenModule,
    VaccinationsModule,
    // Add ReferralsModule here if it exists!
  ],
  controllers: [AppController],
  providers: [], // Add your global services here if needed
})
export class AppModule {}
