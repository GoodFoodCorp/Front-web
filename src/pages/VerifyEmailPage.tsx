import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Button } from '../components/Button';
import { Spinner } from '../components/Spinner';
import { AuthCard } from '../features/auth/components/AuthCard';
import { authApi } from '../features/auth/api/authApi';

/** Landing page of the confirmation email (/verify-email?token=…). */
export function VerifyEmailPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get('token') ?? '';
  const verify = useMutation({ mutationFn: (value: string) => authApi.verifyEmail(value) });
  // StrictMode runs effects twice in dev; a token is single use.
  const sent = useRef(false);

  useEffect(() => {
    if (!token || sent.current) return;
    sent.current = true;
    verify.mutate(token);
  }, [token, verify]);

  if (!token || verify.isError) {
    return (
      <AuthCard title="Lien invalide">
        <p className="text-sm text-neutral-600">
          {verify.isError ? (verify.error as Error).message : 'Ce lien ne contient pas de jeton.'} Le lien a peut-être
          déjà servi ou expiré (24 heures) : essayez de vous connecter.
        </p>
        <Button className="mt-6 w-full" onClick={() => navigate('/login')}>Aller à la connexion</Button>
      </AuthCard>
    );
  }

  if (verify.isSuccess) {
    return (
      <AuthCard title="Email confirmé">
        <p className="text-sm text-neutral-600">Votre compte est activé. Vous pouvez vous connecter.</p>
        <Button className="mt-6 w-full" onClick={() => navigate('/login')}>Se connecter</Button>
      </AuthCard>
    );
  }

  return (
    <div className="grid min-h-screen place-items-center bg-cream">
      <Spinner label="Confirmation de votre email…" />
    </div>
  );
}
