import { act, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import ConnectionStatus from '../src/components/ConnectionStatus';

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

it('reports the database outage and recovers after the next health check', async () => {
  vi.useFakeTimers();
  const fetchHealth = vi.fn()
    .mockResolvedValueOnce(Response.json({ status: 'unavailable' }, { status: 503 }))
    .mockResolvedValueOnce(Response.json({ status: 'ok' }));
  vi.stubGlobal('fetch', fetchHealth);

  const view = render(<ConnectionStatus />);
  expect(screen.getByText('Checking connection…')).toBeVisible();
  await act(async () => {});
  expect(screen.getByText('Database disconnected')).toBeVisible();

  await act(async () => {
    await vi.advanceTimersByTimeAsync(15_000);
  });
  expect(screen.getByText('Backend & database connected')).toBeVisible();
  expect(fetchHealth).toHaveBeenCalledWith('/healthz', expect.objectContaining({ cache: 'no-store' }));
  view.unmount();
});

it('reports when the backend cannot be reached', async () => {
  vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Network unavailable')));
  render(<ConnectionStatus />);
  expect(await screen.findByText('Backend unreachable')).toBeVisible();
});
