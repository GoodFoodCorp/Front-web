import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { OAuthButtons } from '../features/auth/components/OAuthButtons';
import { useRegister } from '../features/auth/hooks/useAuth';
import { useWelcomeStore } from '../store/welcomeStore';
import logo from '../assets/logo.svg';
import { AuthCard } from '../features/auth/components/AuthCard';
import { isWeakPassword, PASSWORD_RULE } from '../utils/password';

/** Client sign-up. On success the user is logged in and sent to the storefront. */
export function RegisterPage() {
  const navigate = useNavigate();
  const register = useRegister();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [accepted, setAccepted] = useState(false);
  const [confirm, setConfirm] = useState('');
  const welcome = useWelcomeStore((s) => s.phase !== 'idle');
  const playWelcome = useWelcomeStore((s) => s.play);

  const mismatch = confirm.length > 0 && password !== confirm;
  const weakPassword = password.length > 0 && isWeakPassword(password);
  const [sentTo, setSentTo] = useState<string | null>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mismatch || weakPassword || !accepted) return;
    register.mutate(
      { email, password },
      {
        onSuccess: (result) =>
          result.verificationRequired ? setSentTo(email) : playWelcome(() => navigate('/', { replace: true })),
      },
    );
  };

  if (sentTo) {
    return (
      <AuthCard title="Confirmez votre email">
        <p className="text-sm text-neutral-600">
          Votre compte est créé. Un lien de confirmation vient d’être envoyé à <strong>{sentTo}</strong> : ouvrez-le pour
          activer votre compte, puis connectez-vous.
        </p>
      </AuthCard>
    );
  }

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
            Rejoignez
            <br />
            <span className="text-accent">Good Food.</span>
          </h1>
          <p className="enter mt-4 max-w-md text-white/70" style={{ '--d': '320ms' } as React.CSSProperties}>
            Créez votre compte client en quelques secondes et commandez vos plats préférés.
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

          <h2 className="enter font-display text-3xl font-bold text-brand" style={{ '--d': '220ms' } as React.CSSProperties}>Créer un compte</h2>
          <p className="enter mt-1 text-sm text-neutral-500" style={{ '--d': '280ms' } as React.CSSProperties}>Rejoignez Good Food en tant que client</p>

          <form onSubmit={submit} className="mt-8 space-y-4">
            <div className="enter" style={{ '--d': '340ms' } as React.CSSProperties}>
              <label htmlFor="register-email" className="mb-1.5 block text-sm font-semibold text-neutral-700">
                Email
              </label>
              <Input
                id="register-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vous@example.com"
              />
            </div>
            <div className="enter" style={{ '--d': '420ms' } as React.CSSProperties}>
              <label htmlFor="register-password" className="mb-1.5 block text-sm font-semibold text-neutral-700">
                Mot de passe
              </label>
              <Input
                id="register-password"
                aria-describedby="register-password-rule"
                type="password"
                required
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="8 caractères minimum"
              />
              <p
                id="register-password-rule"
                className={`mt-1 text-xs ${weakPassword ? 'text-red-600' : 'text-neutral-400'}`}
              >
                {PASSWORD_RULE}
              </p>
            </div>
            <div className="enter" style={{ '--d': '500ms' } as React.CSSProperties}>
              <label htmlFor="register-confirm" className="mb-1.5 block text-sm font-semibold text-neutral-700">
                Confirmer le mot de passe
              </label>
              <Input
                id="register-confirm"
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

            <label className="enter flex items-start gap-2.5 text-sm text-neutral-600" style={{ '--d': '540ms' } as React.CSSProperties}>
              <input
                type="checkbox"
                required
                checked={accepted}
                onChange={(e) => setAccepted(e.target.checked)}
                className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--color-brand)]"
              />
              <span>
                J’accepte les{' '}
                <Link to="/terms" target="_blank" className="font-semibold text-brand underline">
                  conditions générales
                </Link>{' '}
                et j’ai lu la{' '}
                <Link to="/privacy" target="_blank" className="font-semibold text-brand underline">
                  politique de confidentialité
                </Link>
                .
              </span>
            </label>

            {register.isError && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
                {(register.error as Error).message}
              </p>
            )}

            <Button
              type="submit"
              className="enter w-full"
              style={{ '--d': '580ms' } as React.CSSProperties}
              disabled={register.isPending || welcome || mismatch || weakPassword || !accepted}
            >
              {register.isPending || welcome ? (
                <>
                  <span className="h-4 w-4 animate-[spin-slow_0.8s_linear_infinite] rounded-full border-2 border-white/40 border-t-white" />
                  Création…
                </>
              ) : (
                'Créer mon compte'
              )}
            </Button>
          </form>

          <div className="enter" style={{ '--d': '650ms' } as React.CSSProperties}>
            <OAuthButtons label="Ou s'inscrire avec" />
          </div>

          <p className="enter mt-6 text-center text-sm text-neutral-500" style={{ '--d': '720ms' } as React.CSSProperties}>
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
