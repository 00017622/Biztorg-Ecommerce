import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiTags,
  ApiOkResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { AIService } from './AI.service';
import { GenerateDescriptionRequestDto, GenerateDescriptionResponseDto } from './dto/AI.dto';

@ApiBearerAuth()
@ApiTags('AI')
@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AIController {
  constructor(private readonly aiService: AIService) {}

  @Post('generate-description')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Generate product description from product title' })
  @ApiBody({ type: GenerateDescriptionRequestDto })
  @ApiOkResponse({ type: GenerateDescriptionResponseDto })
  async generateDescription(
    @Body() input: GenerateDescriptionRequestDto,
  ): Promise<GenerateDescriptionResponseDto> {
    const description = await this.aiService.generateDescription(input.title);
    return { title: input.title, description };
  }
}