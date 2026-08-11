import logo from '../../assets/logo.svg';

const COLUMNS = [
  {
    title: 'Entreprise',
    links: ['À propos', 'Carrières', 'Contact'],
  },
  {
    title: 'Support',
    links: ["Centre d'aide", "Conditions d'utilisation", 'Politique de confidentialité'],
  },
  {
    title: 'Franchise',
    links: ['Devenir franchisé', 'Connexion franchise'],
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
                <li key={link}>
                  <a href="#" className="text-sm text-white/60 transition hover:text-white">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </footer>
  );
}
