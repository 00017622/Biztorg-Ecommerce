// import { createZodDto } from 'nestjs-zod/dto';
// import {  CategorySchema, SubcategorySchema } from 'src/utils/zod.schema';
// import { z } from 'zod';

// const SubcategorySingleResponseSchema = SubcategorySchema.describe('Single subcategory response schema');

// const SubcategoryArrayResponseSchema = SubcategorySchema.array().describe('Subcategories array response');

// const GetSubcategoryByCategoryIdRequestSchema = SubcategorySchema.pick({categoryId: true});

// const FindSubcategoryByNameRequestSchema = SubcategorySchema.pick({name: true});

// const CreateSubcategoryRequestSchema = SubcategorySchema.pick({categoryId: true, name: true, slug: true}).describe('Create subcategory request schema');

// const UpdateSubcategoryRequestSchema = SubcategorySchema.pick({id: true, name: true, slug: true, categoryId: true}).describe('Update subcategory request schema')

// const GetSubcategoryByIdRequestSchema = z.object({
//     id: z.uuid().describe('Subcategory Id that you passing')
// }).describe('Get single subcategory Request schema')

// class SubcategorySingleResponseDto extends createZodDto(SubcategorySingleResponseSchema) {}

// class SubcategoryArrayResponseDto extends createZodDto(SubcategoryArrayResponseSchema) {}

// class GetSubcategoryByCategoryIdRequestDto extends createZodDto(GetSubcategoryByCategoryIdRequestSchema) {}

// class FindSubcategoryByNameRequestDto extends createZodDto(FindSubcategoryByNameRequestSchema) {}

// class CreateSubcategoryRequestDto extends createZodDto(CreateSubcategoryRequestSchema) {}

// class UpdateSubcategoryRequestDto extends createZodDto(UpdateSubcategoryRequestSchema) {}

// class GetSubcategoryByIdRequestDto extends createZodDto(GetSubcategoryByIdRequestSchema) {}

// export {
//     SubcategorySingleResponseSchema,
//     SubcategoryArrayResponseSchema,
//     GetSubcategoryByCategoryIdRequestSchema,
//     FindSubcategoryByNameRequestSchema,
//     CreateSubcategoryRequestSchema,
//     UpdateSubcategoryRequestSchema,
//     SubcategorySingleResponseDto,
//     SubcategoryArrayResponseDto,
//     GetSubcategoryByCategoryIdRequestDto,
//     FindSubcategoryByNameRequestDto,
//     CreateSubcategoryRequestDto,
//     UpdateSubcategoryRequestDto,
//     GetSubcategoryByIdRequestSchema,
//     GetSubcategoryByIdRequestDto
// }