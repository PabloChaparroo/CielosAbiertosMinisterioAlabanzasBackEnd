import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "../users/entities/user.entity";
import { SetlistsController } from "./controllers/setlists.controller";
import { SetlistItem } from "./entities/setlist-item.entity";
import { Setlist } from "./entities/setlist.entity";
import { SetlistsService } from "./services/setlists.service";

@Module({
  imports: [TypeOrmModule.forFeature([Setlist, SetlistItem, User])],
  controllers: [SetlistsController],
  providers: [SetlistsService],
})
export class SetlistsModule {}
