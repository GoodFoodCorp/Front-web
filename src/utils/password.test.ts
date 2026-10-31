import { describe, expect, it } from 'vitest';
import { isWeakPassword } from './password';

describe('isWeakPassword', () => {
  it('mirrors auth-service: 8+ characters, three kinds out of four', () => {
    expect(isWeakPassword('Abcdefg1')).toBe(false);
    expect(isWeakPassword('abcdefg1!')).toBe(false);
    expect(isWeakPassword('Électrique-été')).toBe(false);
    expect(isWeakPassword('Abcdef1')).toBe(true);
    expect(isWeakPassword('abcdefgh')).toBe(true);
    expect(isWeakPassword('abcdefg1')).toBe(true);
    expect(isWeakPassword('12345678')).toBe(true);
  });

  it('refuses what bcrypt would cut (72 bytes)', () => {
    expect(isWeakPassword('Aa1'.repeat(25))).toBe(true);
  });
});
