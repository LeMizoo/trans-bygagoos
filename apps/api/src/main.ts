import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: '*',
    credentials: true,
  });
  
  app.setGlobalPrefix('api/v1');
  
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });
  
// Push DB schema  try {    const { execSync } = require('child_process');    execSync('npx prisma db push --accept-data-loss', { stdio: 'ignore' });    console.log('✅ DB schema poussé');  } catch (e) {    console.log('⚠️ DB push ignoré:', e.message);  }
  await app.listen(process.env.PORT || 3000);
  console.log('🚀 API démarrée');

  // Seed automatique des flottes de test
  try {
    const http = require('http');
    const port = process.env.PORT || 3000;
    const options = {
      hostname: 'localhost',
      port: port,
      path: '/api/v1/flottes/seed-create',
      method: 'POST',
    };
    const req = http.request(options, (res: any) => {
      let data = '';
      res.on('data', (chunk: string) => data += chunk);
      res.on('end', () => console.log('🌱 Seed auto:', data));
    });
    req.on('error', (e: any) => console.log('⚠️ Seed auto ignoré:', e.message));
    req.end();
  } catch (e) {
    console.log('⚠️ Seed auto non exécuté');
  }
}
bootstrap();
