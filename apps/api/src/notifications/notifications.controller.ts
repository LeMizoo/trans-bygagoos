import { Controller, Get, Post, Put, Body, Param, Query, UseGuards, Request, Delete } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  async findAll(
    @Request() req,
    @Query('onlyUnread') onlyUnread?: string,
  ) {
    // Les chauffeurs/livreurs ne voient que leurs notifications
    if (['CHAUFFEUR', 'LIVREUR'].includes(req.user.role)) {
      return this.notificationsService.findAll(req.user.id, onlyUnread === 'true');
    }
    // Les admins peuvent tout voir
    return this.notificationsService.findAll(undefined, onlyUnread === 'true');
  }

  @Get('count')
  async getUnreadCount(@Request() req) {
    return {
      count: await this.notificationsService.getUnreadCount(req.user.id),
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.notificationsService.findOne(id);
  }

  @Post()
  async create(@Body() body: {
    titre: string;
    message: string;
    type: 'INFO' | 'WARNING' | 'URGENT' | 'SUCCESS';
    userId: string;
  }) {
    return this.notificationsService.create(body);
  }

  @Post('bulk')
  async sendToMultiple(@Body() body: {
    titre: string;
    message: string;
    type: 'INFO' | 'WARNING' | 'URGENT' | 'SUCCESS';
    userIds: string[];
  }) {
    return this.notificationsService.sendToMultipleUsers(body);
  }

  @Post('broadcast')
  async sendToAllByRole(@Body() body: {
    titre: string;
    message: string;
    type: 'INFO' | 'WARNING' | 'URGENT' | 'SUCCESS';
    role: string;
  }) {
    return this.notificationsService.sendToAllByRole(body);
  }

  @Put(':id/read')
  async markAsRead(@Param('id') id: string) {
    return this.notificationsService.markAsRead(id);
  }

  @Put('read-all')
  async markAllAsRead(@Request() req) {
    return this.notificationsService.markAllAsRead(req.user.id);
  }

  @Delete('cleanup')
  async deleteOld(@Query('days') days?: number) {
    return this.notificationsService.deleteOld(days || 30);
  }
}
