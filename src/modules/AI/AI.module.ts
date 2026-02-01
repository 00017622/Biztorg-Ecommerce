import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DrizzleModule } from 'src/database/drizzle.module';
import { AIController } from './AI.controller';
import { AIService } from './AI.service';

@Module({
  imports: [
    ConfigModule,
    DrizzleModule,
  ],
  controllers: [AIController],
  providers: [AIService],
  exports: [AIService], 
})
export class AIModule {}
