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

@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGODB_URI || 'mongodb://localhost:27017/maternal-health'),
    AuthModule,
    UsersModule,
    HospitalsModule,
    WoredasModule,
    MothersModule,
    PregnancyModule,
    ChildrenModule,
    VaccinationsModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
