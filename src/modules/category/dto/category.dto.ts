// dto/category.dto.ts
import { createZodDto } from 'nestjs-zod/dto';
import { AttributeWithValuesSchema, CategorySchema } from 'src/utils/zod.schema';
import { z } from 'zod';

const CategorySingleResponseSchema =
  CategorySchema.describe('Single category response');

const CategoryArrayResponseSchema =
  CategorySchema.array().describe('Array of categories response');

/**
 * CREATE
 * image is handled by multer, not zod
 */
const CreateCategoryRequestSchema = CategorySchema.pick({
  name: true,
  slug: true,
  parentId: true,
}).describe('Create category request schema');

/**
 * GET BY ID
 */
const GetCategoryByIdRequestSchema = z
  .object({
    id: z.uuid().describe('Category Id'),
  })
  .describe('Get single category request schema');

/**
 * UPDATE
 */
const UpdateCategoryRequestSchema = CategorySchema.pick({
  id: true,
  name: true,
  slug: true,
  parentId: true,
}).describe('Update category request schema');

export const CategoryAttributeResponseSchema =  AttributeWithValuesSchema.describe(
    'Attribute with values for category',
  )

export const CategoryAttributesResponseSchema =
  AttributeWithValuesSchema.array().describe(
    'Attributes with values for category',
  )

  export class CategoryAttributesResponseDto extends createZodDto(
  CategoryAttributesResponseSchema,
) {}

  export class CategoryAttributeResponseDto extends createZodDto(
  CategoryAttributeResponseSchema,
) {}

class CategorySingleResponseDto extends createZodDto(
  CategorySingleResponseSchema,
) {}

class CategoryArrayResponseDto extends createZodDto(
  CategoryArrayResponseSchema,
) {}

class CreateCategoryRequestDto extends createZodDto(
  CreateCategoryRequestSchema,
) {}

class GetCategoryByIdRequestDto extends createZodDto(
  GetCategoryByIdRequestSchema,
) {}

class UpdateCategoryRequestDto extends createZodDto(
  UpdateCategoryRequestSchema,
) {}

export {
  CategorySingleResponseSchema,
  CategoryArrayResponseSchema,
  CreateCategoryRequestSchema,
  UpdateCategoryRequestSchema,

  CategorySingleResponseDto,
  CategoryArrayResponseDto,
  CreateCategoryRequestDto,
  UpdateCategoryRequestDto,

  GetCategoryByIdRequestSchema,
  GetCategoryByIdRequestDto,
};
