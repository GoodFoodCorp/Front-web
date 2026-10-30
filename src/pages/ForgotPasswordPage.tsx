import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { AuthCard } from '../features/auth/components/AuthCard';
import { authApi } from '../features/auth/api/authApi';

/** Asks for a reset link. The answer never tells whether the email has an
 *  account, so the page cannot be used to probe who is a customer. */
export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const request = useMutation({ mutationFn: (address: string) => authApi.forgotPassword(address) });

  if (request.isSuccess) {
    return (
      <AuthCard title="Vérifiez vos emails">
        <p className="text-sm text-neutral-600">
          Si un compte existe pour <strong>{email}</strong>, un lien pour choisir un nouveau mot de passe vient de lui
          être envoyé. Il est valable 15 minutes.
        </p>
        <Button variant="ghost" className="mt-6 w-full" onClick={() => request.reset()}>
          Renvoyer un lien
        </Button>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Mot de passe oublié" subtitle="Recevez un lien pour en choisir un nouveau.">
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          request.mutate(email.trim());
        }}
      >
        <div>
          <label htmlFor="forgot-email" className="mb-1.5 block text-sm font-semibold text-neutral-700">
            Email
          </label>
          <Input
            id="forgot-email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="vous@example.com"
          />
        </div>
        {request.isError && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{(request.error as Error).message}</p>
        )}
        <Button type="submit" className="w-full" disabled={request.isPending}>
          {request.isPending ? 'Envoi…' : 'Envoyer le lien'}
        </Button>
      </form>
    </AuthCard>
  );
}
