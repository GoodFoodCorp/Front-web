import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import logo from '../../../assets/logo.svg';

/** Centered card shared by the account pages reached from an email link
 *  (password reset, email confirmation) or from the login page. */
export function AuthCard({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <div className="grid min-h-screen place-items-center bg-cream px-4 py-10">
      <div className="w-full max-w-sm">
        <Link to="/login" className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-brand hover:underline">
          <ArrowLeft size={16} /> Retour à la connexion
        </Link>
        <div className="rounded-2xl border border-brand/10 bg-white p-6 shadow-sm">
          <img src={logo} alt="Good Food" className="h-12 w-12" />
          <h1 className="mt-4 font-display text-2xl font-bold text-brand">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-neutral-500">{subtitle}</p>}
          <div className="mt-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
