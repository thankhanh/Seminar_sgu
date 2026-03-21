import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { MenusService } from './menus.service';

@ApiTags('Menus')
@Controller('menus')
export class MenusController {
  constructor(private readonly menusService: MenusService) {}
}
