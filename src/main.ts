import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './core/filter/http-exception/http-exception.filter';
import { TransformInterceptor } from './core/interceptor/transform/transform.interceptor';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { LoggerService } from './logger/logger.service';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  // 注册全局 logger 拦截器
  const loggerService = app.get(LoggerService);

  // 注册全局错误的过滤器
  app.useGlobalFilters(new HttpExceptionFilter(loggerService));
  // 全局注册拦截器
  app.useGlobalInterceptors(new TransformInterceptor(loggerService));
  // 注册全局管道
  app.useGlobalPipes(new ValidationPipe());
  // 配置swagger
  // 设置swagger文档
  const config = new DocumentBuilder()
    .setTitle('管理后台')
    .setDescription('管理后台接口文档')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  app.useStaticAssets('public', { prefix: '/static' });
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
