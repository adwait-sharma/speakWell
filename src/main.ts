import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { Logger } from '@nestjs/common';
async function bootstrap() {
  const logger = new Logger('ApplicationBootstrap');
  const fastify = new FastifyAdapter({});
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    fastify,
    { bufferLogs: true },
  );
  await app.register(await require('@fastify/multipart'));
  process.on('uncaughtException', (exception) => {
    console.log('>>>>>>', exception);
    app.close();
    logger.log(exception);
    logger.log('Server stopped suddenly due to some uncaught exception');
    process.exit(0);
  });

  //for unhandledRejection
  process.on('unhandledRejection', (exception) => {
    console.log('>>>>>>', exception);
    app.close();
    logger.log('Server stopped suddenly due to some unhandled rejection');
    process.exit(0);
  });

  //graceful shutdown if interrupt signal is received (OS signal events)
  process.on('SIGINT', () => {
    app.close();
    logger.log('Server terminated gracefully');
    process.exit(0);
  });

  await app.listen(Number(process.env.PORT) || 3000);
}
bootstrap();
