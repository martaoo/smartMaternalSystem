import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';

import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { HospitalsModule } from './hospitals/hospitals.module';
import { WoredasModule } from './woredas/woredas.module';
import { RegionsModule } from './regions/regions.module';
import { MothersModule } from './mothers/mothers.module';
import { PregnancyModule } from './pregnancy/pregnancy.module';
import { ChildrenModule } from './children/children.module';
import { VaccinationsModule } from './vaccinations/vaccinations.module';
import { ReferralsModule } from './referrals/referrals.module';

import { AppController } from './app.controller';

@Module({
  imports: [
    // Load .env globally
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // Database
    MongooseModule.forRoot(
      process.env.MONGODB_URI || 'mongodb://localhost:27017/maternal-health',
    ),

    // Scheduler
    ScheduleModule.forRoot(),

    // Feature Modules
    AuthModule,
    UsersModule,
    ReferralsModule,
    HospitalsModule,
    WoredasModule,
    RegionsModule,
    MothersModule,
    PregnancyModule,
    ChildrenModule,
    VaccinationsModule,
  ],

  controllers: [AppController],

  providers: [],
})
export class AppModule {}