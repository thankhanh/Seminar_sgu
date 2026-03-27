import { Module } from '@nestjs/common';
import { PlanMetadataService } from './plan-metadata.service';
import { PlanMetadataController } from './plan-metadata.controller';
import { DatabaseModule } from '../../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [PlanMetadataController],
  providers: [PlanMetadataService],
  exports: [PlanMetadataService],
})
export class PlanMetadataModule {}
