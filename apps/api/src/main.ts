import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.enableCors({
    origin: [
      'http://localhost:5173',
      'http://localhost:5174',
      'https://trans-bygagoos.vercel.app',
      'https://trans-bygagoos-mobile.vercel.app',
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });
  
  app.setGlobalPrefix('api/v1');
  
  await app.listen(process.env.PORT || 3000);
  console.log('🚀 API démarrée sur http://localhost:3000');
}
bootstrap();
