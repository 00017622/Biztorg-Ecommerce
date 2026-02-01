import {
  Controller,
  Post,
  Body,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  HttpCode,
  HttpStatus,
  Get,
  Param,
  Delete,
  Put,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { CategoryService } from './category.service';
import {
  CategoryArrayResponseDto,
  CategoryArrayResponseSchema,
  CategoryAttributesResponseDto,
  CategoryAttributesResponseSchema,
  CategorySingleResponseSchema,
  CreateCategoryRequestDto,
  GetCategoryByIdRequestDto,
  UpdateCategoryRequestDto,
} from './dto/category.dto';
import {
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
} from '@nestjs/swagger';
import { createBaseResponseDto } from 'src/helpers/create-base-response.helper';
import { ZodSerializerDto } from 'nestjs-zod';
import { AttributeSchema } from 'src/utils/zod.schema';
import { AttributeResponseSchema, CreateAttributeRequestDto } from './dto/attribute.dto';
import { AttributeValueResponseSchema, CreateAttributeValueRequestDto } from './dto/attribute-value.dto';
import { ApiQuery } from '@nestjs/swagger';


@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

@Get('root')
@ApiOperation({ summary: 'Get root categories (parentId = null)' })
@ApiOkResponse({
  type: createBaseResponseDto(
    CategoryArrayResponseSchema,
    'CategoryArrayResponseSchema',
  ),
})
@ZodSerializerDto(CategoryArrayResponseSchema)
async getRootCategories(): Promise<CategoryArrayResponseDto> {
  return this.categoryService.getRootCategories();
}

@Get('search')
@ApiOperation({ summary: 'Search categories by name (limit 5)' })
@ApiQuery({
  name: 'q',
  type: 'string',
  required: true,
  example: 'кроссов',
  description: 'Search query for category name',
})
@ApiOkResponse({
  type: createBaseResponseDto(
    CategoryArrayResponseSchema,
    'CategoryArrayResponseSchema',
  ),
})
@ZodSerializerDto(CategoryArrayResponseSchema)
async searchCategories(@Query('q') q: string) {
  return this.categoryService.searchCategories(q);
}

@Get(':id/attributes')
@ApiOperation({
  summary: 'Get attributes with values for category',
})
@ApiParam({
  name: 'id',
  description: 'Category ID',
  type: 'string',
  format: 'uuid',
})
@ApiOkResponse({
    type: createBaseResponseDto(
      CategoryAttributesResponseSchema,
      'CategoryAttributesResponseSchema',
    ),
  })
   @ZodSerializerDto(CategoryAttributesResponseSchema)
async getCategoryAttributes(
  @Param('id') id: string,
): Promise<CategoryAttributesResponseDto> {
  return this.categoryService.getCategoryAttributes(id)
}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Create category with image upload' })
 @ApiBody({
  schema: {
    type: 'object',
    properties: {
      name: { type: 'string', example: 'Телефоны и связь' },
      slug: { type: 'string', example: 'phones-and-connection' },
      parentId: {
        type: 'string',
        nullable: true,
        example: 'uuid-of-parent-category',
        description: 'Optional parent category id',
      },
      image: {
        type: 'string',
        format: 'binary',
        description: 'Image file for category',
      },
    },
    required: ['name', 'slug'],
  },
})
  @ApiCreatedResponse({
    type: createBaseResponseDto(
      CategorySingleResponseSchema,
      'CategorySingleResponseSchema',
    ),
  })
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './public/uploads/categories',
        filename: (req, image, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, uniqueSuffix + extname(image.originalname));
        },
      }),
      limits: {
        fileSize: 2 * 1024 * 1024, // 2 MB
      },
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/^image\/(jpeg|png|jpg|webp)$/)) {
          return cb(
            new BadRequestException(
              'Only image files are allowed (jpeg, png, webp)',
            ),
            false,
          );
        }
        cb(null, true);
      },
    }),
  )
  @ZodSerializerDto(CategorySingleResponseSchema)
  async createCategory(
    @Body() input: CreateCategoryRequestDto,
    @UploadedFile() image: Express.Multer.File,
  ) {
    return this.categoryService.createCategory(input, image);
  }

  @Get()
  @ApiOperation({ summary: 'Get all categories' })
  @ApiOkResponse({
    type: createBaseResponseDto(
      CategoryArrayResponseSchema,
      'CategoryArrayResponseSchema',
    ),
  })
  @ZodSerializerDto(CategoryArrayResponseSchema)
  async getCategories() {
    return this.categoryService.getCategories();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get single category by ID' })
  @ApiParam({ name: 'id', type: 'string', example: 'uuid-v4' })
  @ApiOkResponse({
    type: createBaseResponseDto(
      CategorySingleResponseSchema,
      'CategorySingleResponseSchema',
    ),
  })
  @ZodSerializerDto(CategorySingleResponseSchema)
  async getSingleCategory(@Param() params: GetCategoryByIdRequestDto) {
    return this.categoryService.getSingleCategory(params.id);
  }

  @Put()
@HttpCode(HttpStatus.OK)
@ApiConsumes('multipart/form-data')
@ApiOperation({ summary: 'Update category (fields + optional new image)' })
@ApiBody({
  schema: {
    type: 'object',
    properties: {
      id: { type: 'string', example: 'uuid-v4' },
      name: { type: 'string', example: 'Updated name' },
      slug: { type: 'string', example: 'updated-slug' },
      parentId: {
        type: 'string',
        nullable: true,
        example: 'uuid-of-parent-category',
      },
      image: {
        type: 'string',
        format: 'binary',
        description: 'Optional new image file',
      },
    },
    required: ['id', 'name', 'slug'],
  },
})
@ApiOkResponse({
  type: createBaseResponseDto(
    CategorySingleResponseSchema,
    'CategorySingleResponseSchema',
  ),
})
@UseInterceptors(
  FileInterceptor('image', {
    storage: diskStorage({
      destination: './public/uploads/categories',
      filename: (req, file, cb) => {
        const uniqueSuffix =
          Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + extname(file.originalname));
      },
    }),
    limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB
    fileFilter: (req, file, cb) => {
      if (!file.mimetype.match(/^image\/(jpeg|png|jpg|webp)$/)) {
        return cb(
          new BadRequestException('Only image files are allowed (jpeg, png, webp)'),
          false,
        );
      }
      cb(null, true);
    },
  }),
)
@ZodSerializerDto(CategorySingleResponseSchema)
async updateCategory(
  @Body() input: UpdateCategoryRequestDto,
  @UploadedFile() image?: Express.Multer.File,
) {
  return this.categoryService.updateCategory(input, image);
}

  @Delete(':id')
  @ApiOperation({ summary: 'Delete category by ID' })
  @ApiParam({ name: 'id', type: 'string', example: 'uuid-v4' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteCategory(@Param() params: GetCategoryByIdRequestDto) {
    return this.categoryService.deleteCategory(params);
  };


@Post('attributes')
@ApiOperation({ summary: 'Create attribute' })
@ApiCreatedResponse({
  type: createBaseResponseDto(
    AttributeResponseSchema,
    'AttributeResponseSchema',
  ),
})
@ZodSerializerDto(AttributeResponseSchema)
async createAttribute(
  @Body() body: CreateAttributeRequestDto,
) {
  return this.categoryService.createAttribute(body.name, body.slug);
}

@Get('attributes')
@ApiOperation({ summary: 'Get all attributes with values' })
@ApiOkResponse({
  type: createBaseResponseDto(
    CategoryAttributesResponseSchema,
    'CategoryAttributesResponseSchema',
  ),
})
@ZodSerializerDto(CategoryAttributesResponseSchema)
async getAllAttributes() {
  return this.categoryService.getAllAttributes();
}

@Get('attributes/:id')
@ApiOperation({ summary: 'Get single attribute with values' })
@ApiParam({ name: 'id', type: 'string', format: 'uuid' })
@ApiOkResponse({
  type: createBaseResponseDto(
    CategoryAttributesResponseSchema,
    'CategoryAttributeResponseSchema',
  ),
})
@ZodSerializerDto(CategoryAttributesResponseSchema)
async getSingleAttribute(
  @Param('id') id: string,
) {
  return this.categoryService.getSingleAttribute(id);
};

@Post(':categoryId/attributes/:attributeId')
@ApiOperation({ summary: 'Attach attribute to category' })
@ApiParam({ name: 'categoryId', format: 'uuid' })
@ApiParam({ name: 'attributeId', format: 'uuid' })
@HttpCode(HttpStatus.NO_CONTENT)
async addAttributeToCategory(
  @Param('categoryId') categoryId: string,
  @Param('attributeId') attributeId: string,
) {
  await this.categoryService.addAttributeToCategory(
    categoryId,
    attributeId,
  );
}

@Post('attribute-values')
@ApiOperation({ summary: 'Create attribute value' })
@ApiCreatedResponse({
  type: createBaseResponseDto(
    AttributeValueResponseSchema,
    'AttributeValueResponseSchema',
  ),
})
@ZodSerializerDto(AttributeValueResponseSchema)
async createAttributeValue(
  @Body() body: CreateAttributeValueRequestDto,
) {
  return this.categoryService.createAttributeValue(
    body.value,
    body.slug,
  );
}

@Post('attributes/:attributeId/values/:valueId')
@ApiOperation({ summary: 'Attach value to attribute' })
@ApiParam({ name: 'attributeId', format: 'uuid' })
@ApiParam({ name: 'valueId', format: 'uuid' })
@HttpCode(HttpStatus.NO_CONTENT)
async addValueToAttribute(
  @Param('attributeId') attributeId: string,
  @Param('valueId') valueId: string,
) {
  await this.categoryService.addValueToAttribute(
    attributeId,
    valueId,
  );
}

@Post(':categoryId/attribute-values/:valueId/:attributeId')
@ApiOperation({ summary: 'Attach attribute value to category' })
@ApiParam({ name: 'categoryId', format: 'uuid' })
@ApiParam({ name: 'valueId', format: 'uuid' })
@ApiParam({ name: 'attributeId', format: 'uuid' })
@HttpCode(HttpStatus.NO_CONTENT)
async addValueToCategory(
  @Param('categoryId') categoryId: string,
  @Param('valueId') valueId: string,
  @Param('attributeId') attributeId: string,
) {
  await this.categoryService.addValueToCategory(
    categoryId,
    attributeId,
    valueId,
  );
}

}
