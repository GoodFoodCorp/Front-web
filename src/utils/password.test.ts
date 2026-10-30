import { describe, expect, it } from 'vitest';
import { isWeakPassword } from './password';

describe('isWeakPassword', () => {
  it('mirrors auth-service: 8+ characters with a letter and a digit', () => {
    expect(isWeakPassword('Abcdefg1')).toBe(false);
    expect(isWeakPassword('Abcdef1')).toBe(true);
    expect(isWeakPassword('abcdefgh')).toBe(true);
    expect(isWeakPassword('12345678')).toBe(true);
  });
});
