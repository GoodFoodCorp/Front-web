import { describe, expect, it } from 'vitest';
import { frenchError } from './errorMessages';

describe('frenchError', () => {
  it('translates the refusals people meet', () => {
    expect(frenchError('order is not awaiting payment (status PLACED)', 409)).toContain('plus en attente de paiement');
    expect(frenchError('only head office can manage categories', 403)).toContain('siège');
    expect(frenchError('item quantity must be greater than zero', 400)).toBe('La quantité doit être au moins de 1.');
    expect(frenchError('at most 50 of one dish per order', 400)).toContain('50');
    expect(frenchError('no service at 15:30: choose a lunch or dinner slot', 400)).toContain('15:30');
    expect(frenchError("A restaurant with slug 'good-food-rouen' already exists.", 409)).toContain('good-food-rouen');
  });

  it('keeps messages already written in French', () => {
    expect(frenchError('IBAN invalide', 400)).toBe('IBAN invalide');
    expect(frenchError('Stock insuffisant pour « Burger » : Steak', 409)).toContain('Stock insuffisant');
    expect(frenchError('identifiants incorrects', 401)).toBe('identifiants incorrects');
  });

  it('never shows an unknown English message', () => {
    expect(frenchError('something unexpected happened in the pipeline is broken', 400)).toContain('Vérifiez votre saisie');
    expect(frenchError('', 503)).toContain('indisponible');
    expect(frenchError('db down', 500)).toContain('indisponible');
  });
});
