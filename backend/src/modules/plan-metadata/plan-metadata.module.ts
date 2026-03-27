import { Module } from '@nestjs/common';
import { PlanMetadataService } from './plan-metadata.service';
import { PlanMetadataController } from './plan-metadata.controller';
import { DatabaseModule } from '../../database/database.module';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Reflector } from '@nestjs/core';

@Module({
  imports: [DatabaseModule],
  controllers: [PlanMetadataController],
  providers: [PlanMetadataService],
  exports: [PlanMetadataService],
})
export class PlanMetadataModule {}
