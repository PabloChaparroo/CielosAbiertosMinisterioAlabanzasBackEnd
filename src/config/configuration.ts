export interface AppConfig {
  nodeEnv: string;
  port: number;
  frontendUrl: string;
  db: {
    host: string;
    port: number;
    user: string;
    password: string;
    database: string;
  };
  jwt: {
    secret: string;
    expiresIn: string;
  };
  s3: {
    endpoint: string;
    region: string;
    bucket: string;
    accessKey: string;
    secretKey: string;
    forcePathStyle: boolean;
  };
  queueRedis: {
    host: string;
    port: number;
    password: string;
  };
}

export default (): AppConfig => ({
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: Number(process.env.PORT) || 3000,
  frontendUrl: process.env.FRONTEND_URL ?? "http://localhost:8080",
  db: {
    host: process.env.DB_HOST ?? "localhost",
    port: Number(process.env.DB_PORT) || 5432,
    user: process.env.DB_USER ?? "postgres",
    password: process.env.DB_PASSWORD ?? "postgres",
    database: process.env.DB_NAME ?? "postgres",
  },
  jwt: {
    secret: process.env.JWT_SECRET ?? "change-me-in-production",
    expiresIn: process.env.JWT_EXPIRES_IN ?? "8h",
  },
  s3: {
    endpoint: process.env.S3_ENDPOINT ?? "http://localhost:9000",
    region: process.env.S3_REGION ?? "us-east-1",
    bucket: process.env.S3_BUCKET ?? "cielos-abiertos-media",
    accessKey: process.env.S3_ACCESS_KEY ?? "",
    secretKey: process.env.S3_SECRET_KEY ?? "",
    forcePathStyle: (process.env.S3_FORCE_PATH_STYLE ?? "true") === "true",
  },
  queueRedis: {
    host: process.env.QUEUE_REDIS_HOST ?? "127.0.0.1",
    port: Number(process.env.QUEUE_REDIS_PORT) || 6379,
    password: process.env.QUEUE_REDIS_PASSWORD ?? "",
  },
});
