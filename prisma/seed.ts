import * as bcrypt from 'bcrypt';
import { PrismaService } from '../src/prisma/prisma.service';

const prisma = new PrismaService();

async function main() {
  // 1. Crear (o asegurar) el Rol "USER" (Sin permisos por defecto)
  const userRole = await prisma.role.upsert({
    where: { name: 'USER' },
    update: {}, // Si existe, no hacemos nada
    create: {
      name: 'USER',
      description: 'Rol por defecto para nuevos usuarios',
    },
  });
  console.log(`✅ Rol creado/asegurado: ${userRole.name}`);

  // 2. Crear (o asegurar) el Rol "ADMIN" (Para tu usuario principal)
  const adminRole = await prisma.role.upsert({
    where: { name: 'ADMIN' },
    update: {},
    create: {
      name: 'ADMIN',
      description: 'Administrador del sistema',
    },
  });
  console.log(`✅ Rol creado/asegurado: ${adminRole.name}`);

  // 3. Hashear la contraseña segura
  // IMPORTANTE: En producción, usá una variable de entorno o una password compleja
  const password = await bcrypt.hash('admin', 10);

  // 4. Crear el Usuario Admin
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@admin.com' },
    update: {
      // Opcional: Si querés que el seed resetee la password del admin cada vez que corre, descomentá esto:
      // password: password 
    },
    create: {
      email: 'admin@admin.com',
      fullName: 'Admin',
      password: password,
      roleId: adminRole.id, // Lo vinculamos al rol ADMIN que acabamos de crear
    },
  });

  console.log(`✅ Usuario Admin creado/asegurado: ${adminUser.email}`);
}

// Boilerplate estándar de Prisma para manejar la desconexión
main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });