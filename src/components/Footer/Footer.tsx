import { Link } from 'react-router-dom';
import logo from '../../assets/logo.svg';

const COLUMNS = [
  {
    title: 'Entreprise',
    links: [
      { label: 'À propos', to: '/about' },
      { label: 'Carrières', to: '/careers' },
      { label: 'Contact', to: '/contact' },
    ],
  },
  {
    title: 'Support',
    links: [
      { label: "Centre d'aide", to: '/help' },
      { label: "Conditions d'utilisation", to: '/terms' },
      { label: 'Politique de confidentialité', to: '/privacy' },
    ],
  },
  {
    title: 'Franchise',
    links: [
      { label: 'Devenir franchisé', to: '/become-franchisee' },
      { label: 'Connexion franchise', to: '/franchise-login' },
    ],
  },
];

export function Footer() {
  return (
    <footer className="mt-auto bg-brand text-white">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-2">
            <img src={logo} alt="Good Food" className="h-10 w-10" />
            <span className="font-display text-lg font-extrabold">Good Food</span>
          </div>
          <p className="mt-3 max-w-[220px] text-sm text-white/60">
            Les repas de qualité, à coté de chez vous !
          </p>
        </div>
        {COLUMNS.map((col) => (
          <div key={col.title}>
            <h3 className="font-display text-sm font-bold">{col.title}</h3>
            <ul className="mt-3 space-y-2">
              {col.links.map((link) => (
                <li key={link.label}>
                  <Link to={link.to} className="text-sm text-white/60 transition hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </footer>
  );
}
