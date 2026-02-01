import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DrizzleAsyncProvider } from 'src/database/drizzle.provider';
import * as schema from 'src/database/schema';
import { isNull } from "drizzle-orm";
import { and, eq, ilike } from 'drizzle-orm';
import {
  CategoryArrayResponseDto,
  CategoryAttributeResponseDto,
  CategoryAttributesResponseDto,
  CategorySingleResponseDto,
  CreateCategoryRequestDto,
  GetCategoryByIdRequestDto,
  UpdateCategoryRequestDto,
} from './dto/category.dto';
import { promises as fs } from "fs";
import { join } from "path";
import { AttributeResponseDto } from './dto/attribute.dto';
import { AttributeValueResponseDto } from './dto/attribute-value.dto';


@Injectable()
export class CategoryService {
  constructor(
    private jwtService: JwtService,
    @Inject(DrizzleAsyncProvider)
    private db: NodePgDatabase<typeof schema>,
  ) {}

  async getCategories(): Promise<CategoryArrayResponseDto> {
  const categories = await this.db.query.categoriesSchema.findMany();

  return categories.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    parentId: c.parentId,
    imageUrl: c.imageUrl,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
    deletedAt: c.deletedAt ? c.deletedAt.toISOString() : null,
  }));
}

async getRootCategories(): Promise<CategoryArrayResponseDto> {
  const categories = await this.db.query.categoriesSchema.findMany({
    where: isNull(schema.categoriesSchema.parentId),
  });

  return categories.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    parentId: c.parentId,
    imageUrl: c.imageUrl,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
    deletedAt: c.deletedAt ? c.deletedAt.toISOString() : null,
  }));
}

async searchCategories(query: string): Promise<CategoryArrayResponseDto> {
  if (!query || query.trim().length < 2) {
    throw new BadRequestException("Query too short");
  }

  const categories = await this.db
    .select()
    .from(schema.categoriesSchema)
    .where(ilike(schema.categoriesSchema.name, `%${query}%`))
    .limit(5);

  return categories.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    parentId: c.parentId,
    imageUrl: c.imageUrl,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
    deletedAt: c.deletedAt ? c.deletedAt.toISOString() : null,
  }));
}

  async getSingleCategory(id: string): Promise<CategorySingleResponseDto> {
    const category = await this.db.query.categoriesSchema.findFirst({
      where: eq(schema.categoriesSchema.id, id),
    });

    if (!category) {
      throw new NotFoundException(`Category with id ${id} not found`);
    }

    return {
    id: category.id,
    name: category.name,
    slug: category.slug,
    parentId: category.parentId,
    imageUrl: category.imageUrl,
    createdAt: category.createdAt.toISOString(),
    updatedAt: category.updatedAt.toISOString(),
    deletedAt: category.deletedAt ? category.deletedAt.toISOString() : null,
  };
  }

  async createCategory(
    input: CreateCategoryRequestDto,
    image: Express.Multer.File,
  ): Promise<CategorySingleResponseDto> {
    const existing = await this.db.query.categoriesSchema.findFirst({
      where: eq(schema.categoriesSchema.slug, input.slug),
    });

    if (existing) {
      throw new ConflictException(
        `Category with slug "${input.slug}" already exists`,
      );
    }

    const imageUrl = image ? `/uploads/categories/${image.filename}` : null;

    const [category] = await this.db
      .insert(schema.categoriesSchema)
      .values({
        name: input.name,
        parentId: input.parentId ?? null,
        slug: input.slug,
        imageUrl,
      })
      .returning();

    return {
      ...category,
      createdAt: category.createdAt.toISOString(),
      updatedAt: category.updatedAt.toISOString(),
      deletedAt: category.deletedAt ? category.deletedAt.toISOString() : null,
    };
  }

  async updateCategory(
  input: UpdateCategoryRequestDto,
  image?: Express.Multer.File,
): Promise<CategorySingleResponseDto> {
  const category = await this.db.query.categoriesSchema.findFirst({
    where: eq(schema.categoriesSchema.id, input.id),
  });

  if (!category) {
    throw new NotFoundException(`Category with id ${input.id} not found`);
  }

  let imageUrl = category.imageUrl;

  if (image) {
    if (category.imageUrl) {
      const oldFilePath = join(
        process.cwd(),
        "public",
        category.imageUrl.replace(/^\/+/, "")
      );

      try {
        await fs.unlink(oldFilePath);
      } catch (err: any) {
        if (err.code !== "ENOENT") throw err;
        console.warn("⚠️ Old image not found, skipping delete:", oldFilePath);
      }
    }

    imageUrl = `/uploads/categories/${image.filename}`;
  }

  const [updated] = await this.db
    .update(schema.categoriesSchema)
    .set({
      name: input.name,
      parentId: input.parentId ?? null,
      slug: input.slug,
      imageUrl: imageUrl,
    })
    .where(eq(schema.categoriesSchema.id, input.id))
    .returning();

  return {
    id: updated.id,
    parentId: updated.parentId,
    name: updated.name,
    slug: updated.slug,
    createdAt: updated.createdAt.toISOString(),
    updatedAt: updated.updatedAt.toISOString(),
    deletedAt: updated.deletedAt ? updated.deletedAt.toISOString() : null,
  };
}


  async deleteCategory(input: GetCategoryByIdRequestDto): Promise<void> {
    const category = await this.db.query.categoriesSchema.findFirst({
      where: eq(schema.categoriesSchema.id, input.id),
    });

    if (!category) {
      throw new NotFoundException(`Category with id ${input.id} not found`);
    }

     if (category.imageUrl) {
     const filePath = join(
    process.cwd(),
    "public",
    category.imageUrl.replace(/^\/+/, "")
  );

    try {
      await fs.unlink(filePath);
    } catch (err: any) {
      if (err.code === "ENOENT") {
        console.warn("⚠️ File not found, skipping delete:", filePath);
      } else {
        throw err;
      }
    }
  }

    await this.db
      .delete(schema.categoriesSchema)
      .where(eq(schema.categoriesSchema.id, input.id));
  }

  async getCategoriesTree(): Promise<CategoryArrayResponseDto> {
  const categories = await this.db.query.categoriesSchema.findMany({
    orderBy: [schema.categoriesSchema.parentId],
  });

  return categories.map(c => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    parentId: c.parentId,
    imageUrl: c.imageUrl,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
    deletedAt: c.deletedAt ? c.deletedAt.toISOString() : null,
  }));
}

