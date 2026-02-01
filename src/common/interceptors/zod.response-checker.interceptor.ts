/* eslint-disable @typescript-eslint/no-redundant-type-constituents */
import {
  type CallHandler,
  type ExecutionContext,
  Inject,
  Injectable,
  type NestInterceptor,
  StreamableFile,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { type ZodDto } from 'nestjs-zod';
import { map, type Observable } from 'rxjs';
import { z, ZodError } from 'zod';

const ZodSerializerDtoOptions = 'ZOD_SERIALIZER_DTO_OPTIONS' as const;

@Injectable()
export class ZodSerializerInterceptorCustom implements NestInterceptor {
  constructor(@Inject(Reflector) protected readonly reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const responseSchema = this.getContextResponseSchema(context);

    return next.handle().pipe(
      map((res: object | object[]) => {
        if (!responseSchema) return res;
        if (res instanceof StreamableFile) return res;

        try {
          if (this.isZodDto(responseSchema)) {
            return responseSchema.schema.parse(res);
          } else {
            return responseSchema.parse(res);
          }
        } catch (error) {
          if (error instanceof ZodError) {
            throw error;
          }
          throw error;
        }
      }),
    );
  }

  protected getContextResponseSchema(
    context: ExecutionContext,
  ): ZodDto<z.ZodTypeAny> | z.ZodTypeAny | undefined {
    return this.reflector.getAllAndOverride(ZodSerializerDtoOptions, [
      context.getHandler(),
      context.getClass(),
    ]);
  }

  private isZodDto(
    schema: ZodDto<z.ZodTypeAny> | z.ZodTypeAny,
  ): schema is ZodDto<z.ZodTypeAny> {
    return typeof (schema as ZodDto<z.ZodTypeAny>).schema === 'object';
  }
}
