import * as bcrypt from 'bcrypt';
import { PrismaService } from '../src/prisma/prisma.service';
import { InvoiceType } from '@prisma/client';

const prisma = new PrismaService();

const PERMISSIONS_LIST = [
  { name: 'USER:CREATE', description: 'Permite crear nuevos usuarios' },
  { name: 'USER:UPDATE', description: 'Permite modificar usuarios existentes' },
  { name: 'USER:DELETE', description: 'Permite eliminar usuarios' },
  { name: 'USER:VIEW', description: 'Permite ver la lista de usuarios' },
  { name: 'USER:VIEW_DELETED', description: 'Permite ver usuarios eliminados' },
  { name: 'USER:RESTORE', description: 'Permite restaurar usuarios eliminados' },

  { name: 'ROLE:CREATE', description: 'Permite crear roles' },
  { name: 'ROLE:UPDATE', description: 'Permite modificar roles existentes' },
  { name: 'ROLE:DELETE', description: 'Permite eliminar roles' },
  { name: 'ROLE:VIEW', description: 'Permite ver la lista de roles' },

  { name: 'PERMISSION:VIEW', description: 'Permite ver la lista de permisos' },

  { name: 'ROLE:UPDATE_PERMISSIONS', description: 'Permite modificar los permisos de los roles' },
  { name: 'USER:UPDATE_ROLE', description: 'Permite modificar el rol de los usuarios' },

  { name: 'PROFILE:VIEW', description: 'Permite ver el perfil propio' },
  { name: 'PROFILE:UPDATE', description: 'Permite actualizar el perfil propio' },

  { name: 'PRODUCTS:CREATE', description: 'Permite crear nuevos productos' },
  { name: 'PRODUCTS:VIEW', description: 'Permite ver la lista de productos' },
  { name: 'PRODUCTS:UPDATE', description: 'Permite modificar productos existentes' },
  { name: 'PRODUCTS:CHANGE_STATUS', description: 'Permite cambiar el estado activo/inactivo de un producto' },
  { name: 'PRODUCTS:DELETE', description: 'Permite eliminar productos' },

  { name: 'CUSTOMER:CREATE', description: 'Permite crear nuevos clientes' },
  { name: 'CUSTOMER:VIEW', description: 'Permite ver la lista de clientes' },
  { name: 'CUSTOMER:VIEW_DELETED', description: 'Permite ver clientes eliminados' },
  { name: 'CUSTOMER:UPDATE', description: 'Permite modificar clientes existentes' },
  { name: 'CUSTOMER:DELETE', description: 'Permite eliminar clientes' },
  { name: 'CUSTOMER:RESTORE', description: 'Permite restaurar clientes eliminados' },

  { name: 'SALES:CREATE', description: 'Permite crear nuevas ventas' },
  { name: 'SALES:VIEW', description: 'Permite ver la lista de ventas' },
  { name: 'SALES:UPDATE', description: 'Permite modificar ventas existentes' },
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
  const password = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'admin', 10);

  // 4. Crear el Usuario Admin
  const adminUser = await prisma.user.upsert({
    where: { email: process.env.ADMIN_EMAIL || 'admin@admin.com' },
    update: {
      password: password 
    },
    create: {
      email: process.env.ADMIN_EMAIL || 'admin@admin.com',
      fullName: 'Admin',
      password: password,
      roleId: adminRole.id, // Lo vinculamos al rol ADMIN que acabamos de crear
    },
  });
  console.log(`✅ Usuario Admin creado/asegurado`);

  console.log('Creando secuencia de facturación para cada tipo de comprobante...');
  const invoiceTypes = Object.values(InvoiceType)
  for (const type of invoiceTypes) {
    await prisma.invoiceSequence.upsert({
      where: {
        type_prefix: {
          type: type,
          prefix: 1, // Punto de Venta por defecto
        },
      },
      update: {},
      create: {
        type: type,
        prefix: 1,
        lastNumber: 0,
      },
    });
  }
  console.log(`✅ Se procesaron ${invoiceTypes.length} secuencias de facturación.`);

  // Creacion de cliente por defecto
  const defaultCustomer = await prisma.customer.upsert({
    where: { taxId: '00000000000' },
    update: {},
    create: {
      name: 'Consumidor Final',
      taxId: '00000000000',
      taxCondition: 'CONSUMIDOR FINAL',
    },
  });
  console.log(`✅ Cliente por defecto creado/asegurado: ${defaultCustomer.name}`);
};

// Boilerplate estándar de Prisma para manejar la desconexión
main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });