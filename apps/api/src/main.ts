import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { execSync } from 'child_process';

async function bootstrap() {
  // Push DB schema AVANT de démarrer
  try {
    console.log('🗄️ Push DB schema...');
    execSync('npx prisma db push --accept-data-loss', { 
      cwd: __dirname + '/..',
      stdio: 'pipe' 
    });
    console.log('✅ DB schema OK');
  } catch (e: any) {
    console.log('⚠️ DB push error:', e.message);
  }

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
  
  await app.listen(process.env.PORT || 3000);
  console.log('🚀 API démarrée');

  // Seed automatique
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
    req.on('error', () => console.log('⚠️ Seed auto ignoré'));
    req.end();
  } catch (e) {
    console.log('⚠️ Seed auto non exécuté');
  }
}
bootstrap();
