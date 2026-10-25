import { useEffect, useState } from 'react';
import { Bot, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '../../../components/Button';
import { Input } from '../../../components/Input';
import { Spinner } from '../../../components/Spinner';
import { useAiSettings, useResetAiSettings, useSaveAiSettings, useTestAiSettings } from '../hooks/useAiSettings';

const SELECT_STYLE =
  'w-full rounded-xl border border-brand/15 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20';

const FIELD_LABEL = 'mb-1.5 block text-xs font-semibold text-neutral-600';

/** Admin: pick the provider, model and API key behind the chat assistant. */
export function AiSettingsSection() {
  const { data, isLoading } = useAiSettings();
  const save = useSaveAiSettings();
  const reset = useResetAiSettings();
  const test = useTestAiSettings();

  const [provider, setProvider] = useState('');
  const [model, setModel] = useState('');
  const [baseUrl, setBaseUrl] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [timeout, setTimeoutSeconds] = useState(60);

  const settings = data?.settings;
  useEffect(() => {
    if (!settings) return;
    setProvider(settings.provider || 'demo');
    setModel(settings.model);
    setBaseUrl(settings.base_url);
    setTimeoutSeconds(settings.timeout_seconds || 60);
    setApiKey('');
  }, [settings]);

  if (isLoading || !data || !settings) {
    return (
      <div className="rounded-2xl border border-brand/10 bg-white p-5">
        <Spinner />
      </div>
    );
  }

  const presets = data.providers;
  const preset = presets.find((p) => p.name === provider);
  const sameProvider = provider === (settings.provider || 'demo');
  const keyKept = sameProvider && settings.has_key;
  const needsKey = !!preset?.needs_key && !keyKept && !apiKey.trim();
  const unknownDemo = provider === 'demo';

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    test.reset();
    save.mutate({ provider, model: model.trim(), base_url: baseUrl.trim(), api_key: apiKey.trim(), timeout_seconds: timeout });
  };

  return (
    <div className="rounded-2xl border border-brand/10 bg-white p-5">
      <div className="flex items-center gap-2">
        <Bot size={18} className="text-brand" />
        <h2 className="font-display text-lg font-bold text-brand">Assistant IA (chat)</h2>
      </div>
      <p className="mt-1 text-sm text-neutral-400">
        Choisissez le fournisseur, le modèle et la clé API du chat. Le changement est immédiat, sans redémarrage.
        {settings.source === 'env' && ' Actuellement : configuration du serveur.'}
      </p>

      <form onSubmit={submit} className="mt-4 grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className={FIELD_LABEL}>Fournisseur</span>
          <select
            className={SELECT_STYLE}
            value={provider}
            onChange={(e) => {
              setProvider(e.target.value);
              setModel('');
              setBaseUrl('');
              setApiKey('');
            }}
          >
            <option value="demo">Démo hors-ligne (aucune IA)</option>
            {presets.map((p) => (
              <option key={p.name} value={p.name}>
                {p.name}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className={FIELD_LABEL}>Modèle</span>
          <Input
            value={model}
            disabled={unknownDemo}
            placeholder={preset?.model || 'ex. claude-haiku-5-5'}
            onChange={(e) => setModel(e.target.value)}
          />
        </label>

        <label className="block">
          <span className={FIELD_LABEL}>Clé API {preset && !preset.needs_key && '(optionnelle)'}</span>
          <Input
            type="password"
            autoComplete="off"
            value={apiKey}
            disabled={unknownDemo}
            placeholder={keyKept ? `•••• ${settings.key_hint} — laisser vide pour la conserver` : 'sk-…'}
            onChange={(e) => setApiKey(e.target.value)}
          />
        </label>

        <label className="block">
          <span className={FIELD_LABEL}>URL de l'API {preset?.base_url ? '(optionnelle)' : ''}</span>
          <Input
            value={baseUrl}
            disabled={unknownDemo}
            placeholder={preset?.base_url || 'https://…/v1'}
            onChange={(e) => setBaseUrl(e.target.value)}
          />
        </label>

        <label className="block">
          <span className={FIELD_LABEL}>Délai maximum (secondes)</span>
          <Input
            type="number"
            min={5}
            max={300}
            value={timeout}
            disabled={unknownDemo}
            onChange={(e) => setTimeoutSeconds(Number(e.target.value))}
          />
        </label>

        <div className="md:col-span-2 flex flex-wrap items-center gap-2">
          <Button type="submit" disabled={save.isPending || needsKey}>
            {save.isPending ? 'Enregistrement…' : 'Enregistrer'}
          </Button>
          <Button type="button" variant="ghost" onClick={() => test.mutate()} disabled={test.isPending}>
            {test.isPending ? 'Test en cours…' : 'Tester le modèle actuel'}
          </Button>
          {settings.source === 'admin' && (
            <Button type="button" variant="ghost" onClick={() => reset.mutate()} disabled={reset.isPending}>
              Revenir à la config serveur
            </Button>
          )}
          {needsKey && <span className="text-xs text-neutral-500">Ce fournisseur demande une clé API.</span>}
        </div>

        {save.isError && (
          <p className="md:col-span-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{(save.error as Error).message}</p>
        )}
        {save.isSuccess && !save.isPending && (
          <p className="md:col-span-2 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
            Enregistré : le chat utilise maintenant ce modèle.
          </p>
        )}
        {test.data && (
          <p
            className={`md:col-span-2 flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${
              test.data.ok ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
            }`}
          >
            {test.data.ok ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
            {test.data.message} ({(test.data.latency_ms / 1000).toFixed(1)} s)
          </p>
        )}
      </form>
      <p className="mt-3 text-xs text-neutral-400">
        La clé est stockée côté serveur (service assistant) et n'est jamais renvoyée au navigateur.
      </p>
    </div>
  );
}
