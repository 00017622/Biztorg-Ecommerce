import { z } from 'zod';
import { NotificationSchema } from 'src/utils/zod.schema';
import { ShopProfileSchema } from 'src/utils/zod.schema';
import { ProfileSchema } from 'src/utils/zod.schema';
import { createZodDto } from 'nestjs-zod/dto';

const NotificationSingleResponseSchema = NotificationSchema.extend({
  isShop: z.boolean().describe('Whether the sender is a shop'),
  senderName: z.string().describe('Display name of the sender (shop or user)'),
  shopProfile: ShopProfileSchema.nullable().optional().describe('Sender shop profile if available'),
  userProfile: ProfileSchema.nullable().optional().describe('Sender user profile if available'),
  metadata: z
    .record(z.string(), z.any())
    .nullable()
    .optional()
    .describe('Parsed metadata including sender name and any extra details'),
});

const NotificationArrayResponseSchema = NotificationSingleResponseSchema.array();

class NotificationSingleResponseDto extends createZodDto(
  NotificationSingleResponseSchema,
) {}

class NotificationArrayResponseDto extends createZodDto(
  NotificationArrayResponseSchema,
) {}

export {
    NotificationSingleResponseSchema,
    NotificationArrayResponseSchema,
    NotificationSingleResponseDto,
    NotificationArrayResponseDto
}