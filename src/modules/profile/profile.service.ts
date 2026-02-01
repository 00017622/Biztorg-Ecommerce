import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DrizzleAsyncProvider } from 'src/database/drizzle.provider';
import * as schema from 'src/database/schema';
import { eq } from 'drizzle-orm';
import {
  ProfileArrayResponseDto,
  ProfileSingleResponseDto,
  CreateProfileRequestDto,
  GetProfileByIdRequestDto,
  UpdateProfileRequestDto,
} from './dto/profile.dto';

@Injectable()
export class ProfileService {
  constructor(
    @Inject(DrizzleAsyncProvider)
    private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  async getProfiles(): Promise<ProfileArrayResponseDto> {
    const profiles = await this.db.query.profilesSchema.findMany();

    return profiles.map((p) => ({
      ...p,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
      deletedAt: p.deletedAt ? p.deletedAt.toISOString() : null,
    }));
  }

  async getSingleProfile(authenticatedUserId: string): Promise<ProfileSingleResponseDto> {

    const profile = await this.db.query.profilesSchema.findFirst({
      where: eq(schema.profilesSchema.userId, authenticatedUserId),
    });

    if (!profile) {
      throw new NotFoundException(`Profile with userId ${authenticatedUserId} not found`);
    }

    return {
      ...profile,
      createdAt: profile.createdAt.toISOString(),
      updatedAt: profile.updatedAt.toISOString(),
      deletedAt: profile.deletedAt ? profile.deletedAt.toISOString() : null,
    };
  }

  async createProfile(
    userId: string,
    input: CreateProfileRequestDto,
  ): Promise<ProfileSingleResponseDto> {
 
    const existing = await this.db.query.profilesSchema.findFirst({
      where: eq(schema.profilesSchema.userId, userId),
    });

    if (existing) {
      throw new ConflictException(
        `Profile already exists for user ${userId}`,
      );
    }

    const [profile] = await this.db
      .insert(schema.profilesSchema)
      .values({
        userId: userId,
        googleId: input.googleId || null,
        facebookId: input.facebookId || null,
        fcmToken: input.fcmToken || null,
        regionId: input.regionId,
      })
      .returning();

    return {
      ...profile,
      createdAt: profile.createdAt.toISOString(),
      updatedAt: profile.updatedAt.toISOString(),
      deletedAt: profile.deletedAt ? profile.deletedAt.toISOString() : null,
    };
  }
  
  async updateProfile(
    input: UpdateProfileRequestDto,
    userId: string,
  ): Promise<ProfileSingleResponseDto> {
    const profile = await this.db.query.profilesSchema.findFirst({
      where: eq(schema.profilesSchema.userId, userId),
    });

    if (!profile) {
      throw new NotFoundException(`Profile with userId ${userId} not found`);
    }

    const [updated] = await this.db
      .update(schema.profilesSchema)
      .set({
        googleId: input.googleId ?? profile.googleId,
        facebookId: input.facebookId ?? profile.facebookId,
        fcmToken: input.fcmToken ?? profile.fcmToken,
        regionId: input.regionId ?? profile.regionId,
        updatedAt: new Date(),
      })
      .where(eq(schema.profilesSchema.userId, userId))
      .returning();

    return {
      ...updated,
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
      deletedAt: updated.deletedAt ? updated.deletedAt.toISOString() : null,
    };
  }

  async updateUserName(
  userId: string,
  name: string,
) {
  const user = await this.db.query.usersSchema.findFirst({
    where: eq(schema.usersSchema.id, userId),
  });

  if (!user) {
    throw new NotFoundException(`User ${userId} not found`);
  }

  const [updatedUser] = await this.db
    .update(schema.usersSchema)
    .set({
      name,
      updatedAt: new Date(),
    })
    .where(eq(schema.usersSchema.id, userId))
    .returning();

  return {
    id: updatedUser.id,
    phone: updatedUser.phone ?? null,
    email: updatedUser.email ?? null,
    name: updatedUser.name ?? null,
  };
}

}
