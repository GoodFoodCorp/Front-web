import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { AuthCard } from '../features/auth/components/AuthCard';
import { authApi } from '../features/auth/api/authApi';
import { isWeakPassword, PASSWORD_RULE } from '../utils/password';

/** Landing page of the password reset email (/reset-password?token=…). */
export function ResetPasswordPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get('token') ?? '';
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const reset = useMutation({ mutationFn: (newPassword: string) => authApi.resetPassword(token, newPassword) });

  const weak = password.length > 0 && isWeakPassword(password);
  const mismatch = confirm.length > 0 && password !== confirm;

  if (!token) {
    return (
      <AuthCard title="Lien incomplet">
        <p className="text-sm text-neutral-600">Ce lien ne contient pas de jeton. Ouvrez le lien reçu par email ou demandez-en un nouveau.</p>
        <Link to="/forgot-password" className="mt-6 block text-center text-sm font-semibold text-brand hover:underline">
          Demander un nouveau lien
        </Link>
      </AuthCard>
    );
  }

  if (reset.isSuccess) {
    return (
      <AuthCard title="Mot de passe modifié">
        <p className="text-sm text-neutral-600">Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.</p>
        <Button className="mt-6 w-full" onClick={() => navigate('/login')}>Se connecter</Button>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Nouveau mot de passe" subtitle="Choisissez le mot de passe de votre compte.">
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (!weak && !mismatch) reset.mutate(password);
        }}
      >
        <div>
          <label htmlFor="reset-password" className="mb-1.5 block text-sm font-semibold text-neutral-700">
            Nouveau mot de passe
          </label>
          <Input
            id="reset-password"
            type="password"
            required
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {weak && <p className="mt-1 text-xs text-red-600">{PASSWORD_RULE}</p>}
        </div>
        <div>
          <label htmlFor="reset-confirm" className="mb-1.5 block text-sm font-semibold text-neutral-700">
            Confirmer le mot de passe
          </label>
          <Input
            id="reset-confirm"
            type="password"
            required
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
          {mismatch && <p className="mt-1 text-xs text-red-600">Les mots de passe ne correspondent pas.</p>}
        </div>
        {reset.isError && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
            {(reset.error as Error).message}.{' '}
            <Link to="/forgot-password" className="font-semibold underline">
              Demander un nouveau lien
            </Link>
          </p>
        )}
        <Button type="submit" className="w-full" disabled={reset.isPending || weak || mismatch}>
          {reset.isPending ? 'Enregistrement…' : 'Enregistrer'}
        </Button>
      </form>
    </AuthCard>
  );
}
