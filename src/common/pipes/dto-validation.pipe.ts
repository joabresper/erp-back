import { 
  ValidationPipe, 
  ValidationError, 
  BadRequestException, 
  Injectable 
} from '@nestjs/common';

@Injectable()
export class DtoValidationPipe extends ValidationPipe {
  constructor() {
    super({
      whitelist: true, // Borra campos extra no definidos en el DTO
      forbidNonWhitelisted: true, // Lanza error si mandan campos extra
      stopAtFirstError: true, // Ahorra recursos mostrando solo el primer error por campo
      
      // Formateo de errores
      exceptionFactory: (errors: ValidationError[]) => {
        const result = errors.map((error) => ({
          field: error.property,
          // Se toma el primer mensaje de error disponible
          error: error.constraints 
            ? Object.values(error.constraints)[0] 
            : 'Error de validación desconocido',
        }));
        
        return new BadRequestException({
          statusCode: 400,
          error: 'Bad Request',
          messages: result, // Devuelve el array limpio
        });
      },
    });
  }
}