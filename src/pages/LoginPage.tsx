import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { OAuthButtons } from '../features/auth/components/OAuthButtons';
import { useLogin } from '../features/auth/hooks/useAuth';
import { decodeJwt } from '../store/authStore';
import { useWelcomeStore } from '../store/welcomeStore';
import logo from '../assets/logo.svg';

// Seeded local accounts, never shown in a production build (they include the
// head-office admin). VITE_SHOW_DEMO_ACCOUNTS=true shows them on a demo server.
const SHOW_DEMO_ACCOUNTS = import.meta.env.DEV || import.meta.env.VITE_SHOW_DEMO_ACCOUNTS === 'true';

const DEMO_ACCOUNTS = [
  { label: 'Client', email: 'user@example.com', password: 'User1234!' },
  { label: 'Franchisé République', email: 'manager@example.com', password: 'Manager123!' },
  { label: 'Franchisé Montparnasse', email: 'manager2@example.com', password: 'Manager123!' },
  { label: 'Siège', email: 'admin@example.com', password: 'Admin123!' },
  { label: 'Livreur', email: 'livreur@example.com', password: 'Livreur123!' },
];

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const login = useLogin();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const welcome = useWelcomeStore((s) => s.phase !== 'idle');
  const playWelcome = useWelcomeStore((s) => s.play);

  const from = (location.state as { from?: string } | null)?.from;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    login.mutate(
      { email, password },
      {
        onSuccess: (data) => {
          const roles = (decodeJwt(data.access_token).role_slugs as string[]) ?? [];
          const target =
            from ??
            (roles.includes('manager')
              ? '/portal'
              : roles.includes('admin')
                ? '/admin'
                : roles.includes('livreur')
                  ? '/courier'
                  : '/');
          // A welcome screen covers the page change, so nothing pops.
          playWelcome(() => navigate(target, { replace: true }));
        },
      },
    );
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Brand panel */}
      <div className="relative hidden flex-col justify-between bg-brand p-12 text-white lg:flex">
        <div className="enter-left flex items-center gap-3">
          <img src={logo} alt="Good Food" className="h-14 w-14" />
          <span className="font-display text-2xl font-extrabold">Good Food</span>
        </div>
        <div>
          <h1 className="enter font-display text-5xl font-extrabold leading-tight" style={{ '--d': '150ms' } as React.CSSProperties}>
            Les repas de qualité,
            <br />
            <span className="text-accent">à côté de chez vous.</span>
          </h1>
          <p className="enter mt-4 max-w-md text-white/70" style={{ '--d': '320ms' } as React.CSSProperties}>
            Commandez en ligne depuis votre restaurant Good Food préféré, ou gérez votre franchise
            depuis le portail dédié.
          </p>
        </div>
        <p className="enter text-sm text-white/40" style={{ '--d': '500ms' } as React.CSSProperties}>© {new Date().getFullYear()} Good Food 3.0</p>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center bg-cream p-6">
        <div className="w-full max-w-sm">
          <Link
            to="/"
            style={{ '--d': '100ms' } as React.CSSProperties}
            className="enter mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-brand transition hover:underline"
          >
            <ArrowLeft size={16} /> Retour au site
          </Link>

          <div className="enter mb-8 flex items-center gap-2 lg:hidden" style={{ '--d': '160ms' } as React.CSSProperties}>
            <img src={logo} alt="Good Food" className="h-11 w-11" />
            <span className="font-display text-xl font-extrabold text-brand">Good Food</span>
          </div>

          <h2 className="enter font-display text-3xl font-bold text-brand" style={{ '--d': '220ms' } as React.CSSProperties}>Bienvenue 👋</h2>
          <p className="enter mt-1 text-sm text-neutral-500" style={{ '--d': '280ms' } as React.CSSProperties}>Connectez-vous pour continuer</p>

          <form onSubmit={submit} className="mt-8 space-y-4">
            <div className="enter" style={{ '--d': '340ms' } as React.CSSProperties}>
              <label htmlFor="login-email" className="mb-1.5 block text-sm font-semibold text-neutral-700">
                Email
              </label>
              <Input
                id="login-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vous@example.com"
              />
            </div>
            <div className="enter" style={{ '--d': '420ms' } as React.CSSProperties}>
              <label htmlFor="login-password" className="mb-1.5 block text-sm font-semibold text-neutral-700">
                Mot de passe
              </label>
              <Input
                id="login-password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            <div className="enter -mt-2 text-right" style={{ '--d': '460ms' } as React.CSSProperties}>
              <Link to="/forgot-password" className="text-xs font-semibold text-brand hover:underline">
                Mot de passe oublié ?
              </Link>
            </div>

            {login.isError && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
                {(login.error as Error).message}
              </p>
            )}

            <Button
              type="submit"
              className="enter w-full"
              style={{ '--d': '500ms' } as React.CSSProperties}
              disabled={login.isPending || welcome}
            >
              {login.isPending || welcome ? (
                <>
                  <span className="h-4 w-4 animate-[spin-slow_0.8s_linear_infinite] rounded-full border-2 border-white/40 border-t-white" />
                  Connexion…
                </>
              ) : (
                'Se connecter'
              )}
            </Button>
          </form>

          <div className="enter" style={{ '--d': '580ms' } as React.CSSProperties}>
            <OAuthButtons />
          </div>

          <p className="enter mt-6 text-center text-sm text-neutral-500" style={{ '--d': '640ms' } as React.CSSProperties}>
            Pas encore de compte ?{' '}
            <Link to="/register" className="font-semibold text-brand hover:underline">
              Créer un compte client
            </Link>
          </p>

          {SHOW_DEMO_ACCOUNTS && (
          <div className="enter mt-8 rounded-xl border border-brand/10 bg-white p-4" style={{ '--d': '720ms' } as React.CSSProperties}>
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
          )}
        </div>
      </div>
    </div>
  );
}
