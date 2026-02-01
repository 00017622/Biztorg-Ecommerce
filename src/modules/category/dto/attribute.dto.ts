// dto/attribute.dto.ts
import { createZodDto } from 'nestjs-zod/dto'
import {
  AttributeSchema,
  AttributeWithValuesSchema,
  CreateAttributeSchema,
  AttachAttributeToCategorySchema,
} from 'src/utils/zod.schema'
import { z } from 'zod'

export const AttributeResponseSchema =
  AttributeSchema.describe('Single attribute')

export const AttributeWithValuesResponseSchema =
  AttributeWithValuesSchema.describe('Attribute with values')

export const AttributeArrayResponseSchema =
  AttributeSchema.array().describe('Array of attributes')

export const CreateAttributeRequestSchema =
  CreateAttributeSchema.describe('Create attribute request')

export const AttachAttributeToCategoryRequestSchema =
  AttachAttributeToCategorySchema.describe(
    'Attach attribute to category request',
  )

export class AttributeResponseDto extends createZodDto(
  AttributeWithValuesSchema.omit({ values: true }),
) {}


// export class AttributeResponseDto extends createZodDto(
//   AttributeResponseSchema,
// ) {}

export class AttributeWithValuesResponseDto extends createZodDto(
  AttributeWithValuesResponseSchema,
) {}

export class AttributeArrayResponseDto extends createZodDto(
  AttributeArrayResponseSchema,
) {}

export class CreateAttributeRequestDto extends createZodDto(
  CreateAttributeRequestSchema,
) {}

export class AttachAttributeToCategoryRequestDto extends createZodDto(
  AttachAttributeToCategoryRequestSchema,
) {}
