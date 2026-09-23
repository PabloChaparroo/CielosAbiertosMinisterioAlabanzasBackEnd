import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { APP_GUARD } from "@nestjs/core";
import { TerminusModule } from "@nestjs/terminus";
import { TypeOrmModule } from "@nestjs/typeorm";
import { SnakeNamingStrategy } from "typeorm-naming-strategies";
import configuration, { AppConfig } from "./config/configuration";
import { validateEnv } from "./config/env.validation";
import { AuthorizationModule } from "./common/authorization/authorization.module";
import { JwtAuthGuard } from "./common/guards/jwt-auth.guard";
import { PermissionsGuard } from "./common/guards/permissions.guard";
import { StorageModule } from "./common/storage/storage.module";
import { HealthController } from "./health.controller";
import { AnnotationsModule } from "./modules/annotations/annotations.module";
import { AuthModule } from "./modules/auth/auth.module";
import { FavoritesModule } from "./modules/favorites/favorites.module";
import { RolesModule } from "./modules/roles/roles.module";
import { SetlistsModule } from "./modules/setlists/setlists.module";
import { SongsModule } from "./modules/songs/songs.module";
import { TagsModule } from "./modules/tags/tags.module";
import { UsersModule } from "./modules/users/users.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validate: validateEnv,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService<AppConfig, true>) => {
        const db = configService.get("db", { infer: true });
        return {
          type: "postgres" as const,
          host: db.host,
          port: db.port,
          username: db.user,
          password: db.password,
          database: db.database,
          namingStrategy: new SnakeNamingStrategy(),
          autoLoadEntities: true,
          synchronize: false,
        };
      },
    }),
    TerminusModule,
    AuthorizationModule,
    StorageModule,
    AuthModule,
    UsersModule,
    RolesModule,
    TagsModule,
    SongsModule,
    SetlistsModule,
    AnnotationsModule,
    FavoritesModule,
  ],
  controllers: [HealthController],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: PermissionsGuard },
  ],
})
export class AppModule {}
