import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "../users/entities/user.entity";
import { SetlistTemplatesController } from "./controllers/setlist-templates.controller";
import { SetlistsController } from "./controllers/setlists.controller";
import { SetlistItem } from "./entities/setlist-item.entity";
import { SetlistTemplate } from "./entities/setlist-template.entity";
import { Setlist } from "./entities/setlist.entity";
import { SetlistTemplatesService } from "./services/setlist-templates.service";
import { SetlistsService } from "./services/setlists.service";

@Module({
  imports: [TypeOrmModule.forFeature([Setlist, SetlistItem, SetlistTemplate, User])],
  controllers: [SetlistsController, SetlistTemplatesController],
  providers: [SetlistsService, SetlistTemplatesService],
})
export class SetlistsModule {}
