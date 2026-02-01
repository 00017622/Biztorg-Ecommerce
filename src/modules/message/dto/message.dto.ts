import { createZodDto } from 'nestjs-zod/dto';
import { MessageSchema } from 'src/utils/zod.schema';
import { z } from 'zod';

const MessageSingleResponseSchema = MessageSchema.describe('Single message schema');

const MessageArrayResponseSchema = MessageSchema.array().describe('Array of messages schema')

const CreateMessageRequestSchema = MessageSchema.pick({ message: true, imageUrl: true}).extend({
    receiverId: z.uuid(),
}) .describe('Create message request data')

const UpdateMessageRequestSchema = MessageSchema.pick({message: true, id: true}).describe('Update message request data');

const ImageMessageResponseSchema = z.object({
    filename: z.string().describe('image filename'),
    imageUrl: z.string().describe('image url')
});

class MessageSingleResponseDto extends createZodDto(
  MessageSingleResponseSchema,
) {}

class MessageArrayResponseDto extends createZodDto(
  MessageArrayResponseSchema,
) {}

class CreateMessageRequestDto extends createZodDto(
  CreateMessageRequestSchema,
) {}

class UpdateMessageRequestDto extends createZodDto(
  UpdateMessageRequestSchema,
) {}

class ImageMessageResponseDto extends createZodDto(ImageMessageResponseSchema) {}

export {
    MessageSingleResponseSchema,
    MessageArrayResponseSchema,
    CreateMessageRequestSchema,
    UpdateMessageRequestSchema,
    MessageSingleResponseDto,
    MessageArrayResponseDto,
    CreateMessageRequestDto,
    UpdateMessageRequestDto,
    ImageMessageResponseSchema,
    ImageMessageResponseDto
}


