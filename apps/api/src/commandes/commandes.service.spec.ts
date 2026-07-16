import { Test, TestingModule } from '@nestjs/testing';
import { CommandesService } from './commandes.service';
import { PrismaService } from '../prisma/prisma.service';
import { SocketGateway } from '../socket/socket.gateway';

describe('CommandesService', () => {
  let commandesService: CommandesService;

  const mockCommande = {
    id: 'cmd-1',
    coopId: 'coop-1',
    clientNom: 'Client Test',
    clientTel: '0340000000',
    depart: 'Analakely',
    arrivee: 'Anosy',
    description: 'Colis test',
    type: 'COLIS',
    urgence: 'NORMAL',
    prix: 15000,
    paiement: 'A_PAYER',
    statut: 'EN_ATTENTE',
    dateCreation: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPrisma = {
    commande: {
      findMany: jest.fn().mockResolvedValue([mockCommande]),
      findUnique: jest.fn().mockResolvedValue(mockCommande),
      create: jest.fn().mockResolvedValue(mockCommande),
      update: jest.fn().mockResolvedValue(mockCommande),
    },
  };

  const mockSocketGateway = {
    nouvelleCommande: jest.fn(),
    commandeUpdated: jest.fn(),
    notifierLivreur: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommandesService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: SocketGateway, useValue: mockSocketGateway },
      ],
    }).compile();

    commandesService = module.get<CommandesService>(CommandesService);
  });

  it('devrait être défini', () => {
    expect(commandesService).toBeDefined();
  });

  describe('findAll', () => {
    it('devrait retourner toutes les commandes d\'une coop', async () => {
      const result = await commandesService.findAll('coop-1');
      expect(result).toEqual([mockCommande]);
      expect(mockPrisma.commande.findMany).toHaveBeenCalledWith({
        where: { coopId: 'coop-1' },
        include: { livreur: true, vehicule: true },
        orderBy: { dateCreation: 'desc' },
      });
    });
  });

  describe('create', () => {
    it('devrait créer une commande et notifier via Socket.IO', async () => {
      const data = { coopId: 'coop-1', clientNom: 'Test', depart: 'A', arrivee: 'B', description: 'Test', type: 'COLIS', prix: 10000 };
      const result = await commandesService.create(data);

      expect(result).toEqual(mockCommande);
      expect(mockPrisma.commande.create).toHaveBeenCalled();
      expect(mockSocketGateway.nouvelleCommande).toHaveBeenCalledWith(mockCommande);
    });
  });

  describe('updateStatut', () => {
    it('devrait mettre à jour le statut et notifier', async () => {
      const result = await commandesService.updateStatut('cmd-1', 'EN_COURS');

      expect(result).toEqual(mockCommande);
      expect(mockPrisma.commande.update).toHaveBeenCalled();
      expect(mockSocketGateway.commandeUpdated).toHaveBeenCalledWith(mockCommande);
    });

    it('devrait ajouter dateLivraison si statut LIVREE', async () => {
      await commandesService.updateStatut('cmd-1', 'LIVREE');

      expect(mockPrisma.commande.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'cmd-1' },
          data: expect.objectContaining({
            statut: 'LIVREE',
            dateLivraison: expect.any(Date),
          }),
        })
      );
    });
  });
});
