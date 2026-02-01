/* eslint-disable @typescript-eslint/no-base-to-string */
import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
  HttpException,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { createBaseErrorResponse } from 'src/helpers/create-base-error-response.helper';
import type { ErrorDetailsSchemaType } from 'src/utils/zod.schema';
import { z } from 'zod';

type ZodIssue = z.core.$ZodIssue;

interface HttpErrorResponse {
  message?: string;
  errors?: ErrorDetailsSchemaType[];
}

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {

  catch(exception: HttpException, host: ArgumentsHost): void {
    Logger.error(exception.message, HttpExceptionFilter.name);

    const [request, response] = [
      host.switchToHttp().getRequest<Request>(),
      host.switchToHttp().getResponse<Response>(),
    ];

    const status = exception.getStatus();
    const rawResponse = exception.getResponse();

    const { message, errors } = this.parseHttpException(
      rawResponse,
      exception.message,
    );

    response
      .status(status)
      .json(createBaseErrorResponse(status, message, errors, request.url));
  }

  private parseHttpException(
    rawResponse: unknown,
    defaultMessage: string,
  ): { message: string; errors?: ErrorDetailsSchemaType[] } {
    if (!rawResponse || typeof rawResponse !== 'object') {
      return { message: String(rawResponse ?? defaultMessage) };
    }

    const typed: HttpErrorResponse = rawResponse;

    return {
      message: typed.message ?? defaultMessage,
      errors: typed.errors?.map((issue: ZodIssue) => ({
        field: issue.path?.length ? issue.path.join('.') : 'root',
        message: issue.message,
        code: issue.code?.toUpperCase(),
      })),
    };
  }
}
