import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Put,
  HttpCode,
  HttpStatus,
  UseGuards,
  Req,
  Patch,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiParam,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ZodSerializerDto } from 'nestjs-zod';
import { createBaseResponseDto } from 'src/helpers/create-base-response.helper';
import { ProfileService } from './profile.service';
import {
  ProfileArrayResponseSchema,
  ProfileSingleResponseSchema,
  CreateProfileRequestDto,
  GetProfileByIdRequestDto,
  UpdateProfileRequestDto,
  UpdateUserNameSchema,
  UserResponseSchema,
  UpdateUserNameDto,
} from './dto/profile.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import type { AuthenticatedRequest } from 'src/shared/request-with-user-type';

@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller('profiles')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}


@Patch('me/name')
@HttpCode(HttpStatus.OK)
@ApiOperation({ summary: 'Update current user name' })
@ApiBody({ type: UpdateUserNameDto })
@ApiOkResponse({
  type: createBaseResponseDto(
    UserResponseSchema,
    'UserResponseSchema',
  ),
})
@ZodSerializerDto(UserResponseSchema)
async updateMyName(
  @Req() req: AuthenticatedRequest,
  @Body() input: UpdateUserNameDto,
) {
  return this.profileService.updateUserName(
    req.user.id,
    input.name,
  );
}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiBody({type: CreateProfileRequestDto})
  @ApiOperation({ summary: 'Create a new user profile' })
  @ApiCreatedResponse({
    type: createBaseResponseDto(
      ProfileSingleResponseSchema,
      'ProfileSingleResponseSchema',
    ),
  })
  @ZodSerializerDto(ProfileSingleResponseSchema)
  async createProfile(@Req() req: AuthenticatedRequest, @Body() input: CreateProfileRequestDto) {
    return this.profileService.createProfile(req.user.id ,input);
  }

  @Get()
  @ApiOperation({ summary: 'Get all profiles' })
  @ApiOkResponse({
    type: createBaseResponseDto(
      ProfileArrayResponseSchema,
      'ProfileArrayResponseSchema',
    ),
  })
  @ZodSerializerDto(ProfileArrayResponseSchema)
  async getProfiles() {
    return this.profileService.getProfiles();
  }

  @Get('single')
  @ApiOperation({ summary: 'Get single profile by ID' })
  @ApiOkResponse({
    type: createBaseResponseDto(
      ProfileSingleResponseSchema,
      'ProfileSingleResponseSchema',
    ),
  })
  @ZodSerializerDto(ProfileSingleResponseSchema)
  async getSingleProfile(@Req() req: AuthenticatedRequest) {
    return this.profileService.getSingleProfile(req.user.id);
  }

  @Put()
  @HttpCode(HttpStatus.OK)
  @ApiBody({type: UpdateProfileRequestDto})
  @ApiOperation({ summary: 'Update existing profile fields' })
  @ApiOkResponse({
    type: createBaseResponseDto(
      ProfileSingleResponseSchema,
      'ProfileSingleResponseSchema',
    ),
  })
  @ZodSerializerDto(ProfileSingleResponseSchema)
  async updateProfile(@Body() input: UpdateProfileRequestDto, @Req() req: AuthenticatedRequest) {
    return this.profileService.updateProfile(input, req.user.id);
  }
}