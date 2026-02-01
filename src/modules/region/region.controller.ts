import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Delete,
  Put,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { RegionService } from './region.service';
import {
  CreateRegionRequestDto,
  UpdateRegionRequestDto,
  GetRegionByIdRequestDto,
  FindRegionByNameRequestDto,
  RegionArrayResponseSchema,
  RegionSingleResponseSchema,
} from './dto/region.dto';
import {
  ApiBody,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { createBaseResponseDto } from 'src/helpers/create-base-response.helper';
import { ZodSerializerDto } from 'nestjs-zod';

@Controller('regions')
export class RegionController {
  constructor(private readonly regionService: RegionService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create region' })
  @ApiBody({ type: CreateRegionRequestDto })
  @ApiCreatedResponse({
    type: createBaseResponseDto(
      RegionSingleResponseSchema,
      'RegionSingleResponseSchema',
    ),
  })
  @ZodSerializerDto(RegionSingleResponseSchema)
  async createRegion(@Body() input: CreateRegionRequestDto) {
    return this.regionService.createRegion(input);
  }

  @Get()
  @ApiOperation({ summary: 'Get all regions' })
  @ApiOkResponse({
    type: createBaseResponseDto(
      RegionArrayResponseSchema,
      'RegionArrayResponseSchema',
    ),
  })
  @ZodSerializerDto(RegionArrayResponseSchema)
  async getAllRegions() {
    return this.regionService.getAllRegions();
  }

  @Get('search')
  @ApiOperation({ summary: 'Search regions by name' })
  @ApiQuery({ name: 'name', type: 'string', example: 'Tashkent' })
  @ApiOkResponse({
    type: createBaseResponseDto(
      RegionArrayResponseSchema,
      'RegionArrayResponseSchema',
    ),
  })
  @ZodSerializerDto(RegionArrayResponseSchema)
  async searchRegionsByName(@Query() query: FindRegionByNameRequestDto) {
    return this.regionService.searchRegionsByName(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get single region by ID' })
  @ApiParam({ name: 'id', type: 'string', example: 'uuid-v4' })
  @ApiOkResponse({
    type: createBaseResponseDto(
      RegionSingleResponseSchema,
      'RegionSingleResponseSchema',
    ),
  })
  @ZodSerializerDto(RegionSingleResponseSchema)
  async getSingleRegion(@Param() params: GetRegionByIdRequestDto) {
    return this.regionService.getSingleRegion(params.id);
  }

  @Put()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update region' })
  @ApiBody({ type: UpdateRegionRequestDto })
  @ApiOkResponse({
    type: createBaseResponseDto(
      RegionSingleResponseSchema,
      'RegionSingleResponseSchema',
    ),
  })
  @ZodSerializerDto(RegionSingleResponseSchema)
  async updateRegion(@Body() input: UpdateRegionRequestDto) {
    return this.regionService.updateRegion(input);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete region by ID' })
  @ApiParam({ name: 'id', type: 'string', example: 'uuid-v4' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteRegion(@Param() params: GetRegionByIdRequestDto) {
    return this.regionService.deleteRegion(params);
  }
}