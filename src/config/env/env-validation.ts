import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  MISTRAL_API_KEY: z.string().min(1),
  TG_GATEWAY_TOKEN: z.string(),
  DATABASE_URL: z.url(),
  PORT: z.string().length(4).transform(Number),
  JWT_SECRET: z.string().min(1),
  POSTGRES_USER: z.string().min(1),
  POSTGRES_PASSWORD: z.string().min(1),
  POSTGRES_DB: z.string().min(1),
  POSTGRES_PORT: z.string().min(1),
  MAIL_MAILER: z.string().min(1),
  MAIL_HOST: z.string().min(1),
  MAIL_PORT: z.string().length(3).transform(Number),
  MAIL_USERNAME: z.string().min(1),
  MAIL_PASSWORD: z.string().min(1),
  MAIL_ENCRYPTION: z.string().min(1),
  MAIL_FROM_ADDRESS: z.string().min(1),
  MAIL_FROM_NAME: z.string().min(1),
  SWAGGER_USER: z.string().min(1),
  SWAGGER_PASSWORD: z.string().min(1),
  GOOGLE_CLIENT_ID: z.string(),
  TELEGRAM_BOT_TOKEN: z.string(),
  TELEGRAM_CHAT_ID: z.string(),
  FACEBOOK_PAGE_ACCESS_TOKEN: z.string(),
  FACEBOOK_PAGE_ID: z.string(),
  INSTA_ACCESS_TOKEN: z.string(),
  INSTA_ACCOUNT_ID: z.string(),
  REDIS_HOST: z.string().min(1),
  REDIS_PORT: z.string().length(4).transform(Number),
  REDIS_TTL: z.string().min(1).transform(Number),
  FIREBASE_TYPE: z.literal('service_account'),
  FIREBASE_PROJECT_ID: z.string().min(1),
  FIREBASE_PRIVATE_KEY_ID: z.string().min(1),
  FIREBASE_PRIVATE_KEY: z.string().min(1),
  FIREBASE_CLIENT_EMAIL: z.email(),
  FIREBASE_CLIENT_ID: z.string().min(1),
  FIREBASE_AUTH_URI: z.url(),
  FIREBASE_TOKEN_URI: z.url(),
  FIREBASE_AUTH_PROVIDER_CERT_URL: z.url(),
  FIREBASE_CLIENT_CERT_URL: z.url(),
  FIREBASE_UNIVERSE_DOMAIN: z.string().min(1),
});

type EnvType = z.infer<typeof envSchema>;

function validateEnv() {
  return envSchema.parse(process.env);
}

export { type EnvType, validateEnv, envSchema };
