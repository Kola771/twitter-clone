'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/axios';
import { useAuthStore } from '@/store/authStore';
import { AuthResponse } from '@/types/auth';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

const schema = z.object({
  name: z.string().min(2, 'Nom requis (2 caractères min)'),
  username: z
    .string()
    .min(3, '3 caractères min')
    .max(20, '20 caractères max')
    .regex(/^[a-zA-Z0-9_]+$/, 'Lettres, chiffres et _ uniquement'),
  email: z.string().email('Email invalide'),
  password: z
    .string()
    .min(8, '8 caractères minimum')
    .regex(/[A-Z]/, 'Au moins une majuscule')
    .regex(/[0-9]/, 'Au moins un chiffre'),
});

type FormData = z.infer<typeof schema>;

export default function RegisterForm() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  async function onSubmit(data: FormData) {
    try {
      const res = await api.post<AuthResponse>('/auth/register', data);
      const { user, accessToken, refreshToken } = res.data;

      login(user, accessToken, refreshToken);
      document.cookie = `access_token=${accessToken}; path=/; max-age=900; SameSite=Strict`;

      router.push('/home');
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "Erreur lors de l'inscription";
      setError('root', { message: Array.isArray(msg) ? msg[0] : msg });
    }
  }

  return (
    <div className="w-full max-w-sm">
      <h1 className="text-2xl font-bold mb-2">Créer un compte</h1>
      <p className="text-slate-400 text-sm mb-8">Rejoins Twitter Clone dès maintenant</p>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Input
          {...register('name')}
          id="name"
          label="Nom complet"
          placeholder="Koladé Aboudou"
          error={errors.name?.message}
          autoComplete="name"
        />
        <Input
          {...register('username')}
          id="username"
          label="Nom d'utilisateur"
          placeholder="kola_dev"
          error={errors.username?.message}
          autoComplete="username"
        />
        <Input
          {...register('email')}
          id="email"
          type="email"
          label="Email"
          placeholder="tu@exemple.com"
          error={errors.email?.message}
          autoComplete="email"
        />
        <Input
          {...register('password')}
          id="password"
          type="password"
          label="Mot de passe"
          placeholder="••••••••"
          error={errors.password?.message}
          autoComplete="new-password"
        />

        {errors.root && (
          <p className="text-sm text-red-400 text-center">{errors.root.message}</p>
        )}

        <Button type="submit" loading={isSubmitting} className="mt-2 w-full">
          Créer le compte
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-400">
        Déjà un compte ?{' '}
        <Link href="/login" className="text-sky-400 hover:underline font-medium">
          Se connecter
        </Link>
      </p>
    </div>
  );
}
