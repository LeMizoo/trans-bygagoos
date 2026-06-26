import { Controller, Get, Post, Put, Delete, Param, Body, Query } from '@nestjs/common';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly service: NotificationsService) {}

  @Get() findAll(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.service.findAll(Number(page) || 1, Number(limit) || 20);
  }
  @Post() create(@Body() data: { titre: string; message: string; type: string }) { return this.service.create(data); }
  @Put(':id/lu') marquerLu(@Param('id') id: string) { return this.service.marquerLu(id); }
  @Delete(':id') supprimer(@Param('id') id: string) { return this.service.supprimer(id); }
  @Get('count') countNonLu() { return this.service.countNonLu(); }
}
