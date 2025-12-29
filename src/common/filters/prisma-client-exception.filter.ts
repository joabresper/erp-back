// src/common/filters/prisma-client-exception.filter.ts
import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Response } from 'express';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaClientExceptionFilter implements ExceptionFilter {
  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const errorCode = exception.code;

    switch (errorCode) {
      // P2002: Unique constraint failed
      case 'P2002': {
        const status = HttpStatus.CONFLICT; // 409
        const fields = (exception.meta as any)?.target || [];
        response.status(status).json({
          statusCode: status,
          message: `Ya existe un registro con ese valor en el campo: ${fields}`,
          error: 'Conflict',
        });
        break;
      }

	  // P2003: Foreign key constraint failed
      case 'P2003': {
        const status = HttpStatus.CONFLICT; // 409
        const fieldName = (exception.meta as any)?.field_name;
        response.status(status).json({
          statusCode: status,
          message: `Relaciones de datos en conflicto (Campo afectado: ${fieldName}).`,
          error: 'Bad Request',
		  // Si es DELETE, hay hijos asociados. Si es CREATE, el padre no existe.
        });
        break;
      }

      // P2025: Record not found
      case 'P2025': {
        const status = HttpStatus.NOT_FOUND; // 404
        response.status(status).json({
          statusCode: status,
          message: 'El registro que intentas actualizar o eliminar no existe',
          error: 'Not Found',
        });
        break;
      }

      // Otros errores aca

      // Error de Prisma no manejado explícitamente -> 500 Internal Server Error
      default:
        console.error(exception); // Loguear para debug
        response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Error interno de base de datos',
        });
        break;
    }
  }
}