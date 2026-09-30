import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { Spinner } from '../components/Spinner';
import { useHydrateSession } from '../features/auth/hooks/useAuth';
import { decodeJwt } from '../store/authStore';
import logo from '../assets/logo.svg';

/**
 * Landing page of the OAuth round-trip. auth-service redirects here with the
 * tokens in the URL **fragment** — a fragment never reaches a server, so the
 * tokens stay out of access logs and out of the Referer header.
 */
export function OAuthCallbackPage() {
  const navigate = useNavigate();
  const hydrate = useHydrateSession();
  const [error, setError] = useState<string | null>(null);
  // StrictMode mounts effects twice in dev; the fragment is consumed once.
  const consumed = useRef(false);

  useEffect(() => {
    if (consumed.current) return;
    consumed.current = true;

    const params = new URLSearchParams(window.location.hash.replace(/^#/, ''));
    // Drop the tokens from the address bar as soon as they are read.
    window.history.replaceState(null, '', window.location.pathname);

    const failure = params.get('error');
    if (failure) {
      setError(failure);
      return;
    }

    const accessToken = params.get('access_token');
    const refreshToken = params.get('refresh_token');
    if (!accessToken || !refreshToken) {
      setError('jetons_manquants');
      return;
    }

    hydrate({ access_token: accessToken, refresh_token: refreshToken });

    const roles = (decodeJwt(accessToken).role_slugs as string[]) ?? [];
    if (roles.includes('manager')) navigate('/portal', { replace: true });
    else if (roles.includes('admin')) navigate('/admin', { replace: true });
    else navigate('/', { replace: true });
  }, [hydrate, navigate]);

  if (error) {
    return (
      <div className="grid min-h-screen place-items-center bg-cream px-4">
        <div className="w-full max-w-sm text-center">
          <img src={logo} alt="Good Food" className="mx-auto h-14 w-14" />
          <h1 className="mt-4 font-display text-2xl font-bold text-brand">Connexion impossible</h1>
          <p className="mt-2 text-sm text-neutral-500">{errorMessage(error)}</p>
          <Button className="mt-6 w-full" onClick={() => navigate('/login', { replace: true })}>
            Revenir à la connexion
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid min-h-screen place-items-center bg-cream">
      <Spinner label="Connexion en cours…" />
    </div>
  );
}

function errorMessage(code: string): string {
  switch (code) {
    case 'state_invalide':
      return 'La demande a expiré ou ne vient pas de cet appareil. Réessayez depuis la page de connexion.';
    case 'code_manquant':
    case 'echange_impossible':
      return "Le fournisseur n'a pas confirmé votre identité. Réessayez.";
    case 'jetons_manquants':
      return 'Réponse incomplète du serveur.';
    case 'access_denied':
      return 'Vous avez refusé le partage de vos informations.';
    default:
      return code;
  }
}
