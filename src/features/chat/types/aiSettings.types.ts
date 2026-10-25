export interface AiSettings {
  provider: string;
  base_url: string;
  model: string;
  timeout_seconds: number;
  /** The key itself is never sent back, only whether one is set and its last 4 characters. */
  has_key: boolean;
  key_hint: string;
  /** "admin": saved from this screen · "env": the server's own configuration. */
  source: 'admin' | 'env';
}

export interface AiProviderPreset {
  name: string;
  base_url: string;
  model: string;
  needs_key: boolean;
}

export interface AiSettingsPayload {
  provider: string;
  base_url: string;
  /** Empty keeps the key already saved for the same provider. */
  api_key: string;
  model: string;
  timeout_seconds: number;
}

export interface AiTestResult {
  ok: boolean;
  message: string;
  latency_ms: number;
}
