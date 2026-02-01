import { createZodDto } from 'nestjs-zod/dto';
import { type UserRoleEnum, UserSchema } from 'src/utils/zod.schema';
import { z } from 'zod';

type JWTPayloadType = {
  sub: string;
  email: string;
  role: UserRoleEnum;
};

const CustomAuthCredentialsSchema = UserSchema.pick({ email: true })
  .extend({
      password: z.string().min(8).describe('User password'),
  })
  .describe('Custom Auth credentials data');

const SocialAuthCredentialsSchema = z
  .object({
    provider: z.enum(['GOOGLE', 'FACEBOOK']).describe('Auth provider'),
    token: z.string().describe('OAuth token (access_token for Google, access_token for Facebook)'),
  })
  .describe('OAuth credentials for social authentication');

const AuthUserResponseSchema = z.object({
  token: z.string().describe('JWT access token'),

  role: z.enum(['USER', 'SHOP_OWNER'])
    .describe('User role'),

  redirectTo: z.literal('/')
    .describe('Redirect path after login'),

  user: z.object({
    id: z.uuid(),
    phone: z.string().nullable(),
    email: z.email().nullable(),
    name: z.string().nullable(),
  }).describe('Authenticated user data'),
});

const AuthAdminResponseSchema = z
  .object({
    token: z.string().describe('JWT access token'),
    role: z.literal('ADMIN').describe('Admin role'),
    redirectTo: z.literal('/admin').describe('Redirect path after login'),
    user: z.object({
      id: z.uuid(),
      phone: z.string().nullable(),
      email: z.email().nullable(),
      name: z.string().nullable(),
  }).describe('Authenticated user data'),
  })
  .describe('Response data after admin login or register');

export const SendVerificationRequestSchema = UserSchema.pick({email: true}).describe('Email verification request schema');

export const VerifyAndRegisterRequestSchema = UserSchema.pick({ email: true }).extend({
  password: z.string().min(8).max(8),
});

const SocialsProfileSchema  = UserSchema.pick({email: true}).extend({
  id: z.string(),
  name: z.string().optional(),
})

const AccessTokenRequestSchema = z.object({
  token: z.string(),
}).describe('Access token received either from google or facebook')


export const SendPhoneCodeSchema = z
  .object({
    phone: z
      .string()
      .min(7)
      .max(20)
      .describe('Phone number in international format (e.g. +998901234567)'),
  })
  .describe('Telegram phone verification request');


  export const VerifyPhoneCodeSchema = z
  .object({
    phone: z
      .string()
      .min(7)
      .max(20)
      .describe('Phone number used for verification'),

    requestId: z
      .string()
      .describe('Telegram verification request ID'),

    code: z
      .string()
      .length(6)
      .describe('6-digit verification code from Telegram'),
  })
  .describe('Telegram phone verification payload');


class SendPhoneCodeDto extends createZodDto(SendPhoneCodeSchema) {}
class VerifyPhoneCodeDto extends createZodDto(VerifyPhoneCodeSchema) {}

class SocialAuthCredentialsDto extends createZodDto(SocialAuthCredentialsSchema) {}
class AuthAdminResponseDto extends createZodDto(AuthAdminResponseSchema) {}
class CustomAuthCredentialsDto extends createZodDto(CustomAuthCredentialsSchema) {}
class AuthUserResponseDto extends createZodDto(AuthUserResponseSchema) {}
class SendVerificationRequestDto extends createZodDto(SendVerificationRequestSchema) {}
class VerifyAndRegisterRequestDto extends createZodDto(VerifyAndRegisterRequestSchema) {}
class SocialsProfileDto extends createZodDto(SocialsProfileSchema){}
class AccessTokenRequestDto extends createZodDto(AccessTokenRequestSchema){}

export {
  CustomAuthCredentialsSchema,
  SendPhoneCodeDto,
  VerifyPhoneCodeDto,
  CustomAuthCredentialsDto,
  AuthUserResponseSchema,
  AuthUserResponseDto,
  AuthAdminResponseSchema,
  AuthAdminResponseDto,
  type JWTPayloadType,
  SocialAuthCredentialsSchema,
  SocialAuthCredentialsDto,
  SendVerificationRequestDto,
  VerifyAndRegisterRequestDto,
  SocialsProfileDto,
  SocialsProfileSchema,
  AccessTokenRequestSchema,
  AccessTokenRequestDto,
};