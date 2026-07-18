import { Test, TestingModule } from '@nestjs/testing';
import { CommandesService } from './commandes.service';
import { PrismaService } from '../prisma/prisma.service';

describe('CommandesService', () => {
  let service: CommandesService;

  const mockPrisma = {
    commande: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommandesService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<CommandesService>(CommandesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all commandes', async () => {
      const mockCommandes = [
        { id: '1', reference: 'CMD-001', statut: 'EN_ATTENTE' },
        { id: '2', reference: 'CMD-002', statut: 'LIVREE' },
      ];

      mockPrisma.commande.findMany.mockResolvedValue(mockCommandes);

      const result = await service.findAll();
      expect(result).toEqual(mockCommandes);
      expect(mockPrisma.commande.findMany).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a single commande', async () => {
      const mockCommande = { id: '1', reference: 'CMD-001' };
      mockPrisma.commande.findUnique.mockResolvedValue(mockCommande);

      const result = await service.findOne('1');
      expect(result).toEqual(mockCommande);
    });
  });

  describe('update', () => {
    it('should update commande statut', async () => {
      const mockUpdated = { id: '1', statut: 'EN_COURS' };
      mockPrisma.commande.update.mockResolvedValue(mockUpdated);

      const result = await service.update('1', { statut: 'EN_COURS' });
      expect(result.statut).toBe('EN_COURS');
    });
  });
});
