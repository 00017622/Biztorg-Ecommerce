import { createZodDto } from 'nestjs-zod';
import { SuccessResponseSchema } from 'src/utils/zod.schema';
import type * as z from 'zod';

export function createBaseResponseDto(schema: z.ZodTypeAny, name: string): new (...args: any[]) => any {
  const responseSchema = SuccessResponseSchema(schema);
  const className = `${name}Dto`;

  const namedClass = {
    [className]: class extends createZodDto(responseSchema) {},
  };

  return namedClass[className];
}
