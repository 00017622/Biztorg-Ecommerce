import { Body, Controller, HttpCode, HttpStatus, Post, Res } from "@nestjs/common";
import { ApiBadRequestResponse, ApiBody, ApiConflictResponse, ApiCreatedResponse, ApiOkResponse, ApiTags, ApiUnauthorizedResponse } from "@nestjs/swagger";
import { AuthService } from "./auth.service";
import { 
  SendVerificationRequestDto, 
  VerifyAndRegisterRequestDto, 
  CustomAuthCredentialsDto, 
  AuthUserResponseDto, 
  AuthAdminResponseDto, 
  AuthUserResponseSchema,
  AuthAdminResponseSchema,
  AccessTokenRequestDto,
  SendPhoneCodeDto,
  VerifyPhoneCodeDto
} from "./dto/auth.dto";
import { createBaseResponseDto } from "src/helpers/create-base-response.helper";
import { ZodSerializerDto } from "nestjs-zod";
import type { Response } from "express";

@ApiTags("Auth")
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}


@Post('phone/send-code')
@HttpCode(HttpStatus.CREATED)
@ApiBody({ type: SendPhoneCodeDto })
@ApiCreatedResponse({
  description: 'Telegram verification code sent',
  schema: {
    type: 'object',
    properties: {
      requestId: { type: 'string', example: 'REQ_123456' },
    },
  },
})
@ApiBadRequestResponse({
  description: 'Invalid phone number',
})
async sendPhoneCode(@Body() body: SendPhoneCodeDto) {
  return this.authService.sendPhoneVerificationCode(body);
}

