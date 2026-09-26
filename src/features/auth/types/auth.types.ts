export interface LoginResponse {
  access_token: string;
  refresh_token: string;
}

/** An external identity provider enabled on auth-service. */
export interface OAuthProvider {
  provider: string;
  label: string;
}