async getCategoryAttributes(
  categoryId: string,
): Promise<CategoryAttributesResponseDto> {

  const category = await this.db.query.categoriesSchema.findFirst({
    where: eq(schema.categoriesSchema.id, categoryId),
  });

  if (!category) {
    throw new NotFoundException(
      `Category with id ${categoryId} not found`,
    );
  }

  const rows = await this.db
    .select({
      attributeId: schema.attributesSchema.id,
      attributeName: schema.attributesSchema.name,
      attributeSlug: schema.attributesSchema.slug,

      valueId: schema.attributeValuesSchema.id,
      valueValue: schema.attributeValuesSchema.value,
      valueSlug: schema.attributeValuesSchema.slug,
    })
    .from(schema.categoryAttributesSchema)

    .innerJoin(
      schema.attributesSchema,
      eq(
        schema.categoryAttributesSchema.attributeId,
        schema.attributesSchema.id,
      ),
    )

    .leftJoin(
      schema.categoryAttributeValuesSchema,
      and(
        eq(
          schema.categoryAttributeValuesSchema.categoryId,
          schema.categoryAttributesSchema.categoryId,
        ),
        eq(
          schema.categoryAttributeValuesSchema.attributeId,
          schema.categoryAttributesSchema.attributeId,
        ),
      ),
    )

    .leftJoin(
      schema.attributeValuesSchema,
      eq(
        schema.categoryAttributeValuesSchema.attributeValueId,
        schema.attributeValuesSchema.id,
      ),
    )

    .where(eq(schema.categoryAttributesSchema.categoryId, categoryId))
    .orderBy(schema.attributesSchema.createdAt);

  const map = new Map<string, {
    id: string;
    name: string;
    slug: string;
    values: {
      id: string;
      value: string;
      slug: string;
    }[];
  }>();

  for (const row of rows) {
    if (!map.has(row.attributeId)) {
      map.set(row.attributeId, {
        id: row.attributeId,
        name: row.attributeName,
        slug: row.attributeSlug,
        values: [],
      });
    }

    if (row.valueId) {
      map.get(row.attributeId)!.values.push({
        id: row.valueId,
        value: row.valueValue!,
        slug: row.valueSlug!,
      });
    }
  }

  return Array.from(map.values());
}

