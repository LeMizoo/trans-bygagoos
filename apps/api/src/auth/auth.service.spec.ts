import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';

// Mock bcrypt
jest.mock('bcrypt', () => ({
  compare: jest.fn(),
}));

describe('AuthService', () => {
  let authService: AuthService;
  let bcrypt: { compare: jest.Mock };

  const mockUser = {
    id: '1',
    email: 'test@test.com',
    password: 'hashedPassword',
    nom: 'Test',
    role: 'LIVREUR',
    actif: true,
    telephone: null,
    coopId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPrisma = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  };

  const mockJwt = {
    sign: jest.fn().mockReturnValue('mockToken'),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: JwtService, useValue: mockJwt },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    bcrypt = require('bcrypt');
  });

  it('devrait être défini', () => {
    expect(authService).toBeDefined();
  });

  describe('login', () => {
    it('devrait retourner un token si OK', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      const result = await authService.login('test@test.com', 'password');

      expect(result.token).toBe('mockToken');
      expect(mockJwt.sign).toHaveBeenCalled();
    });

    it('devrait rejeter si mauvais mot de passe', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      await expect(
        authService.login('test@test.com', 'wrong'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('devrait rejeter si utilisateur inconnu', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(
        authService.login('inconnu@test.com', 'password'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
