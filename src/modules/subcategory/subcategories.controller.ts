// import {
//   Controller,
//   Post,
//   Body,
//   Get,
//   Param,
//   Delete,
//   Put,
//   HttpCode,
//   HttpStatus,
//   Query,
// } from '@nestjs/common';
// import { SubcategoryService } from './subcategories.service';
// import {
//   CreateSubcategoryRequestDto,
//   GetSubcategoryByIdRequestDto,
//   GetSubcategoryByCategoryIdRequestDto,
//   UpdateSubcategoryRequestDto,
//   SubcategoryArrayResponseSchema,
//   SubcategorySingleResponseSchema,
// } from './dto/subcategories.dto';
// import {
//   ApiBody,
//   ApiOkResponse,
//   ApiCreatedResponse,
//   ApiOperation,
//   ApiParam,
//   ApiQuery,
// } from '@nestjs/swagger';
// import { createBaseResponseDto } from 'src/helpers/create-base-response.helper';
// import { ZodSerializerDto } from 'nestjs-zod';

// @Controller('subcategories')
// export class SubcategoryController {
//   constructor(private readonly subcategoryService: SubcategoryService) {}

//   @Post()
//   @HttpCode(HttpStatus.CREATED)
//   @ApiOperation({ summary: 'Create subcategory' })
//   @ApiBody({ type: CreateSubcategoryRequestDto })
//   @ApiCreatedResponse({
//     type: createBaseResponseDto(
//       SubcategorySingleResponseSchema,
//       'SubcategorySingleResponseSchema',
//     ),
//   })
//   @ZodSerializerDto(SubcategorySingleResponseSchema)
//   async createSubcategory(@Body() input: CreateSubcategoryRequestDto) {
//     return this.subcategoryService.createSubcategory(input);
//   }

//   @Get()
//   @ApiOperation({ summary: 'Get all subcategories' })
//   @ApiOkResponse({
//     type: createBaseResponseDto(
//       SubcategoryArrayResponseSchema,
//       'SubcategoryArrayResponseSchema',
//     ),
//   })
//   @ZodSerializerDto(SubcategoryArrayResponseSchema)
//   async getAllSubcategories() {
//     return this.subcategoryService.getAllSubcategories();
//   }

//   @Get('by-category/:categoryId')
//   @ApiOperation({ summary: 'Get subcategories by category ID' })
//   @ApiParam({ name: 'categoryId', type: 'string', example: 'uuid-v4' })
//   @ApiOkResponse({
//     type: createBaseResponseDto(
//       SubcategoryArrayResponseSchema,
//       'SubcategoryArrayResponseSchema',
//     ),
//   })
//   @ZodSerializerDto(SubcategoryArrayResponseSchema)
//   async getSubcategoriesByCategory(
//     @Param() params: GetSubcategoryByCategoryIdRequestDto,
//   ) {
//     return this.subcategoryService.getSubcategoriesByCategory(params.categoryId);
//   }

//   @Get('search')
//   @ApiOperation({ summary: 'Search subcategories by name' })
//   @ApiQuery({ name: 'name', type: 'string', example: 'phones' })
//   @ApiOkResponse({
//     type: createBaseResponseDto(
//       SubcategoryArrayResponseSchema,
//       'SubcategoryArrayResponseSchema',
//     ),
//   })
//   @ZodSerializerDto(SubcategoryArrayResponseSchema)
//   async searchSubcategoriesByName(@Query('name') name: string) {
//     return this.subcategoryService.searchSubcategoriesByName(name);
//   }

//   @Get(':id')
//   @ApiOperation({ summary: 'Get single subcategory by ID' })
//   @ApiParam({ name: 'id', type: 'string', example: 'uuid-v4' })
//   @ApiOkResponse({
//     type: createBaseResponseDto(
//       SubcategorySingleResponseSchema,
//       'SubcategorySingleResponseSchema',
//     ),
//   })
//   @ZodSerializerDto(SubcategorySingleResponseSchema)
//   async getSingleSubcategory(@Param() params: GetSubcategoryByIdRequestDto) {
//     return this.subcategoryService.getSingleSubcategory(params.id);
//   }

//   @Put()
//   @HttpCode(HttpStatus.OK)
//   @ApiOperation({ summary: 'Update subcategory' })
//   @ApiBody({ type: UpdateSubcategoryRequestDto })
//   @ApiOkResponse({
//     type: createBaseResponseDto(
//       SubcategorySingleResponseSchema,
//       'SubcategorySingleResponseSchema',
//     ),
//   })
//   @ZodSerializerDto(SubcategorySingleResponseSchema)
//   async updateSubcategory(@Body() input: UpdateSubcategoryRequestDto) {
//     return this.subcategoryService.updateSubcategory(input);
//   }

//   @Delete(':id')
//   @ApiOperation({ summary: 'Delete subcategory by ID' })
//   @ApiParam({ name: 'id', type: 'string', example: 'uuid-v4' })
//   @HttpCode(HttpStatus.NO_CONTENT)
//   async deleteSubcategory(@Param() params: GetSubcategoryByIdRequestDto) {
//     return this.subcategoryService.deleteSubcategory(params);
//   }
// }
