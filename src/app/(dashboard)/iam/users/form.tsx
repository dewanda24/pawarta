'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { createUser, updateUser } from '@/features/iam/actions/user';
import { getRoleList } from '@/features/iam/actions/role';
import { getPegawaiList } from '@/features/master-data/actions/pegawai';

const formSchema = z.object({
  nama: z.string().min(1, 'Nama wajib diisi'),
  username: z.string().min(3, 'Username minimal 3 karakter'),
  email: z.string().email('Format email tidak valid'),
  password: z.string().optional(),
  status: z.enum(['Aktif', 'Nonaktif', 'Locked']),
  roleId: z.string().min(1, 'Role wajib dipilih'),
  pegawaiId: z.string().optional().nullable(),
});

export type UserFormValues = z.infer<typeof formSchema>;

interface UserFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: any;
}

export function UserForm({ open, onOpenChange, initialData }: UserFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [roles, setRoles] = useState<any[]>([]);
  const [pegawaiList, setPegawaiList] = useState<any[]>([]);

  const form = useForm<UserFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nama: '',
      username: '',
      email: '',
      password: '',
      status: 'Aktif',
      roleId: '',
      pegawaiId: null,
    },
  });

  useEffect(() => {
    async function loadOptions() {
      const resRoles = await getRoleList();
      if (resRoles.success) setRoles(resRoles.data || []);
      
      const resPegawai = await getPegawaiList({ limit: 1000 }); // Unpaginated hack for now or just enough limit
      if (resPegawai.success) setPegawaiList(resPegawai.data || []);
    }
    loadOptions();
  }, []);

  useEffect(() => {
    if (initialData && open) {
      form.reset({
        ...initialData,
        password: '', // never show password
        roleId: initialData.userRoles?.[0]?.roleId || '',
        pegawaiId: initialData.pegawaiId || null,
      });
    } else if (!open) {
      form.reset({
        nama: '',
        username: '',
        email: '',
        password: '',
        status: 'Aktif',
        roleId: '',
        pegawaiId: null,
      });
    }
  }, [initialData, open, form]);

  const onSubmit = async (data: UserFormValues) => {
    setIsSubmitting(true);
    try {
      if (!initialData && !data.password) {
        toast.error('Password wajib diisi untuk pengguna baru');
        setIsSubmitting(false);
        return;
      }

      const result = initialData?.id
        ? await updateUser(initialData.id, data, data.roleId)
        : await createUser(data, data.roleId);

      if (result.success) {
        toast.success(`Berhasil ${initialData?.id ? 'mengubah' : 'menambah'} pengguna`);
        onOpenChange(false);
      } else {
        toast.error(result.error || 'Terjadi kesalahan');
      }
    } catch (error) {
      toast.error('Terjadi kesalahan sistem');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initialData ? 'Edit' : 'Tambah'} Pengguna</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="nama">Nama Lengkap <span className="text-red-500">*</span></Label>
            <Input id="nama" {...form.register('nama')} placeholder="Masukkan nama lengkap" />
            {form.formState.errors.nama && (
              <p className="text-sm text-red-500">{form.formState.errors.nama.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">Username <span className="text-red-500">*</span></Label>
            <Input id="username" {...form.register('username')} placeholder="Masukkan username" />
            {form.formState.errors.username && (
              <p className="text-sm text-red-500">{form.formState.errors.username.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
            <Input id="email" type="email" {...form.register('email')} placeholder="Masukkan email" />
            {form.formState.errors.email && (
              <p className="text-sm text-red-500">{form.formState.errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">
              Password {initialData ? '(Kosongkan jika tidak diubah)' : <span className="text-red-500">*</span>}
            </Label>
            <Input id="password" type="password" {...form.register('password')} placeholder="Masukkan password" />
          </div>

          <div className="space-y-2">
            <Label>Role <span className="text-red-500">*</span></Label>
            <Select 
              value={form.watch('roleId')} 
              onValueChange={(val) => form.setValue('roleId', val, { shouldValidate: true })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih Role" />
              </SelectTrigger>
              <SelectContent>
                {roles.map(r => (
                  <SelectItem key={r.id} value={r.id}>{r.namaRole}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.roleId && (
              <p className="text-sm text-red-500">{form.formState.errors.roleId.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Tautkan ke Pegawai (Opsional)</Label>
            <Select 
              value={form.watch('pegawaiId') || 'none'} 
              onValueChange={(val) => form.setValue('pegawaiId', val === 'none' ? null : val)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih Pegawai" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">-- Tidak Ditautkan --</SelectItem>
                {pegawaiList.map(p => (
                  <SelectItem key={p.id} value={p.id}>{p.nama}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Status</Label>
            <Select 
              value={form.watch('status')} 
              onValueChange={(val: any) => form.setValue('status', val)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Aktif">Aktif</SelectItem>
                <SelectItem value="Nonaktif">Nonaktif</SelectItem>
                <SelectItem value="Locked">Locked</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
