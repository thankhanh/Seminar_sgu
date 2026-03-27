import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';

async function bootstrap() {
  try {
    console.log('Bootstrapping AppModule...');
    // Enable debug logging for NestJS
    process.env.NESTJS_DEBUG = 'true';
    const app = await NestFactory.create(AppModule, {
      logger: ['error', 'warn', 'log', 'debug', 'verbose'],
    });
    console.log('App created successfully');
    await app.close();
  } catch (error) {
    console.error('FAILED TO BOOTSTRAP:');
    if (error instanceof Error) {
      console.error('Message:', error.message);
      console.error('Stack:', error.stack);
    } else {
      console.dir(error);
    }
    process.exit(1);
  }
}
bootstrap();
