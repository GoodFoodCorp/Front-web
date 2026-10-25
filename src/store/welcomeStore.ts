import { create } from 'zustand';

type Phase = 'idle' | 'in' | 'out';

interface WelcomeState {
  phase: Phase;
  /** Covers the screen, runs `go` (the navigation) underneath, then fades away. */
  play: (go: () => void) => void;
}

// Timings (ms): the overlay is fully opaque before the page changes underneath,
// and fades out only after the destination has had time to render.
const BEFORE_NAVIGATE = 1000;
const HOLD_AFTER_NAVIGATE = 350;
const FADE_OUT = 550;

/**
 * Lives outside the login page on purpose: the page unmounts as soon as we
 * navigate, and the welcome screen must survive that to avoid a hard cut.
 */
export const useWelcomeStore = create<WelcomeState>((set, get) => ({
  phase: 'idle',
  play: (go) => {
    if (get().phase !== 'idle') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      go();
      return;
    }
    set({ phase: 'in' });
    window.setTimeout(() => {
      go();
      window.setTimeout(() => {
        set({ phase: 'out' });
        window.setTimeout(() => set({ phase: 'idle' }), FADE_OUT);
      }, HOLD_AFTER_NAVIGATE);
    }, BEFORE_NAVIGATE);
  },
}));
