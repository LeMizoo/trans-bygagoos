import { Controller, Get, Post, Put, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { AssistanceService } from './assistance.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('assistance')
@UseGuards(JwtAuthGuard)
export class AssistanceController {
  constructor(private readonly assistanceService: AssistanceService) {}

  @Get()
  async findAll(
    @Request() req,
    @Query('statut') statut?: string,
    @Query('type') type?: string,
  ) {
    // Chauffeurs/livreurs voient leurs propres tickets
    if (['CHAUFFEUR', 'LIVREUR'].includes(req.user.role)) {
      return this.assistanceService.findAll({ userId: req.user.id, statut, type });
    }
    // Admins/gérants voient tout
    return this.assistanceService.findAll({ statut, type });
  }

  @Get('stats')
  async getStats() {
    return this.assistanceService.getStats();
  }

  @Get('my-tickets')
  async getMyTickets(@Request() req) {
    return this.assistanceService.getTicketsByUser(req.user.id);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.assistanceService.findOne(id);
  }

  @Post()
  async create(
    @Request() req,
    @Body() body: {
      type: 'PANNE' | 'ACCIDENT' | 'QUESTION' | 'AUTRE';
      message: string;
    }
  ) {
    return this.assistanceService.create({
      type: body.type,
      message: body.message,
      userId: req.user.id,
    });
  }

  @Put(':id/respond')
  async respond(
    @Param('id') id: string,
    @Body() body: { reponse: string },
    @Request() req,
  ) {
    return this.assistanceService.respond(id, body.reponse, req.user.id);
  }

  @Put(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() body: { statut: 'EN_ATTENTE' | 'EN_COURS' | 'TRAITE' | 'FERME' },
  ) {
    return this.assistanceService.updateStatus(id, body.statut);
  }
}
