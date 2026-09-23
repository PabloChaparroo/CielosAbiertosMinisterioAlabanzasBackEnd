import { BadRequestException, Injectable, Logger, OnModuleInit } from "@nestjs/common";
import {
  CreateBucketCommand,
  GetObjectCommand,
  HeadBucketCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { ConfigService } from "@nestjs/config";
import { randomUUID } from "crypto";
import { AppConfig } from "../../config/configuration";

const UPLOAD_URL_TTL_SECONDS = 300;
const DOWNLOAD_URL_TTL_SECONDS = 3600;

/**
 * Solo se valida acá el `contentType` de "audios" (lo único con un flujo de
 * subida real hoy). "letras" queda sin whitelist a propósito: la subida de
 * foto de letra sigue siendo un placeholder de UI, no hay flujo real que
 * proteger todavía — agregarle una whitelist ahora sería validar algo que
 * nadie usa.
 */
const ALLOWED_AUDIO_CONTENT_TYPES = [
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/x-wav",
  "audio/wave",
  "audio/ogg",
  "audio/mp4",
  "audio/x-m4a",
  "audio/aac",
  "audio/webm",
];

@Injectable()
export class StorageService implements OnModuleInit {
  private readonly logger = new Logger(StorageService.name);
  private readonly client: S3Client;
  private readonly bucket: string;

  constructor(configService: ConfigService<AppConfig, true>) {
    const s3 = configService.get("s3", { infer: true });
    this.bucket = s3.bucket;
    this.client = new S3Client({
      endpoint: s3.endpoint,
      region: s3.region,
      forcePathStyle: s3.forcePathStyle,
      credentials: { accessKeyId: s3.accessKey, secretAccessKey: s3.secretKey },
    });
  }

  /**
   * Nada en el stack (ni docker-compose, ni ningún script) crea el bucket
   * — se descubrió recién en este ticket, al intentar subir un archivo real
   * por primera vez desde que existe este servicio: getUploadUrl() firmaba
   * una URL perfectamente válida contra un bucket que no existía, y MinIO
   * respondía 404 en el PUT real. Se chequea acá al bootear, una vez, en
   * vez de agregar un contenedor `mc` aparte a docker-compose — así
   * cualquier entorno nuevo (clonar el repo + docker compose up) funciona
   * sin un paso manual extra. No es fatal si falla (ej. MinIO no
   * disponible todavía al bootear): solo loggea, no tira el arranque.
   */
  async onModuleInit(): Promise<void> {
    try {
      await this.client.send(new HeadBucketCommand({ Bucket: this.bucket }));
    } catch {
      try {
        await this.client.send(new CreateBucketCommand({ Bucket: this.bucket }));
        this.logger.log(`Bucket "${this.bucket}" no existía, se creó automáticamente.`);
      } catch (err) {
        this.logger.warn(
          `No se pudo verificar/crear el bucket "${this.bucket}" — la subida de archivos va a fallar hasta que exista. ${err instanceof Error ? err.message : err}`,
        );
      }
    }
  }

  /**
   * El browser sube el binario directo al bucket con esta URL; el backend
   * nunca recibe el archivo, solo genera la URL y persiste la key final.
   *
   * Esto valida el tipo de contenido ANTES de generar la URL (así el
   * rechazo de un archivo no-audio es un 400 nuestro con mensaje claro, no
   * un error crudo de S3/MinIO) pero NO valida tamaño: un PutObjectCommand
   * firmado así no lleva restricción de tamaño — eso requeriría un
   * presigned POST con política de content-length-range, cambio de
   * arquitectura fuera de alcance. El límite de 20MB del cliente es
   * puramente client-side y cualquiera con las devtools puede saltarlo.
   */
  async getUploadUrl(
    folder: "audios" | "letras",
    contentType: string,
  ): Promise<{ uploadUrl: string; key: string }> {
    if (folder === "audios" && !ALLOWED_AUDIO_CONTENT_TYPES.includes(contentType)) {
      throw new BadRequestException(
        "Formato de audio no soportado. Subí un archivo mp3, wav, ogg, m4a o aac.",
      );
    }
    const key = `${folder}/${randomUUID()}`;
    const command = new PutObjectCommand({ Bucket: this.bucket, Key: key, ContentType: contentType });
    const uploadUrl = await getSignedUrl(this.client, command, { expiresIn: UPLOAD_URL_TTL_SECONDS });
    return { uploadUrl, key };
  }

  async getDownloadUrl(key: string): Promise<string> {
    const command = new GetObjectCommand({ Bucket: this.bucket, Key: key });
    return getSignedUrl(this.client, command, { expiresIn: DOWNLOAD_URL_TTL_SECONDS });
  }
}
