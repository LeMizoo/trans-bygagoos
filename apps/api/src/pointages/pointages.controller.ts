import { Controller, Get, Post, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { PointagesService } from './pointages.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('pointages')
@UseGuards(JwtAuthGuard)
export class PointagesController {
  constructor(private readonly pointagesService: PointagesService) {}

  @Get()
  async findAll(
    @Request() req,
    @Query('userId') userId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    // Les chauffeurs/livreurs ne voient que leurs pointages
    if (['CHAUFFEUR', 'LIVREUR'].includes(req.user.role)) {
      return this.pointagesService.findAll(req.user.id, 
        startDate ? new Date(startDate) : undefined,
        endDate ? new Date(endDate) : undefined
      );
    }
    // Les admins/gérants peuvent voir tous les pointages ou filtrer
    return this.pointagesService.findAll(userId,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined
    );
  }

  @Get('today')
  async findToday(@Request() req) {
    return this.pointagesService.findToday(req.user.id);
  }

  @Get('presence')
  async getPresenceToday() {
    return this.pointagesService.getPresenceToday();
  }

  @Get('stats')
  async getStats(
    @Request() req,
    @Query('userId') userId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const targetUserId = ['CHAUFFEUR', 'LIVREUR'].includes(req.user.role) 
      ? req.user.id 
      : userId || req.user.id;
    
    return this.pointagesService.getStats(
      targetUserId,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }

  @Post('entree')
  async pointerEntree(@Request() req, @Body() body: { localisation?: string }) {
    return this.pointagesService.pointer(req.user.id, 'ENTREE', body.localisation);
  }

  @Post('sortie')
  async pointerSortie(@Request() req, @Body() body: { localisation?: string }) {
    return this.pointagesService.pointer(req.user.id, 'SORTIE', body.localisation);
  }
}
