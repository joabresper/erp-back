import {
  ValidationPipe,
  ValidationError,
  BadRequestException,
  Injectable,
} from '@nestjs/common';

@Injectable()
export class DtoValidationPipe extends ValidationPipe {
  constructor() {
    super({
      whitelist: true,
      forbidNonWhitelisted: true,
      stopAtFirstError: true,
      transform: true, // ¡IMPORTANTE! Para que el @Type(() => Date) funcione
      exceptionFactory: (errors: ValidationError[]) => {
        const formatErrors = (errors: ValidationError[]) => {
          return errors.map((error) => {
            // Si el error tiene hijos (es un objeto anidado o array)
            if (error.children && error.children.length > 0) {
              // Buscamos el error real en el primer hijo que tenga problemas
              const childError = error.children[0];
              // Si el hijo también tiene hijos, seguimos bajando (recursividad básica)
              if (childError.children && childError.children.length > 0) {
                return formatErrors([childError])[0];
              }
              return {
                field: `${error.property}.${childError.property}`,
                error: Object.values(childError.constraints || {})[0] || 'Error anidado',
              };
            }

            // Error de nivel superior (lo que ya tenías)
            return {
              field: error.property,
              error: error.constraints
                ? Object.values(error.constraints)[0]
                : 'Error de validación desconocido',
            };
          });
        };

        return new BadRequestException({
          statusCode: 400,
          error: 'Bad Request',
          messages: formatErrors(errors),
        });
      },
    });
  }
}
