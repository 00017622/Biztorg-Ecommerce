import { createZodDto } from 'nestjs-zod/dto';
import { ProfileSchema } from 'src/utils/zod.schema';
import { z } from 'zod';

const ProfileSingleResponseSchema = ProfileSchema.describe('Single profile response');

const ProfileArrayResponseSchema = ProfileSchema.array().describe('Array of profiles response');

const CreateProfileRequestSchema = ProfileSchema.pick({userId: true, googleId: true, facebookId: true,
     fcmToken: true, regionId: true}).describe('Create profile request schema');

const GetProfileByIdRequestSchema = z.object({
    id: z.uuid().describe('Profile Id that you passing')
}).describe('Get single profile Request schema')

const UpdateProfileRequestSchema = ProfileSchema.pick({userId: true, googleId: true, facebookId: true,
    fcmToken: true, regionId: true,
}).describe('Update category request schema')


const UpdateUserNameSchema = z.object({
  name: z
    .string()
    .min(1, 'Name cannot be empty')
    .max(100, 'Name is too long'),
});

export const UserResponseSchema = z.object({
  id: z.uuid(),
  phone: z.string().nullable(),
  email: z.string().nullable(),
  name: z.string().nullable(),
});

export class UserResponseDto extends createZodDto(
  UserResponseSchema,
) {}

class UpdateUserNameDto extends createZodDto(
  UpdateUserNameSchema,
) {}

class ProfileSingleResponseDto extends createZodDto(
  ProfileSingleResponseSchema,
) {}

class ProfileArrayResponseDto extends createZodDto(
  ProfileArrayResponseSchema,
) {}

class CreateProfileRequestDto extends createZodDto(
  CreateProfileRequestSchema,
) {}

class GetProfileByIdRequestDto extends createZodDto(
  GetProfileByIdRequestSchema,
) {}

class UpdateProfileRequestDto extends createZodDto(
  UpdateProfileRequestSchema,
) {}

export {
  UpdateUserNameSchema,
  UpdateUserNameDto,
    ProfileSingleResponseSchema,
    ProfileSingleResponseDto,
    ProfileArrayResponseSchema,
    ProfileArrayResponseDto,
    CreateProfileRequestSchema,
    CreateProfileRequestDto,
    GetProfileByIdRequestSchema,
    GetProfileByIdRequestDto,
    UpdateProfileRequestSchema,
    UpdateProfileRequestDto
}

