import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { RegionsService } from './src/regions/regions.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const regionsService = app.get(RegionsService);

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

  console.log('Seeding regions...');
  for (const r of regions) {
    try {
      await regionsService.create(r);
      console.log(`Created region: ${r.name}`);
    } catch (e) {
      console.log(`Region ${r.name} already exists or failed: ${e.message}`);
    }
  }

  await app.close();
}

bootstrap();
