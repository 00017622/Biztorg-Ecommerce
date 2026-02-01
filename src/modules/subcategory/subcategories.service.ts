// import {
//   BadRequestException,
//   ConflictException,
//   Inject,
//   Injectable,
//   NotFoundException,
//   UnauthorizedException,
// } from '@nestjs/common';
// import { JwtService } from '@nestjs/jwt';
// import { NodePgDatabase } from 'drizzle-orm/node-postgres';
// import { DrizzleAsyncProvider } from 'src/database/drizzle.provider';
// import * as schema from 'src/database/schema';
// import { eq } from 'drizzle-orm';
// import { promises as fs } from "fs";
// import { join } from "path";
// import { CreateSubcategoryRequestDto, GetSubcategoryByCategoryIdRequestDto, GetSubcategoryByIdRequestDto, SubcategoryArrayResponseDto, SubcategorySingleResponseDto, UpdateSubcategoryRequestDto } from './dto/subcategories.dto';
// import { ilike } from 'drizzle-orm';


// @Injectable()
// export class SubcategoryService {
//   constructor(
//     private jwtService: JwtService,
//     @Inject(DrizzleAsyncProvider)
//     private db: NodePgDatabase<typeof schema>,
//   ) {}

//     async getSubcategoriesByCategory(categoryId: string): Promise<SubcategoryArrayResponseDto> {
//         const subcategories = await this.db.query.subcategoriesSchema.findMany({
//             where: eq(schema.subcategoriesSchema.categoryId, categoryId),
//         });

//         return subcategories.map((subcategory) => ({
//         ...subcategory,
//             createdAt: subcategory.createdAt.toISOString(),
//             updatedAt: subcategory.updatedAt.toISOString(),
//             deletedAt: subcategory.deletedAt ? subcategory.deletedAt.toISOString() : null,
//         }))
//     }

//     async searchSubcategoriesByName(name: string): Promise<SubcategoryArrayResponseDto> {
//   const subcategories = await this.db.query.subcategoriesSchema.findMany({
//     where: ilike(schema.subcategoriesSchema.name, `%${name}%`),
//   });

//   return subcategories.map((subcategory) => ({
//     ...subcategory,
//     createdAt: subcategory.createdAt.toISOString(),
//     updatedAt: subcategory.updatedAt.toISOString(),
//     deletedAt: subcategory.deletedAt ? subcategory.deletedAt.toISOString() : null,
//   }));
// }

//     async getAllSubcategories(): Promise<SubcategoryArrayResponseDto> {
//     const subcategories = await this.db.query.subcategoriesSchema.findMany();

//     return subcategories.map((subcategory) => ({
//       ...subcategory,
//       createdAt: subcategory.createdAt.toISOString(),
//       updatedAt: subcategory.updatedAt.toISOString(),
//       deletedAt: subcategory.deletedAt ? subcategory.deletedAt.toISOString() : null,
//     }));
//   }

//     async getSingleSubcategory(id: string): Promise<SubcategorySingleResponseDto> {
//     const subcategory = await this.db.query.subcategoriesSchema.findFirst({
//       where: eq(schema.subcategoriesSchema.id, id),
//     });

//     if (!subcategory) {
//       throw new NotFoundException(`Subcategory with id ${id} not found`);
//     }

//     return {
//       ...subcategory,
//       createdAt: subcategory.createdAt.toISOString(),
//       updatedAt: subcategory.updatedAt.toISOString(),
//       deletedAt: subcategory.deletedAt ? subcategory.deletedAt.toISOString() : null,
//     };
//   }

//    async createSubcategory(
//     input: CreateSubcategoryRequestDto,
//   ): Promise<SubcategorySingleResponseDto> {
//     const existing = await this.db.query.subcategoriesSchema.findFirst({
//       where: eq(schema.subcategoriesSchema.slug, input.slug),
//     });

//     if (existing) {
//       throw new ConflictException(
//         `Subcategory with slug "${input.slug}" already exists`,
//       );
//     }

//     const [subcategory] = await this.db
//       .insert(schema.subcategoriesSchema)
//       .values({
//         categoryId: input.categoryId,
//         name: input.name,
//         slug: input.slug,
//       })
//       .returning();

//     return {
//       ...subcategory,
//       createdAt: subcategory.createdAt.toISOString(),
//       updatedAt: subcategory.updatedAt.toISOString(),
//       deletedAt: subcategory.deletedAt ? subcategory.deletedAt.toISOString() : null,
//     };
//   }

//    async updateSubcategory(
//   input: UpdateSubcategoryRequestDto,
// ): Promise<SubcategorySingleResponseDto> {
//   const subcategory = await this.db.query.subcategoriesSchema.findFirst({
//     where: eq(schema.subcategoriesSchema.id, input.id),
//   });

//   if (!subcategory) {
//     throw new NotFoundException(`Subcategory with id ${input.id} not found`);
//   }

//   const [updated] = await this.db
//     .update(schema.subcategoriesSchema)
//     .set({
//       categoryId: input.categoryId, 
//       name: input.name,
//       slug: input.slug,
//     })
//     .where(eq(schema.subcategoriesSchema.id, input.id))
//     .returning();

//   return {
//     ...updated,
//     createdAt: updated.createdAt.toISOString(),
//     updatedAt: updated.updatedAt.toISOString(),
//     deletedAt: updated.deletedAt ? updated.deletedAt.toISOString() : null,
//   };
// }

//  async deleteSubcategory(input: GetSubcategoryByIdRequestDto): Promise<void> {
//     const subcategory = await this.db.query.subcategoriesSchema.findFirst({
//       where: eq(schema.subcategoriesSchema.id, input.id),
//     });

//     if (!subcategory) {
//       throw new NotFoundException(`Subcategory with id ${input.id} not found`);
//     }

//     await this.db
//       .delete(schema.subcategoriesSchema)
//       .where(eq(schema.subcategoriesSchema.id, input.id));
//   }
// }
