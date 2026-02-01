import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DrizzleModule } from 'src/database/drizzle.module';
import { RegionController } from './region.controller';
import { RegionService } from './region.service';

@Module({
  imports: [
    ConfigModule,
    DrizzleModule,
  ],
  controllers: [RegionController],
  providers: [RegionService],
  exports: [RegionService], 
})
export class RegionModule {}
