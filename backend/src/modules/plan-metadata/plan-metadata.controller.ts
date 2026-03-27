import { Controller, Get, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { PlanMetadataService } from './plan-metadata.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('plan-metadata')
export class PlanMetadataController {
  constructor(private readonly planMetadataService: PlanMetadataService) {}

  @Get()
  findAll() {
    return this.planMetadataService.findAll();
  }

  @Get(':key')
  findByKey(@Param('key') key: string) {
    return this.planMetadataService.findByKey(key);
  }

  @Patch(':key')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.admin)
  update(@Param('key') key: string, @Body() updateDto: any) {
    return this.planMetadataService.update(key, updateDto);
  }
}
