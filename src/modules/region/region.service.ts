import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DrizzleAsyncProvider } from 'src/database/drizzle.provider';
import * as schema from 'src/database/schema';
import { eq, ilike } from 'drizzle-orm';
import {
  CreateRegionRequestDto,
  UpdateRegionRequestDto,
  GetRegionByIdRequestDto,
  RegionArrayResponseDto,
  RegionSingleResponseDto,
  FindRegionByNameRequestDto,
} from './dto/region.dto';
import slugify from 'slugify';

@Injectable()
export class RegionService {
  constructor(
    @Inject(DrizzleAsyncProvider)
    private db: NodePgDatabase<typeof schema>,
  ) {}

  async getAllRegions(): Promise<RegionArrayResponseDto> {
    const regions = await this.db.query.regionsSchema.findMany();

    return regions.map((region) => ({
      ...region,
      createdAt: region.createdAt.toISOString(),
      updatedAt: region.updatedAt.toISOString(),
      deletedAt: region.deletedAt ? region.deletedAt.toISOString() : null,
    }));
  }

  async getSingleRegion(id: string): Promise<RegionSingleResponseDto> {
    const region = await this.db.query.regionsSchema.findFirst({
      where: eq(schema.regionsSchema.id, id),
    });

    if (!region) {
      throw new NotFoundException(`Region with id ${id} not found`);
    }

    return {
      ...region,
      createdAt: region.createdAt.toISOString(),
      updatedAt: region.updatedAt.toISOString(),
      deletedAt: region.deletedAt ? region.deletedAt.toISOString() : null,
    };
  }

  async searchRegionsByName(
    input: FindRegionByNameRequestDto,
  ): Promise<RegionArrayResponseDto> {
    const regions = await this.db.query.regionsSchema.findMany({
      where: ilike(schema.regionsSchema.name, `%${input.name}%`),
    });

    return regions.map((region) => ({
      ...region,
      createdAt: region.createdAt.toISOString(),
      updatedAt: region.updatedAt.toISOString(),
      deletedAt: region.deletedAt ? region.deletedAt.toISOString() : null,
    }));
  }

  async createRegion(input: CreateRegionRequestDto): Promise<RegionSingleResponseDto> {

    const slug = slugify(input.name, {
        lower: true,
        strict: true,
        locale: 'ru',
      });

    const existing = await this.db.query.regionsSchema.findFirst({
      where: eq(schema.regionsSchema.slug, slug),
    });

    if (existing) {
      throw new ConflictException(`Region with slug "${slug}" already exists`);
    }

    const [region] = await this.db
      .insert(schema.regionsSchema)
      .values({
        name: input.name,
        slug: slug,
        parentId: input.parentId ?? null,
      })
      .returning();

    return {
      ...region,
      createdAt: region.createdAt.toISOString(),
      updatedAt: region.updatedAt.toISOString(),
      deletedAt: region.deletedAt ? region.deletedAt.toISOString() : null,
    };
  }

  async updateRegion(input: UpdateRegionRequestDto): Promise<RegionSingleResponseDto> {
    const region = await this.db.query.regionsSchema.findFirst({
      where: eq(schema.regionsSchema.id, input.id),
    });

    if (!region) {
      throw new NotFoundException(`Region with id ${input.id} not found`);
    }

       const slug = slugify(input.name, {
        lower: true,
        strict: true,
        locale: 'ru',
      });

    const [updated] = await this.db
      .update(schema.regionsSchema)
      .set({
        name: input.name,
        slug: slug,
        parentId: input.parentId ?? null,
      })
      .where(eq(schema.regionsSchema.id, input.id))
      .returning();

    return {
      ...updated,
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
      deletedAt: updated.deletedAt ? updated.deletedAt.toISOString() : null,
    };
  }

  async deleteRegion(input: GetRegionByIdRequestDto): Promise<void> {
    const region = await this.db.query.regionsSchema.findFirst({
      where: eq(schema.regionsSchema.id, input.id),
    });

    if (!region) {
      throw new NotFoundException(`Region with id ${input.id} not found`);
    }

    await this.db
      .delete(schema.regionsSchema)
      .where(eq(schema.regionsSchema.id, input.id));
  }
}
