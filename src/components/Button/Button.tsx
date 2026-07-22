import type { ButtonHTMLAttributes } from 'react';

type ButtonVariant = 'primary' | 'accent' | 'ghost' | 'danger';

const BUTTON_STYLES: Record<ButtonVariant, string> = {
  primary: 'bg-brand text-white hover:bg-brand-dark shadow-[var(--shadow-lift)]',
  accent: 'bg-accent text-brand-dark hover:bg-accent-dark font-bold',
  ghost: 'bg-transparent text-brand hover:bg-brand-pale border border-brand/20',
  danger: 'bg-red-600 text-white hover:bg-red-700',
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

/** Pure UI button — props in, JSX out. */
export function Button({ variant = 'primary', className = '', ...props }: ButtonProps) {
  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold font-display transition-all duration-200 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 ${BUTTON_STYLES[variant]} ${className}`}
    />
  );
}
