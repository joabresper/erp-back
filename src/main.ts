import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { PrismaClientExceptionFilter } from './common/prisma-client-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('ERP API')
    .setDescription('API para la gestión del sistema ERP')
    .setVersion('1.0')
    .addTag('erp')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,            // ignora parametros no esperados
      forbidNonWhitelisted: true, // lanza una excepcion cuando recibe parametros no esperados
      transform: true,            // transforma tipos de datos
      transformOptions: {
        enableImplicitConversion: true, // convierte strings a números/booleanos automáticamente
      },
    }),
  );

  app.useGlobalFilters(new PrismaClientExceptionFilter());

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
