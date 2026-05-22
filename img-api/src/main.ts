import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { join } from 'path';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors(/*{
    origin: 'http://localhost:4200',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  }*/);
  app.use('/files', express.static(join(process.cwd(), 'files')));
  await app.listen(process.env.PORT ?? 3010);
}
bootstrap();
