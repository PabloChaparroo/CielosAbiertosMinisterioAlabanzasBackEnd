import "reflect-metadata";
import { ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "./app.module";
import { AppConfig } from "./config/configuration";
import { HttpExceptionFilter } from "./common/filters/http-exception.filter";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService<AppConfig, true>);

  app.enableCors({ origin: configService.get("frontendUrl", { infer: true }), credentials: true });
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());
  app.setGlobalPrefix("api");

  // La documentación de la API (/api/docs) lista todos los endpoints: solo fuera de producción
  const isProduction = configService.get("nodeEnv", { infer: true }) === "production";
  if (!isProduction) {
    const swaggerConfig = new DocumentBuilder()
      .setTitle("Cielos Abiertos Alabanzas API")
      .setDescription("API del ministerio de alabanza: canciones, letras, acordes, setlists y equipo")
      .setVersion("0.1")
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup("api/docs", app, document);
  }

  const port = configService.get("port", { infer: true });
  await app.listen(port);
  console.log(`[api] escuchando en el puerto ${port} (/api${isProduction ? "" : ", docs en /api/docs"})`);
}

bootstrap();
