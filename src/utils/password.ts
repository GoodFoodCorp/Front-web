/** Same rule as auth-service (8+ characters, at least one letter and one
 *  digit), checked before sending so the user sees it while typing. */
export function isWeakPassword(password: string): boolean {
  return password.length < 8 || !/[0-9]/.test(password) || !/[a-zA-Z]/.test(password);
}

export const PASSWORD_RULE = 'Le mot de passe doit faire 8+ caractères, avec au moins une lettre et un chiffre.';
