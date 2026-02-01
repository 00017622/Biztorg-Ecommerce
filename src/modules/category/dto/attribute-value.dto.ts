// dto/attribute-value.dto.ts
import { createZodDto } from 'nestjs-zod/dto'
import {
  AttributeValueSchema,
  CreateAttributeValueSchema,
  AttachValueToAttributeSchema,
} from 'src/utils/zod.schema'

export const AttributeValueResponseSchema =
  AttributeValueSchema.describe('Attribute value')

export const CreateAttributeValueRequestSchema =
  CreateAttributeValueSchema.describe('Create attribute value')

export const AttachValueToAttributeRequestSchema =
  AttachValueToAttributeSchema.describe(
    'Attach attribute value to attribute',
  )

export class AttributeValueResponseDto extends createZodDto(
  AttributeValueSchema,
) {}

// export class AttributeValueResponseDto extends createZodDto(
//   AttributeValueResponseSchema,
// ) {}

export class CreateAttributeValueRequestDto extends createZodDto(
  CreateAttributeValueRequestSchema,
) {}

export class AttachValueToAttributeRequestDto extends createZodDto(
  AttachValueToAttributeRequestSchema,
) {}
