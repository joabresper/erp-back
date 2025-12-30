# ERP Backend API

<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

<p align="center">
  Sistema ERP backend desarrollado con <a href="http://nodejs.org" target="_blank">Node.js</a> y <a href="https://nestjs.com" target="_blank">NestJS</a>
</p>

## 📋 Descripción

ERP Backend es una API RESTful desarrollada con NestJS que proporciona una base sólida para la gestión empresarial. El sistema incluye módulos de gestión de usuarios, roles y permisos, con una arquitectura escalable y mantenible.

## ✨ Características

- 🔐 **Gestión de Usuarios**: Sistema completo de usuarios con autenticación y autorización
- 👥 **Sistema de Roles y Permisos**: Control de acceso basado en roles (RBAC) con permisos granulares
- 🗄️ **Base de Datos PostgreSQL**: Persistencia de datos robusta con Prisma ORM
- 📚 **Documentación API**: Swagger/OpenAPI integrado para documentación interactiva
- ✅ **Validación de Datos**: Validación automática de entrada con class-validator
- 🔒 **Seguridad**: Hash de contraseñas con bcrypt
- 🧪 **Testing**: Suite de tests unitarios y e2e con Jest
- 🎯 **TypeScript**: Código type-safe y mantenible
- 🚀 **Arquitectura Modular**: Estructura organizada y escalable

## 🛠️ Stack Tecnológico

- **Framework**: NestJS 11.x
- **Lenguaje**: TypeScript 5.x
- **Base de Datos**: PostgreSQL
- **ORM**: Prisma 7.x
- **Validación**: class-validator, class-transformer
- **Documentación**: Swagger/OpenAPI
- **Testing**: Jest
- **Linting**: ESLint + Prettier

## 📦 Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

- [Node.js](https://nodejs.org/) (v18 o superior)
- [npm](https://www.npmjs.com/) o [yarn](https://yarnpkg.com/)
- [PostgreSQL](https://www.postgresql.org/) (v12 o superior)
- [Docker](https://www.docker.com/) (opcional, para desarrollo con docker-compose)

## 🚀 Instalación

1. **Clonar el repositorio**

```bash
git clone <repository-url>
cd erp-back
```

2. **Instalar dependencias**

```bash
npm install
```

3. **Configurar variables de entorno**

Crea un archivo `.env` en la raíz del proyecto:

```env
DATABASE_URL="postgresql://usuario:contraseña@localhost:5432/erp_db?schema=public"
PORT=3000
```

4. **Configurar la base de datos**

```bash
# Generar el cliente de Prisma
npx prisma generate

# Ejecutar migraciones
npx prisma migrate dev

# (Opcional) Abrir Prisma Studio para visualizar la base de datos
npx prisma studio
```

## 🏃 Ejecución

### Modo Desarrollo

```bash
npm run start:dev
```

La aplicación estará disponible en `http://localhost:3000`

### Modo Producción

```bash
# Compilar
npm run build

# Ejecutar
npm run start:prod
```

### Modo Debug

```bash
npm run start:debug
```

## 📚 Documentación de API

Una vez que la aplicación esté en ejecución, puedes acceder a la documentación interactiva de Swagger en:

```
http://localhost:3000/api
```

La documentación incluye:
- Descripción de todos los endpoints
- Esquemas de datos
- Ejemplos de peticiones y respuestas
- Capacidad de probar endpoints directamente desde el navegador

## 🧪 Testing

### Ejecutar tests unitarios

```bash
npm run test
```

### Ejecutar tests en modo watch

```bash
npm run test:watch
```

### Ejecutar tests e2e

```bash
npm run test:e2e
```

### Generar reporte de cobertura

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

## 🔧 Scripts Disponibles

| Script | Descripción |
|--------|-------------|
| `npm run build` | Compila el proyecto TypeScript |
| `npm run start` | Ejecuta la aplicación en modo producción |
| `npm run start:dev` | Ejecuta en modo desarrollo con hot-reload |
| `npm run start:debug` | Ejecuta en modo debug |
| `npm run start:prod` | Ejecuta la versión compilada |
| `npm run test` | Ejecuta tests unitarios |
| `npm run test:watch` | Ejecuta tests en modo watch |
| `npm run test:cov` | Genera reporte de cobertura |
| `npm run test:e2e` | Ejecuta tests end-to-end |
| `npm run lint` | Ejecuta el linter |
| `npm run format` | Formatea el código con Prettier |

## 🗄️ Base de Datos

El proyecto utiliza Prisma como ORM. Los modelos principales incluyen:

- **User**: Gestión de usuarios del sistema
- **Role**: Roles de usuario
- **Permission**: Permisos del sistema

### Comandos útiles de Prisma

```bash
# Crear una nueva migración
npx prisma migrate dev --name nombre_migracion

# Aplicar migraciones en producción
npx prisma migrate deploy

# Generar el cliente de Prisma
npx prisma generate

# Abrir Prisma Studio (GUI para la base de datos)
npx prisma studio

# Resetear la base de datos (¡cuidado en producción!)
npx prisma migrate reset
```

## 🔐 Seguridad

- Las contraseñas se almacenan con hash usando bcrypt
- Validación de entrada en todos los endpoints
- Manejo de errores personalizado
- Soft delete para usuarios (campo `deletedAt`)

## 📝 Licencia

Este proyecto es privado y no está licenciado para uso público.

## 👥 Contribución

Este es un proyecto privado. Para contribuciones internas, por favor sigue las guías de desarrollo del equipo.

---

<p align="center">
  Desarrollado con ❤️ usando <a href="https://nestjs.com">NestJS</a>
</p>
