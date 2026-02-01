import { createZodDto } from 'nestjs-zod/dto';
import { RegionSchema } from 'src/utils/zod.schema';
import { z } from 'zod';

const RegionSingleResponseSchema = RegionSchema.describe('Single region response schema');

const RegionArrayResponseSchema = RegionSchema.array().describe('Regions array response');

const FindRegionByNameRequestSchema = RegionSchema.pick({name: true});

const CreateRegionRequestSchema = RegionSchema.pick({name: true, parentId: true}).describe('Create region request schema');

const UpdateRegionRequestSchema = RegionSchema.pick({id: true, name: true, parentId: true}).describe('Update region request schema')

const GetRegionByIdRequestSchema = z.object({
    id: z.uuid().describe('Region Id that you passing')
}).describe('Get single region Request schema')

class RegionSingleResponseDto extends createZodDto(RegionSingleResponseSchema) {}

class RegionArrayResponseDto extends createZodDto(RegionArrayResponseSchema) {}

class FindRegionByNameRequestDto extends createZodDto(FindRegionByNameRequestSchema) {}

class CreateRegionRequestDto extends createZodDto(CreateRegionRequestSchema) {}

class UpdateRegionRequestDto extends createZodDto(UpdateRegionRequestSchema) {}

class GetRegionByIdRequestDto extends createZodDto(GetRegionByIdRequestSchema) {}

export {
  RegionSingleResponseSchema,
  RegionSingleResponseDto,
  RegionArrayResponseSchema,
  RegionArrayResponseDto,
  FindRegionByNameRequestSchema,
  FindRegionByNameRequestDto,
  CreateRegionRequestSchema,
  CreateRegionRequestDto,
  UpdateRegionRequestSchema,
  UpdateRegionRequestDto,
  GetRegionByIdRequestSchema,
  GetRegionByIdRequestDto
}