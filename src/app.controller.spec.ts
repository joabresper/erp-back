import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';

describe('AppController', () => {
  let appController: AppController;
  let appService: DeepMockProxy<AppService>;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        {
          provide: AppService,
          useValue: mockDeep<AppService>(),
        },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
    appService = app.get(AppService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(appController).toBeDefined();
  });

  describe('getHello', () => {
    it('should return service greeting', () => {
      appService.getHello.mockReturnValue('Hello World!');

      const result = appController.getHello();

      expect(result).toBe('Hello World!');
      expect(appService.getHello).toHaveBeenCalledTimes(1);
    });
  });
});
