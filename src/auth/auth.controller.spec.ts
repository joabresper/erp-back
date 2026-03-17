import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { type RequestWithUser } from './entities/req.entity';

describe('AuthController', () => {
  let controller: AuthController;
  let service: DeepMockProxy<AuthService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockDeep<AuthService>(),
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('debería delegar en authService.signIn', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'pass123',
      };
      const token = { accessToken: 'jwt-token' };

      service.signIn.mockResolvedValue(token);

      const result = await controller.login(loginDto);

      expect(result).toEqual(token);
      expect(service.signIn).toHaveBeenCalledWith(loginDto);
      expect(service.signIn).toHaveBeenCalledTimes(1);
    });
  });

  describe('getProfile', () => {
    it('debería delegar en authService.getProfile usando req.user.id', async () => {
      const req = {
        user: {
          id: 'uuid-user-1',
          role: 'ADMIN',
          level: 10,
        },
      } as RequestWithUser;
      const profile = {
        id: req.user.id,
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

      service.getProfile.mockResolvedValue(profile as never);

      const result = await controller.getProfile(req);

      expect(result).toEqual(profile);
      expect(service.getProfile).toHaveBeenCalledWith(req.user.id);
      expect(service.getProfile).toHaveBeenCalledTimes(1);
    });
  });
});
