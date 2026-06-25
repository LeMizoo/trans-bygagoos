import { Controller, Get, Post, Put, Param, Body } from '@nestjs/common';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  findAll() { return this.notificationsService.findAll(); }

  @Post()
  create(@Body() data: { titre: string; message: string; type: string }) {
    return this.notificationsService.create(data);
  }

  @Put(':id/lu')
  marquerLu(@Param('id') id: string) {
    return this.notificationsService.marquerLu(id);
  }

  @Get('count')
  countNonLu() {
    return this.notificationsService.countNonLu();
  }
}
