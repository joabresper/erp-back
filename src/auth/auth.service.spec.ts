import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from 'src/users/users.service';
import { HashingService } from 'src/common/providers/hashing.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: DeepMockProxy<UsersService>;
  let hashingService: DeepMockProxy<HashingService>;
  let jwtService: DeepMockProxy<JwtService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: mockDeep<UsersService>(),
        },
        {
          provide: HashingService,
          useValue: mockDeep<HashingService>(),
        },
        {
          provide: JwtService,
          useValue: mockDeep<JwtService>(),
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get(UsersService);
    hashingService = module.get(HashingService);
    jwtService = module.get(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('debe estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('signIn', () => {
    it('devuelve accessToken con credenciales válidas', async () => {
      const dto = { email: 'test@example.com', password: 'plain' };
      const user = {
        id: 'uuid-user-1',
        email: dto.email,
        fullName: 'John Doe',
        password: 'hashed-pass',
        phone: null,
        address: null,
        roleId: 'uuid-role-1',
        deletedAt: null,
        role: {
          id: 'uuid-role-1',
          name: 'ADMIN',
          description: 'Admin role',
          level: 10,
        },
      };

      usersService.findByEmail.mockResolvedValue(user as never);
      hashingService.compare.mockResolvedValue(true);
      jwtService.signAsync.mockResolvedValue('token123');

      await expect(service.signIn(dto as any)).resolves.toEqual({
        accessToken: 'token123',
      });

      expect(usersService.findByEmail).toHaveBeenCalledWith(dto.email);
      expect(hashingService.compare).toHaveBeenCalledWith(
        dto.password,
        user.password,
      );
      expect(jwtService.signAsync).toHaveBeenCalledWith({
        sub: user.id,
        role: user.role.name,
        level: user.role.level,
      });
    });

    it('lanza UnauthorizedException cuando el usuario no existe (P2025)', async () => {
      const notFoundError = Object.assign(new Error('not found'), {
        code: 'P2025',
      });

      usersService.findByEmail.mockRejectedValue(notFoundError);

      await expect(
        service.signIn({ email: 'no@one.com', password: 'x' } as any),
      ).rejects.toThrow(UnauthorizedException);
      expect(hashingService.compare).not.toHaveBeenCalled();
      expect(jwtService.signAsync).not.toHaveBeenCalled();
    });

    it('lanza UnauthorizedException cuando error de búsqueda es NotFoundError', async () => {
      const notFoundError = Object.assign(new Error('not found'), {
        name: 'NotFoundError',
      });

      usersService.findByEmail.mockRejectedValue(notFoundError);

      await expect(
        service.signIn({ email: 'no@one.com', password: 'x' } as any),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('propaga errores inesperados de usersService.findByEmail', async () => {
      const dbError = new Error('DB unavailable');

      usersService.findByEmail.mockRejectedValue(dbError);

      await expect(
        service.signIn({ email: 'test@example.com', password: 'x' } as any),
      ).rejects.toThrow('DB unavailable');
      expect(hashingService.compare).not.toHaveBeenCalled();
      expect(jwtService.signAsync).not.toHaveBeenCalled();
    });

    it('lanza UnauthorizedException cuando la contraseña no es válida', async () => {
      const user = {
        id: 'uuid-user-1',
        email: 'a@b.com',
        fullName: 'John Doe',
        password: 'hashed',
        phone: null,
        address: null,
        roleId: 'uuid-role-1',
        deletedAt: null,
        role: {
          id: 'uuid-role-1',
          name: 'ADMIN',
          description: 'Admin role',
          level: 10,
        },
      };
      usersService.findByEmail.mockResolvedValue(user as never);
      hashingService.compare.mockResolvedValue(false);

      await expect(
        service.signIn({ email: 'a@b.com', password: 'wrong' } as any),
      ).rejects.toThrow(UnauthorizedException);

      expect(jwtService.signAsync).not.toHaveBeenCalled();
    });
  });

  describe('getProfile', () => {
    it('retorna perfil desde usersService.findByIdWithRole', async () => {
      const userId = 'uuid-user-1';
      const profile = {
        id: userId,
        email: 'test@example.com',
        fullName: 'John Doe',
        phone: null,
        address: null,
        roleId: 'uuid-role-1',
        deletedAt: null,
        role: {
          id: 'uuid-role-1',
          name: 'ADMIN',
          description: 'Admin role',
          level: 10,
        },
      };

      usersService.findByIdWithRole.mockResolvedValue(profile as never);

      const result = await service.getProfile(userId);

      expect(result).toEqual(profile);
      expect(usersService.findByIdWithRole).toHaveBeenCalledWith(userId);
    });
  });
});
