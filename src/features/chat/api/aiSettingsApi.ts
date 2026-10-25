import { http } from '../../../services/http';
import type { AiProviderPreset, AiSettings, AiSettingsPayload, AiTestResult } from '../types/aiSettings.types';

const BASE = '/api/chat/admin/settings/';

/** Admin-only: which language model powers the chat assistant. */
export const aiSettingsApi = {
  get: () => http<{ settings: AiSettings; providers: AiProviderPreset[] }>(BASE),
  save: (payload: AiSettingsPayload) => http<AiSettings>(BASE, { method: 'PUT', body: JSON.stringify(payload) }),
  reset: () => http<AiSettings>(BASE, { method: 'DELETE' }),
  test: () => http<AiTestResult>(`${BASE}test`, { method: 'POST' }),
};
