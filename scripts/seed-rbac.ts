import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../src/db/schema';
import * as dotenv from 'dotenv';
import crypto from 'crypto';
import { eq } from 'drizzle-orm';

// Load environment variables
dotenv.config({ path: '.env.local' });

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is missing in environment variables.');
}

const client = postgres(connectionString, { max: 1 });
const db = drizzle(client, { schema });

async function main() {
  console.log('Seeding RBAC...');

  try {
    // 1. Check if Super Admin role exists
    let superAdminRole = await db.query.roles.findFirst({
      where: eq(schema.roles.namaRole, 'Super Admin'),
    });

    if (!superAdminRole) {
      console.log('Creating Super Admin role...');
      const [newRole] = await db.insert(schema.roles).values({
        id: crypto.randomUUID(),
        namaRole: 'Super Admin',
        deskripsi: 'Administrator Sistem dengan akses penuh',
        warnaBadge: 'red',
        isAktif: true,
      }).returning();
      superAdminRole = newRole;
    } else {
      console.log('Super Admin role already exists.');
    }

    // 2. Insert Permissions
    const initialPermissions = [
      { nama: 'MASTER_SEKOLAH_READ', modul: 'Master Data', deskripsi: 'Lihat Data Sekolah' },
      { nama: 'MASTER_SEKOLAH_CREATE', modul: 'Master Data', deskripsi: 'Tambah Data Sekolah' },
      { nama: 'MASTER_SEKOLAH_UPDATE', modul: 'Master Data', deskripsi: 'Ubah Data Sekolah' },
      { nama: 'MASTER_SEKOLAH_DELETE', modul: 'Master Data', deskripsi: 'Hapus Data Sekolah' },

      { nama: 'MASTER_PEGAWAI_READ', modul: 'Master Data', deskripsi: 'Lihat Data Pegawai' },
      { nama: 'MASTER_PEGAWAI_CREATE', modul: 'Master Data', deskripsi: 'Tambah Data Pegawai' },
      { nama: 'MASTER_PEGAWAI_UPDATE', modul: 'Master Data', deskripsi: 'Ubah Data Pegawai' },
      { nama: 'MASTER_PEGAWAI_DELETE', modul: 'Master Data', deskripsi: 'Hapus Data Pegawai' },
      
      { nama: 'MASTER_JABATAN_READ', modul: 'Master Data', deskripsi: 'Lihat Data Jabatan' },
      { nama: 'MASTER_UNIT_KERJA_READ', modul: 'Master Data', deskripsi: 'Lihat Data Unit Kerja' },
    ];

    console.log('Inserting Permissions...');
    for (const perm of initialPermissions) {
      let existingPerm = await db.query.permissions.findFirst({
        where: eq(schema.permissions.nama, perm.nama),
      });

      if (!existingPerm) {
        const [insertedPerm] = await db.insert(schema.permissions).values({
          id: crypto.randomUUID(),
          nama: perm.nama,
          modul: perm.modul,
          deskripsi: perm.deskripsi,
        }).returning();
        existingPerm = insertedPerm;
      }

      // 3. Assign Permission to Super Admin Role
      let rolePerm = await db.query.rolePermissions.findFirst({
        where: (rp, { and, eq }) => and(
          eq(rp.roleId, superAdminRole!.id),
          eq(rp.permissionId, existingPerm!.id)
        ),
      });

      if (!rolePerm) {
        await db.insert(schema.rolePermissions).values({
          id: crypto.randomUUID(),
          roleId: superAdminRole!.id,
          permissionId: existingPerm!.id,
        });
      }
    }

    // 4. Assign Super Admin to first user
    const firstUser = await db.query.users.findFirst();
    if (firstUser) {
      let userRole = await db.query.userRoles.findFirst({
        where: (ur, { and, eq }) => and(
          eq(ur.userId, firstUser.id),
          eq(ur.roleId, superAdminRole!.id)
        ),
      });

      if (!userRole) {
        console.log(`Assigning Super Admin role to user ${firstUser.username}...`);
        await db.insert(schema.userRoles).values({
          id: crypto.randomUUID(),
          userId: firstUser.id,
          roleId: superAdminRole!.id,
        });
      } else {
        console.log(`User ${firstUser.username} is already a Super Admin.`);
      }
    } else {
      console.warn('No users found in database to assign Super Admin role.');
    }

    console.log('RBAC Seeding completed successfully.');
  } catch (error) {
    console.error('Error seeding RBAC:', error);
  } finally {
    process.exit(0);
  }
}

main();
