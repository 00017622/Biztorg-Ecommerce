import type { Request } from 'express';
import type { UserSchemaType } from 'src/utils/zod.schema';

export type AuthenticatedRequest = Request & {
  user: UserSchemaType;
};