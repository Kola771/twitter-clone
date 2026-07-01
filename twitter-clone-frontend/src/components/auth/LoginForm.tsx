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
  email: z.string().email('Email invalide'),
  password: z.string().min(1, 'Mot de passe requis'),
});

type FormData = z.infer<typeof schema>;

export default function LoginForm() {
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
      const res = await api.post<AuthResponse>('/auth/login', data);
      const { user, accessToken, refreshToken } = res.data;

      login(user, accessToken, refreshToken);

      // Set cookie for proxy route protection
      document.cookie = `access_token=${accessToken}; path=/; max-age=900; SameSite=Strict`;

      router.push('/home');
    } catch {
      setError('root', { message: 'Email ou mot de passe incorrect' });
    }
  }

  return (
    <div className="w-full max-w-sm">
      <h1 className="text-2xl font-bold mb-2">Connexion</h1>
      <p className="text-slate-400 text-sm mb-8">Bon retour sur Twitter Clone</p>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
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
          autoComplete="current-password"
        />

        {errors.root && (
          <p className="text-sm text-red-400 text-center">{errors.root.message}</p>
        )}

        <Button type="submit" loading={isSubmitting} className="mt-2 w-full">
          Se connecter
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-400">
        Pas encore de compte ?{' '}
        <Link href="/register" className="text-sky-400 hover:underline font-medium">
          S&apos;inscrire
        </Link>
      </p>
    </div>
  );
}
