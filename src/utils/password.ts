/** Same rule as auth-service (CNIL recommendation): 8 to 72 characters
 *  mixing at least three of lower case, upper case, digits and symbols —
 *  checked before sending so the user sees it while typing. */
export function isWeakPassword(password: string): boolean {
  if (password.length < 8 || new TextEncoder().encode(password).length > 72) return true;
  const kinds = [/\p{Ll}/u, /\p{Lu}/u, /[0-9]/, /[^\p{L}0-9]/u].filter((re) => re.test(password)).length;
  return kinds < 3;
}

export const PASSWORD_RULE =
  'Au moins 8 caractères, avec trois types parmi : minuscules, majuscules, chiffres, symboles.';
