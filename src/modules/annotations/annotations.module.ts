import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AnnotationsController } from "./controllers/annotations.controller";
import { Annotation } from "./entities/annotation.entity";
import { AnnotationsService } from "./services/annotations.service";

@Module({
  imports: [TypeOrmModule.forFeature([Annotation])],
  controllers: [AnnotationsController],
  providers: [AnnotationsService],
})
export class AnnotationsModule {}
