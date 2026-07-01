'use client';

import { useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { useAuthStore } from '@/store/authStore';
import { User } from '@/types/user';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

const schema = z.object({
  name: z.string().min(2, '2 caractères min').max(50, '50 caractères max'),
  bio: z.string().max(160, '160 caractères max').optional(),
  avatarUrl: z.string().url('URL invalide').optional().or(z.literal('')),
  bannerUrl: z.string().url('URL invalide').optional().or(z.literal('')),
});

type FormData = z.infer<typeof schema>;

interface EditProfileModalProps {
  user: User;
  onClose: () => void;
}

export default function EditProfileModal({ user, onClose }: EditProfileModalProps) {
  const backdropRef = useRef<HTMLDivElement>(null);
  const qc = useQueryClient();
  const setUser = useAuthStore((s) => s.setUser);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: user.name,
      bio: user.bio ?? '',
      avatarUrl: user.avatarUrl ?? '',
      bannerUrl: user.bannerUrl ?? '',
    },
  });

  // Fermer sur Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const mutation = useMutation({
    mutationFn: (data: FormData) => api.patch<User>('/users/me', data).then((r) => r.data),
    onSuccess: (updated) => {
      setUser(updated);
      qc.invalidateQueries({ queryKey: ['user', user.username] });
      onClose();
    },
  });

  function onSubmit(data: FormData) {
    // Nettoyer les champs vides
    const payload = {
      name: data.name,
      bio: data.bio || undefined,
      avatarUrl: data.avatarUrl || undefined,
      bannerUrl: data.bannerUrl || undefined,
    };
    mutation.mutate(payload as FormData);
  }

  return (
    <div
      ref={backdropRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
      onClick={(e) => { if (e.target === backdropRef.current) onClose(); }}
    >
      <div className="bg-slate-900 rounded-2xl w-full max-w-lg shadow-2xl border border-slate-700">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
          <div className="flex items-center gap-6">
            <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-800 transition-colors">
              <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h2 className="text-lg font-bold">Modifier le profil</h2>
          </div>
          <Button size="sm" loading={isSubmitting} onClick={handleSubmit(onSubmit)}>
            Enregistrer
          </Button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-4 flex flex-col gap-4">
          <Input
            {...register('name')}
            id="edit-name"
            label="Nom"
            placeholder="Ton nom affiché"
            error={errors.name?.message}
          />
          <div className="flex flex-col gap-1">
            <label htmlFor="edit-bio" className="text-sm text-slate-400">Bio</label>
            <textarea
              {...register('bio')}
              id="edit-bio"
              rows={3}
              placeholder="Parle-nous de toi (160 caractères max)"
              className="w-full rounded-lg bg-slate-800 border border-slate-700 px-4 py-3 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-sky-500 transition-colors resize-none"
            />
            {errors.bio && <p className="text-xs text-red-400">{errors.bio.message}</p>}
          </div>
          <Input
            {...register('avatarUrl')}
            id="edit-avatar"
            label="URL de l'avatar"
            placeholder="https://..."
            error={errors.avatarUrl?.message}
          />
          <Input
            {...register('bannerUrl')}
            id="edit-banner"
            label="URL du banner"
            placeholder="https://..."
            error={errors.bannerUrl?.message}
          />

          {mutation.isError && (
            <p className="text-sm text-red-400 text-center">Erreur lors de la sauvegarde.</p>
          )}
        </form>
      </div>
    </div>
  );
}
