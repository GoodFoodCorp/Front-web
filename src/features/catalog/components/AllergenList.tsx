import { allergenIcon, allergenLabel } from '../allergens';

/** What a customer reads on a dish before ordering: its allergens, or that it has none of the 14. */
export function AllergenList({ allergens, className = '' }: { allergens: string[]; className?: string }) {
  if (allergens.length === 0) {
    return <p className={`text-xs text-neutral-400 ${className}`}>Aucun des 14 allergènes majeurs déclaré</p>;
  }
  return (
    <p className={`text-xs text-neutral-500 ${className}`}>
      <span className="font-semibold text-neutral-600">Allergènes : </span>
      {allergens.map((a, i) => (
        <span key={a} className="whitespace-nowrap">
          <span aria-hidden>{allergenIcon(a)}</span> {allergenLabel(a)}
          {i < allergens.length - 1 ? ', ' : ''}
        </span>
      ))}
    </p>
  );
}
