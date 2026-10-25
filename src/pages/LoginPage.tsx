import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { OAuthButtons } from '../features/auth/components/OAuthButtons';
import { useLogin } from '../features/auth/hooks/useAuth';
import { decodeJwt } from '../store/authStore';
import logo from '../assets/logo.svg';

const DEMO_ACCOUNTS = [
  { label: 'Client', email: 'user@example.com', password: 'User1234!' },
  { label: 'Franchisé', email: 'manager@example.com', password: 'Manager123!' },
  { label: 'Siège', email: 'admin@example.com', password: 'Admin123!' },
  { label: 'Livreur', email: 'livreur@example.com', password: 'Livreur123!' },
];

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const login = useLogin();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const from = (location.state as { from?: string } | null)?.from;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    login.mutate(
      { email, password },
      {
        onSuccess: (data) => {
          const roles = (decodeJwt(data.access_token).role_slugs as string[]) ?? [];
          if (from) navigate(from, { replace: true });
          else if (roles.includes('manager')) navigate('/portal', { replace: true });
          else if (roles.includes('admin')) navigate('/admin', { replace: true });
          else if (roles.includes('livreur')) navigate('/courier', { replace: true });
          else navigate('/', { replace: true });
        },
      },
    );
  };

  return (
    <div className="min-h-screen">
      {/* Form panel */}
      <div className="flex min-h-screen items-center justify-center bg-cream p-6">
        <div className="w-full max-w-sm animate-[rise_0.5s]">
          <Link
            to="/"
            className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-brand transition hover:underline"
          >
            <ArrowLeft size={16} /> Retour au site
          </Link>

          <div className="mb-8 flex items-center gap-2">
            <img src={logo} alt="Good Food" className="h-11 w-11" />
            <span className="font-display text-xl font-extrabold text-brand">Good Food</span>
          </div>

          <h2 className="font-display text-3xl font-bold text-brand">Bienvenue 👋</h2>
          <p className="mt-1 text-sm text-neutral-500">Connectez-vous pour continuer</p>

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
              <label className="mb-1.5 block text-sm font-semibold text-neutral-700">
                Mot de passe
              </label>
              <Input
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            {login.isError && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
                {(login.error as Error).message}
              </p>
            )}

            <Button type="submit" className="w-full" disabled={login.isPending}>
              {login.isPending ? 'Connexion…' : 'Se connecter'}
            </Button>
          </form>

          <OAuthButtons />

          <p className="mt-6 text-center text-sm text-neutral-500">
            Pas encore de compte ?{' '}
            <Link to="/register" className="font-semibold text-brand hover:underline">
              Créer un compte client
            </Link>
          </p>

          <div className="mt-8 rounded-xl border border-brand/10 bg-white p-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-400">
              Comptes de démonstration
            </p>
            <div className="flex flex-wrap gap-2">
              {DEMO_ACCOUNTS.map((a) => (
                <button
                  key={a.email}
                  onClick={() => {
                    setEmail(a.email);
                    setPassword(a.password);
                  }}
                  className="rounded-lg bg-brand-pale px-3 py-1.5 text-xs font-semibold text-brand transition hover:bg-brand hover:text-white"
                >
                  {a.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
