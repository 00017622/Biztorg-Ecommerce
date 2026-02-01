import { z } from 'zod';
import { createZodDto } from 'nestjs-zod/dto';

const GenerateDescriptionRequestSchema = z.object({
  title: z
    .string()
    .min(2, 'Product title is too short')
    .describe('Product title to generate a description for'),
});

const GenerateDescriptionResponseSchema = z.object({
  title: z.string().describe('Product title'),
  description: z
    .string()
    .describe('AI-generated product description based on the title'),
});

class GenerateDescriptionRequestDto extends createZodDto(
  GenerateDescriptionRequestSchema,
) {}

class GenerateDescriptionResponseDto extends createZodDto(
  GenerateDescriptionResponseSchema,
) {}

export {
  GenerateDescriptionRequestSchema,
  GenerateDescriptionResponseSchema,
  GenerateDescriptionRequestDto,
  GenerateDescriptionResponseDto,
};
