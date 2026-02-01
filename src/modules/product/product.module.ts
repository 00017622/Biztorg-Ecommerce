import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DrizzleModule } from 'src/database/drizzle.module';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { JobsModule } from '../jobs/jobs.module';
import { RedisModule } from '../redis/redis.module';

@Module({
  imports: [
    ConfigModule,
    DrizzleModule,
    JobsModule,
    ConfigModule,
    RedisModule,
  ],
  controllers: [ProductController],
  providers: [ProductService],
  exports: [ProductService], 
})
export class ProductModule {}
