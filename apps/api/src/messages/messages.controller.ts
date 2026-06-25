import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { MessagesService } from './messages.service';

@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Get('conversations')
  getConversations() {
    return this.messagesService.getConversations();
  }

  @Get('chauffeur/:chauffeurId')
  findByChauffeur(@Param('chauffeurId') id: string) {
    return this.messagesService.findByChauffeur(id);
  }

  @Post()
  send(@Body() data: { chauffeurId: string; contenu: string; expediteur: string }) {
    return this.messagesService.send(data.chauffeurId, data.contenu, data.expediteur);
  }
}
