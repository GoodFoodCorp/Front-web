import { useWelcomeStore } from '../../store/welcomeStore';
import logo from '../../assets/logo.svg';

/** Full-screen "Bienvenue" transition shown between signing in and the first page. */
export function WelcomeOverlay() {
  const phase = useWelcomeStore((s) => s.phase);
  if (phase === 'idle') return null;

  return (
    <div
      role="status"
      aria-live="polite"
      data-phase={phase}
      className="welcome-overlay fixed inset-0 z-[100] flex flex-col items-center justify-center gap-5 bg-brand text-white data-[phase=out]:pointer-events-none"
    >
      <img src={logo} alt="" className="welcome-logo h-24 w-24" />
      <p className="welcome-text font-display text-2xl font-extrabold">
        Bienvenue chez <span className="text-accent">Good Food</span>
      </p>
    </div>
  );
}
