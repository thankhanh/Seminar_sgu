import { Module } from '@nestjs/common';
import { StoresController } from './stores.controller';
import { StoresService } from './stores.service';
import { PlanMetadataModule } from '../plan-metadata/plan-metadata.module';

@Module({
  imports: [PlanMetadataModule],
  controllers: [StoresController],
  providers: [StoresService],
  exports: [StoresService],
})
export class StoresModule {}
