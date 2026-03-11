import * as bcrypt from 'bcrypt';
import { PrismaService } from '../src/prisma/prisma.service';

const prisma = new PrismaService();

const PERMISSIONS_LIST = [
  { name: 'CREATE_USER', description: 'Permite crear nuevos usuarios' },
  { name: 'UPDATE_USER', description: 'Permite modificar usuarios existentes' },
  { name: 'DELETE_USER', description: 'Permite eliminar usuarios' },
  { name: 'VIEW_USERS', description: 'Permite ver la lista de usuarios' },

  { name: 'CREATE_ROLE', description: 'Permite crear roles' },
  { name: 'UPDATE_ROLE', description: 'Permite modificar roles existentes' },
  { name: 'DELETE_ROLE', description: 'Permite eliminar roles' },
  { name: 'VIEW_ROLES', description: 'Permite ver la lista de roles' },

  { name: 'VIEW_PERMISSIONS', description: 'Permite ver la lista de permisos' },

  { name: 'UPDATE_ROLE_PERMISSIONS', description: 'Permite modificar los permisos de los roles' },
  { name: 'UPDATE_USER_ROLE', description: 'Permite modificar el rol de los usuarios' },

  { name: 'VIEW_PROFILE', description: 'Permite ver el perfil propio' },
  { name: 'UPDATE_PROFILE', description: 'Permite actualizar el perfil propio' },
];

async function main() {
  // 0. Crear los permisos
  for (const perm of PERMISSIONS_LIST) {
    await prisma.permission.upsert({
      where: { name: perm.name },
      update: { description: perm.description },
      create: { name: perm.name, description: perm.description },
    });
  }
  console.log(`✅ Permisos creados/asegurados: ${PERMISSIONS_LIST.length}`);
  const allPermissions = await prisma.permission.findMany();

  // 1. Crear (o asegurar) el Rol "USER" (Sin permisos por defecto)
  const userRole = await prisma.role.upsert({
    where: { name: 'USER' },
    update: {}, // Si existe, no hacemos nada
    create: {
      name: 'USER',
      description: 'Rol por defecto para nuevos usuarios',
      level: 1,
    },
  });
  console.log(`✅ Rol creado/asegurado: ${userRole.name}`);

  // 2. Crear (o asegurar) el Rol "ADMIN" (Para tu usuario principal)
  const adminRole = await prisma.role.upsert({
    where: { name: 'ADMIN' },
    update: {
      level: 100,
      permissions: {
        set: allPermissions.map((perm) => ({ id: perm.id })),
      },
    },
    create: {
      name: 'ADMIN',
      description: 'Administrador del sistema',
      level: 100,
      permissions: {
        connect: allPermissions.map((perm) => ({ id: perm.id })),
      },
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