async createAttribute(
  name: string,
  slug: string,
): Promise<AttributeResponseDto> {
  const existing = await this.db.query.attributesSchema.findFirst({
    where: eq(schema.attributesSchema.slug, slug),
  });

  if (existing) {
    throw new ConflictException(
      `Attribute with slug "${slug}" already exists`,
    );
  }

  const [attribute] = await this.db
    .insert(schema.attributesSchema)
    .values({ name, slug })
    .returning();

  return attribute;
}

async addAttributeToCategory(
  categoryId: string,
  attributeId: string,
): Promise<void> {

  await this.db.insert(schema.categoryAttributesSchema).values({
    categoryId,
    attributeId,
  });
};

async createAttributeValue(
  value: string,
  slug: string,
): Promise<AttributeValueResponseDto> {
  const existing = await this.db.query.attributeValuesSchema.findFirst({
    where: eq(schema.attributeValuesSchema.slug, slug),
  });

  if (existing) {
    throw new ConflictException(
      `Attribute value with slug "${slug}" already exists`,
    );
  }

  const [attrValue] = await this.db
    .insert(schema.attributeValuesSchema)
    .values({ value, slug })
    .returning();

  return attrValue;
};

async addValueToAttribute(
  attributeId: string,
  attributeValueId: string,
): Promise<void> {

  await this.db.insert(schema.attributeAttributeValuesSchema).values({
    attributeId,
    attributeValueId,
  });
}

async getAllAttributes(): Promise<CategoryAttributesResponseDto> {

  const rows = await this.db
    .select({
      attributeId: schema.attributesSchema.id,
      attributeName: schema.attributesSchema.name,
      attributeSlug: schema.attributesSchema.slug,

      valueId: schema.attributeValuesSchema.id,
      valueValue: schema.attributeValuesSchema.value,
      valueSlug: schema.attributeValuesSchema.slug,
    })
    .from(schema.attributesSchema)
    .leftJoin(
      schema.attributeAttributeValuesSchema,
      eq(
        schema.attributeAttributeValuesSchema.attributeId,
        schema.attributesSchema.id,
      ),
    )
    .leftJoin(
      schema.attributeValuesSchema,
      eq(
        schema.attributeAttributeValuesSchema.attributeValueId,
        schema.attributeValuesSchema.id,
      ),
    )
    .orderBy(schema.attributesSchema.createdAt);

  const map = new Map<string, any>();

  for (const row of rows) {
    if (!map.has(row.attributeId)) {
      map.set(row.attributeId, {
        id: row.attributeId,
        name: row.attributeName,
        slug: row.attributeSlug,
        values: [],
      });
    }

    if (row.valueId) {
      map.get(row.attributeId).values.push({
        id: row.valueId,
        value: row.valueValue,
        slug: row.valueSlug,
      });
    }
  }

  return Array.from(map.values());
}

async getSingleAttribute(
  attributeId: string,
): Promise<CategoryAttributeResponseDto>{

  const rows = await this.db
    .select({
      attributeId: schema.attributesSchema.id,
      attributeName: schema.attributesSchema.name,
      attributeSlug: schema.attributesSchema.slug,

      valueId: schema.attributeValuesSchema.id,
      valueValue: schema.attributeValuesSchema.value,
      valueSlug: schema.attributeValuesSchema.slug,
    })
    .from(schema.attributesSchema)
    .leftJoin(
      schema.attributeAttributeValuesSchema,
      eq(
        schema.attributeAttributeValuesSchema.attributeId,
        schema.attributesSchema.id,
      ),
    )
    .leftJoin(
      schema.attributeValuesSchema,
      eq(
        schema.attributeAttributeValuesSchema.attributeValueId,
        schema.attributeValuesSchema.id,
      ),
    )
    .where(eq(schema.attributesSchema.id, attributeId));

  if (!rows.length) {
    throw new NotFoundException(
      `Attribute with id ${attributeId} not found`,
    );
  }

  return {
    id: rows[0].attributeId,
    name: rows[0].attributeName,
    slug: rows[0].attributeSlug,
    values: rows
      .filter(r => r.valueId)
      .map(r => ({
        id: r.valueId!,
        value: r.valueValue!,
        slug: r.valueSlug!,
      })),
  };
}

async addValueToCategory(
  categoryId: string,
  attributeId: string,
  attributeValueId: string,
): Promise<void> {
  try {
    await this.db
      .insert(schema.categoryAttributeValuesSchema)
      .values({
        categoryId,
        attributeId,
        attributeValueId,
      });
  } catch (err: any) {
    if (err.code === '23505') {
      throw new ConflictException(
        'This value is already attached to the category for this attribute',
      );
    }
    throw err;
  }
}

}