@Post('phone/verify')
@HttpCode(HttpStatus.CREATED)
@ApiBody({ type: VerifyPhoneCodeDto })
@ApiCreatedResponse({
  type: createBaseResponseDto(
    AuthUserResponseSchema,
    'AuthUserResponseSchema',
  ),
})
@ApiBadRequestResponse({
  description: 'Invalid or expired verification code',
})
@ApiUnauthorizedResponse({
  description: 'Verification failed',
})
@ZodSerializerDto(AuthUserResponseSchema)
async verifyPhoneCode(
  @Body() body: VerifyPhoneCodeDto,
  @Res({ passthrough: true }) res: Response,
): Promise<AuthUserResponseDto> {
   const result = await this.authService.verifyPhoneCode(body);

  res.cookie('access_token', result.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return result;
}

  @Post("send-verification-code")
  @HttpCode(HttpStatus.CREATED)
  @ApiBody({ type: SendVerificationRequestDto })
  @ApiCreatedResponse({
  description: 'Verification code sent successfully',
  schema: {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: true },
      statusCode: { type: 'number', example: 201 },
      message: { type: 'string', example: 'Verification password sent to email' },
      path: { type: 'string', example: '/auth/send-verification-code' },
      timestamp: { type: 'string', example: new Date().toISOString() },
    },
  },
})

  @ApiConflictResponse({
    description: 'The user with such email already exists',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: false },
        statusCode: { type: 'number', example: 409 },
        message: { type: 'string', example: 'Email already in use' },
        path: { type: 'string', example: '/auth/send-verification-code' },
        timestamp: { type: 'string', example: new Date().toISOString() },
      },
    },
  })
   @ApiBadRequestResponse({
    description: 'Validation failed',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: false },
        statusCode: { type: 'number', example: 400 },
        message: { type: 'string', example: 'Validation failed' },
        errors: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              field: { type: 'string', example: 'email' },
              message: { type: 'string', example: 'Invalid email format' },
              code: { type: 'string', example: 'INVALID_EMAIL' },
            },
          },
          example: [
            {
              field: 'email',
              message: 'Invalid email format',
              code: 'INVALID_EMAIL',
            },
          ],
        },
        path: { type: 'string', example: '/auth/send-verification-code' },
        timestamp: { type: 'string', example: new Date().toISOString() },
      },
    },
  })
  async sendVerificationCode(@Body() body: SendVerificationRequestDto) {
    return this.authService.sendVerificatioCode(body);
  }


  @Post("verify-and-register")
  @HttpCode(HttpStatus.CREATED)
  @ApiBody({ type: VerifyAndRegisterRequestDto })
   @ApiBadRequestResponse({
    description: 'Validation failed',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: false },
        statusCode: { type: 'number', example: 400 },
        message: { type: 'string', example: 'Validation failed' },
        errors: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              field: { type: 'string', example: 'email' },
              message: { type: 'string', example: 'Invalid email format' },
              code: { type: 'string', example: 'INVALID_EMAIL' },
            },
          },
          example: [
            {
              field: 'email',
              message: 'Invalid email format',
              code: 'INVALID_EMAIL',
            },
            {
              field: 'password',
              message: 'Password must be at least 8 characters long',
              code: 'WEAK_PASSWORD',
            },
          ],
        },
        path: { type: 'string', example: '/auth/verify-and-register' },
        timestamp: { type: 'string', example: new Date().toISOString() },
      },
    },
  })
   @ApiCreatedResponse({
    type: createBaseResponseDto(
      AuthUserResponseSchema,
      'AuthUserResponseSchema',
    ),
  })
  async verifyAndRegister(
    @Body() body: VerifyAndRegisterRequestDto
  ): Promise<AuthUserResponseDto> {
    return this.authService.verifyAndRegister(body);
  }

  @Post("login")
  @HttpCode(HttpStatus.OK)
  @ApiBody({ type: CustomAuthCredentialsDto })
  @ApiOkResponse({
    type: createBaseResponseDto(
      AuthUserResponseSchema,
      'AuthUserResponseSchema',
    ),
  })
    @ApiBadRequestResponse({
    description: 'Validation failed',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: false },
        statusCode: { type: 'number', example: 400 },
        message: { type: 'string', example: 'Validation failed' },
        errors: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              field: { type: 'string', example: 'email' },
              message: { type: 'string', example: 'Invalid email format' },
              code: { type: 'string', example: 'INVALID_EMAIL' },
            },
          },
          example: [
            {
              field: 'email',
              message: 'Invalid email format',
              code: 'INVALID_EMAIL',
            },
            {
              field: 'password',
              message: 'Password must be at least 8 characters long',
              code: 'WEAK_PASSWORD',
            },
          ],
        },
        path: { type: 'string', example: '/auth/login' },
        timestamp: { type: 'string', example: new Date().toISOString() },
      },
    },
  })
    @ApiUnauthorizedResponse({
    description: 'Invalid credentials',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: false },
        statusCode: { type: 'number', example: 401 },
        message: { type: 'string', example: 'Invalid credentials' },
        path: { type: 'string', example: '/auth/login' },
        timestamp: { type: 'string', example: new Date().toISOString() },
      },
    },
  })
  @ZodSerializerDto(AuthUserResponseSchema)
  async customLogin(
    @Body() dto: CustomAuthCredentialsDto
  ): Promise<AuthUserResponseDto> {
    return this.authService.customAuthLogin(dto);
  }

   @Post("google/login")
  @HttpCode(HttpStatus.OK)
  @ApiBody({
    type: AccessTokenRequestDto
  })
  @ApiOkResponse({
    type: createBaseResponseDto(AuthUserResponseSchema, "AuthUserResponseSchema"),
  })
  @ApiBadRequestResponse({
    description: "Validation failed",
    schema: {
      type: "object",
      properties: {
        success: { type: "boolean", example: false },
        statusCode: { type: "number", example: 400 },
        message: { type: "string", example: "Validation failed" },
        path: { type: "string", example: "/auth/google/login" },
        timestamp: { type: "string", example: new Date().toISOString() },
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: "Invalid Google token",
    schema: {
      type: "object",
      properties: {
        success: { type: "boolean", example: false },
        statusCode: { type: "number", example: 401 },
        message: { type: "string", example: "Invalid Google token" },
        path: { type: "string", example: "/auth/google/login" },
        timestamp: { type: "string", example: new Date().toISOString() },
      },
    },
  })
  @ZodSerializerDto(AuthUserResponseSchema)
  async googleLogin(
    @Body() body: AccessTokenRequestDto
  ): Promise<AuthUserResponseDto> {
    return this.authService.googleLogin(body.token);
  }

    @Post("facebook/login")
  @HttpCode(HttpStatus.OK)
  @ApiBody({
    type: AccessTokenRequestDto,
  })
  @ApiOkResponse({
    type: createBaseResponseDto(AuthUserResponseSchema, "AuthUserResponseSchema"),
  })
  @ApiBadRequestResponse({
    description: "Validation failed",
    schema: {
      type: "object",
      properties: {
        success: { type: "boolean", example: false },
        statusCode: { type: "number", example: 400 },
        message: { type: "string", example: "Validation failed" },
        path: { type: "string", example: "/auth/facebook/login" },
        timestamp: { type: "string", example: new Date().toISOString() },
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: "Invalid Facebook token",
    schema: {
      type: "object",
      properties: {
        success: { type: "boolean", example: false },
        statusCode: { type: "number", example: 401 },
        message: { type: "string", example: "Invalid Facebook token" },
        path: { type: "string", example: "/auth/facebook/login" },
        timestamp: { type: "string", example: new Date().toISOString() },
      },
    },
  })
  @ZodSerializerDto(AuthUserResponseSchema)
  async facebookLogin(
    @Body() body: AccessTokenRequestDto
  ): Promise<AuthUserResponseDto> {
    return this.authService.facebookLogin(body.token);
  }

  @Post("admin/login")
  @HttpCode(HttpStatus.OK)
  @ApiBody({ type: CustomAuthCredentialsDto })
   @ApiBadRequestResponse({
    description: 'Validation failed',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: false },
        statusCode: { type: 'number', example: 400 },
        message: { type: 'string', example: 'Validation failed' },
        errors: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              field: { type: 'string', example: 'email' },
              message: { type: 'string', example: 'Invalid email format' },
              code: { type: 'string', example: 'INVALID_EMAIL' },
            },
          },
          example: [
            {
              field: 'email',
              message: 'Invalid email format',
              code: 'INVALID_EMAIL',
            },
            {
              field: 'password',
              message: 'Password must be at least 8 characters long',
              code: 'WEAK_PASSWORD',
            },
          ],
        },
        path: { type: 'string', example: '/auth/admin/login' },
        timestamp: { type: 'string', example: new Date().toISOString() },
      },
    },
  })
   @ApiOkResponse({
    type: createBaseResponseDto(
      AuthAdminResponseSchema,
      'AuthAdminResponseSchema',
    ),
  })
  async adminLogin(
    @Body() dto: CustomAuthCredentialsDto
  ): Promise<AuthAdminResponseDto> {
    return this.authService.adminLogin(dto);
  }
}
