import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });
  
  app.useGlobalPipes(new ValidationPipe({ 
    transform: true,
    whitelist: false,
  }));
  
  app.setGlobalPrefix('api/v1');
  
  await app.listen(3000);
  console.log('🚀 API démarrée sur http://localhost:3000');
}
bootstrap();
