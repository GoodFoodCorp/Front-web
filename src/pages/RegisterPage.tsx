import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { useRegister } from '../features/auth/hooks/useAuth';

/** Client sign-up. On success the user is logged in and sent to the storefront. */
export function RegisterPage() {
  const navigate = useNavigate();
  const register = useRegister();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');

  const mismatch = confirm.length > 0 && password !== confirm;
  const weakPassword = password.length > 0 && (password.length < 8 || !/[0-9]/.test(password) || !/[a-zA-Z]/.test(password));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mismatch || weakPassword) return;
    register.mutate({ email, password }, { onSuccess: () => navigate('/', { replace: true }) });
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Brand panel */}
      <div className="brand-texture relative hidden flex-col justify-between bg-brand p-12 text-white lg:flex">
        <div className="flex items-center gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-full bg-accent text-2xl">🍔</span>
          <span className="font-display text-2xl font-extrabold">Good Food</span>
        </div>
        <div>
          <h1 className="font-display text-5xl font-extrabold leading-tight">
            Rejoignez
            <br />
            <span className="text-accent">Good Food.</span>
          </h1>
          <p className="mt-4 max-w-md text-white/70">
            Créez votre compte client en quelques secondes et commandez vos plats préférés.
          </p>
        </div>
        <p className="text-sm text-white/40">© {new Date().getFullYear()} Good Food 3.0</p>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center bg-cream p-6">
        <div className="w-full max-w-sm animate-[rise_0.5s]">
          <div className="mb-8 flex items-center gap-2 lg:hidden">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-brand text-lg">🍔</span>
            <span className="font-display text-xl font-extrabold text-brand">Good Food</span>
          </div>

          <h2 className="font-display text-3xl font-bold text-brand">Créer un compte</h2>
          <p className="mt-1 text-sm text-neutral-500">Rejoignez Good Food en tant que client</p>

          <form onSubmit={submit} className="mt-8 space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-neutral-700">Email</label>
              <Input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vous@example.com"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-neutral-700">Mot de passe</label>
              <Input
                type="password"
                required
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Au moins 8 caractères, lettres + chiffres"
              />
              {weakPassword && (
                <p className="mt-1 text-xs text-red-600">
                  Le mot de passe doit faire 8+ caractères, avec au moins une lettre et un chiffre.
                </p>
              )}
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-neutral-700">
                Confirmer le mot de passe
              </label>
              <Input
                type="password"
                required
                autoComplete="new-password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="••••••••"
              />
              {mismatch && (
                <p className="mt-1 text-xs text-red-600">Les mots de passe ne correspondent pas.</p>
              )}
            </div>

            {register.isError && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
                {(register.error as Error).message}
              </p>
            )}

            <Button type="submit" className="w-full" disabled={register.isPending || mismatch || weakPassword}>
              {register.isPending ? 'Création…' : 'Créer mon compte'}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-neutral-500">
            Déjà un compte ?{' '}
            <Link to="/login" className="font-semibold text-brand hover:underline">
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
