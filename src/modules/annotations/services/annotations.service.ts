import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { PermissionName } from "../../../common/authorization/permission.catalog";
import { AuthenticatedUser } from "../../auth/types/authenticated-user";
import { CreateAnnotationDto, UpdateAnnotationDto } from "../dto/annotation.dto";
import { Annotation } from "../entities/annotation.entity";

@Injectable()
export class AnnotationsService {
  constructor(
    @InjectRepository(Annotation)
    private readonly annotationRepo: Repository<Annotation>,
  ) {}

  findBySong(songId: string): Promise<Annotation[]> {
    return this.annotationRepo.find({
      where: { song: { id: songId } },
      relations: { author: true },
      order: { fechaHoraAlta: "ASC" },
    });
  }

  async create(dto: CreateAnnotationDto, author: AuthenticatedUser): Promise<Annotation> {
    const annotation = this.annotationRepo.create({
      song: { id: dto.songId } as never,
      author: { id: author.id } as never,
      text: dto.text,
    });
    return this.annotationRepo.save(annotation);
  }

  /**
   * Igual a canEditAnnotation() del frontend mockeado: el autor siempre puede
   * editar/borrar la suya; quien tenga anotacion:update (hoy: admin y líder,
   * vía el rol que se les haya asignado) puede editar/borrar cualquiera.
   * Se decide por permiso efectivo, no por nombre de rol — un rol es texto
   * libre creado desde la pantalla de administración, no una constante fija.
   */
  private assertCanEdit(
    annotation: Annotation,
    user: AuthenticatedUser,
    moderatorPermission: PermissionName,
  ) {
    const isOwner = annotation.author.id === user.id;
    const isModerator = user.permissions.includes(moderatorPermission);
    if (!isOwner && !isModerator) {
      throw new ForbiddenException("No podés editar la anotación de otro integrante");
    }
  }

  private async findByIdWithAuthor(id: string): Promise<Annotation> {
    const annotation = await this.annotationRepo.findOne({
      where: { id },
      relations: { author: true, song: true },
    });
    if (!annotation) throw new NotFoundException("Anotación no encontrada");
    return annotation;
  }

  async update(id: string, dto: UpdateAnnotationDto, user: AuthenticatedUser): Promise<Annotation> {
    const annotation = await this.findByIdWithAuthor(id);
    this.assertCanEdit(annotation, user, "anotacion:update");
    annotation.text = dto.text;
    return this.annotationRepo.save(annotation);
  }

  async remove(id: string, user: AuthenticatedUser): Promise<void> {
    const annotation = await this.findByIdWithAuthor(id);
    this.assertCanEdit(annotation, user, "anotacion:delete");
    await this.annotationRepo.softRemove(annotation);
  }
}
