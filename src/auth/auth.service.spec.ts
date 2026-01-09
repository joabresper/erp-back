import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from 'src/users/users.service';
import { HashingService } from 'src/common/providers/hashing.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';

describe('AuthService', () => {
  describe('AuthService', () => {
    let service: AuthService;
    let usersService: Partial<Record<keyof UsersService, jest.Mock>>;
    let hashingService: Partial<Record<keyof HashingService, jest.Mock>>;
    let jwtService: Partial<Record<keyof JwtService, jest.Mock>>;

    beforeEach(async () => {
      usersService = {
        findByEmail: jest.fn(),
      };

      hashingService = {
        compare: jest.fn(),
      };

      jwtService = {
        signAsync: jest.fn(),
      };

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          AuthService,
          { provide: UsersService, useValue: usersService },
          { provide: HashingService, useValue: hashingService },
          { provide: JwtService, useValue: jwtService },
        ],
      }).compile();

      service = module.get<AuthService>(AuthService);
    });

    it('debe estar definido', () => {
      expect(service).toBeDefined();
    });

    it('signIn devuelve accessToken con credenciales válidas', async () => {
      const dto = { email: 'test@example.com', password: 'plain' };
      const user = { id: 42, password: 'hashed', role: { name: 'user' } };

      usersService.findByEmail!.mockResolvedValue(user);
      hashingService.compare!.mockResolvedValue(true);
      jwtService.signAsync!.mockResolvedValue('token123');

      await expect(service.signIn(dto as any)).resolves.toEqual({ accessToken: 'token123' });

      expect(usersService.findByEmail).toHaveBeenCalledWith(dto.email);
      expect(hashingService.compare).toHaveBeenCalledWith(dto.password, user.password);
      expect(jwtService.signAsync).toHaveBeenCalledWith({ sub: user.id, role: user.role.name });
    });

    it('signIn lanza UnauthorizedException cuando no se encuentra el usuario', async () => {
      usersService.findByEmail!.mockResolvedValue(null);
      jwtService.signAsync!.mockResolvedValue('should-not-be-called');

      await expect(service.signIn({ email: 'no@one.com', password: 'x' } as any)).rejects.toThrow(
        UnauthorizedException,
      );

      expect(jwtService.signAsync).not.toHaveBeenCalled();
    });

    it('signIn lanza UnauthorizedException cuando la contraseña no es válida', async () => {
      const user = { id: 7, password: 'hashed', role: { name: 'admin' } };
      usersService.findByEmail!.mockResolvedValue(user);
      hashingService.compare!.mockResolvedValue(false);

      await expect(service.signIn({ email: 'a@b.com', password: 'wrong' } as any)).rejects.toThrow(
        UnauthorizedException,
      );

      expect(jwtService.signAsync).not.toHaveBeenCalled();
    });
  });
});
