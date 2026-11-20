import { useEffect, useState } from 'react';
import { useTranslation } from '../store/useSettingsStore';

type Health = 'checking' | 'connected' | 'databaseOffline' | 'backendOffline';

const tones: Record<Health, string> = {
  checking: 'text-text-muted',
  connected: 'text-success',
  databaseOffline: 'text-danger',
  backendOffline: 'text-danger'
};

export default function ConnectionStatus() {
  const [health, setHealth] = useState<Health>('checking');
  const { t } = useTranslation();

  useEffect(() => {
    let stopped = false;
    let nextCheck: ReturnType<typeof setTimeout>;
    let active: AbortController;

    async function check() {
      active = new AbortController();
      const timeout = setTimeout(() => active.abort(), 5_000);
      let result: Health = 'backendOffline';
      try {
        const response = await fetch('/healthz', { cache: 'no-store', signal: active.signal });
        const payload: { status?: string } | null = await response.json();
        if (response.ok && payload?.status === 'ok') {
          result = 'connected';
        } else if (response.status === 503 && payload?.status === 'unavailable') {
          result = 'databaseOffline';
        }
      } catch {
        // Failed, timed-out, or unexpected responses cannot confirm connectivity.
      } finally {
        clearTimeout(timeout);
        if (!stopped) {
          setHealth(result);
          nextCheck = setTimeout(check, 15_000);
        }
      }
    }

    void check();
    return () => {
      stopped = true;
      clearTimeout(nextCheck);
      active.abort();
    };
  }, []);

  const labels: Record<Health, string> = {
    checking: t('connectionChecking', 'Checking connection…'),
    connected: t('connectionConnected', 'Backend & database connected'),
    databaseOffline: t('connectionDatabaseOffline', 'Database disconnected'),
    backendOffline: t('connectionBackendOffline', 'Backend unreachable')
  };

  return (
    <span aria-live="polite" className={`inline-flex items-center gap-1.5 text-xs font-medium ${tones[health]}`}>
      <span aria-hidden="true" className="size-1.5 shrink-0 rounded-full bg-current" />
      {labels[health]}
    </span>
  );
}
