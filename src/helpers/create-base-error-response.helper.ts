import type { BaseErrorResponseSchemaType, ErrorDetailsSchemaType } from 'src/utils/zod.schema';

export function createBaseErrorResponse(
  statusCode: number,
  message: string,
  errors: ErrorDetailsSchemaType[] | null | undefined,
  path: string,
): BaseErrorResponseSchemaType & { errors?: ErrorDetailsSchemaType[] } {
  return {
    success: false,
    statusCode,
    message,
    data: null,
    ...(errors && errors.length > 0 ? { errors } : {}),
    timestamp: new Date().toISOString(),
    path,
  };
}
