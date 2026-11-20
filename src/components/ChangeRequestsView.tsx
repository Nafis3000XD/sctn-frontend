import { useCallback, useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import api from '../lib/axios';
import {
  correctionCategories, showChangeValue, statusLabels,
  type ChangeRequest, type ChangeRequestPage, type ChangeStatus
} from '../lib/changeRequests';

const badge: Record<ChangeStatus, string> = {
  PENDING: 'bg-warning/15 text-warning', APPROVED: 'bg-success/15 text-success', REJECTED: 'bg-danger/15 text-danger'
};
const button = 'inline-flex items-center justify-center gap-2 rounded-lg border border-white/15 px-3 py-2 text-sm hover:bg-white/10 disabled:opacity-50';
const date = (value: string) => new Date(value).toLocaleString();

function RequestCard({ request, admin, onDecision }: {
  request: ChangeRequest; admin: boolean; onDecision: (id: string) => void;
}) {
  const [note, setNote] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');

  async function decide(decision: 'APPROVED' | 'REJECTED') {
    if (pending) return;
    if (decision === 'REJECTED' && !note.trim()) {
      setError('Enter a reason before declining.');
      return;
    }
    setPending(true);
    setError('');
    try {
      await api.post(`/admin/change-requests/${request.id}/decision`, { decision, note });
      onDecision(request.id);
    } catch (err) {
      setError((err as { response?: { data?: { message?: string } } }).response?.data?.message ?? 'Could not record the decision.');
    } finally {
      setPending(false);
    }
  }

  return (
    <article className="space-y-4 rounded-xl border border-white/10 bg-surface/50 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold">{correctionCategories[request.category]}</h3>
          <p className="mt-1 text-sm text-text-muted">{date(request.createdAt)}</p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${badge[request.status]}`}>{statusLabels[request.status]}</span>
      </div>

      {request.citizen && (
        <dl className="grid gap-3 rounded-lg bg-background/40 p-3 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-text-muted">Citizen</dt>
            <dd className="break-words">{request.citizen.citizenProfile?.fullName ?? 'Profile unavailable'}</dd>
            <dd className="break-words">{request.citizen.email}</dd>
          </div>
          <div>
            <dt className="text-text-muted">Citizen ID</dt>
            <dd>{request.citizen.citizenProfile?.citizenId ?? 'Unavailable'}</dd>
            <dd>{request.citizen.isActive ? 'Active account' : 'Inactive account'}</dd>
          </div>
          <div>
            <dt className="text-text-muted">Password reverified</dt>
            <dd>{request.verifiedAt ? date(request.verifiedAt) : 'Unavailable'}</dd>
            <dd>Network: {request.network ?? 'Unavailable'}</dd>
          </div>
        </dl>
      )}

      <div className="overflow-x-auto">
        <table className="w-full table-fixed text-left text-sm">
          <thead className="border-b border-white/10 text-text-muted">
            <tr><th className="p-2">Field</th><th className="p-2">Value at submission</th><th className="p-2">Proposed value</th></tr>
          </thead>
          <tbody>
            {Object.entries(request.proposedValues).map(([key, value]) => (
              <tr key={key} className="border-b border-white/5">
                <th scope="row" className="break-words p-2 font-medium">{request.labels?.[key] ?? key}</th>
                <td className="whitespace-pre-wrap break-words p-2">{showChangeValue(request.priorValues[key])}</td>
                <td className="whitespace-pre-wrap break-words p-2">{showChangeValue(value)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <dl className="space-y-3 text-sm">
        <div>
          <dt className="font-medium text-text-muted">Reason for the correction</dt>
          <dd className="mt-1 whitespace-pre-wrap break-words">{request.reason}</dd>
        </div>
        {request.reviewedAt && <div>
          <dt className="font-medium text-text-muted">Decision · {date(request.reviewedAt)}</dt>
          <dd className="mt-1 whitespace-pre-wrap break-words">{request.reviewNote || statusLabels[request.status]}</dd>
        </div>}
      </dl>

      {admin && request.status === 'PENDING' && (
        <div className="space-y-3 border-t border-white/10 pt-4">
          <label className="block space-y-1 text-sm">
            <span>Decision note (required to decline)</span>
            <textarea value={note} onChange={event => setNote(event.target.value)} maxLength={1000} rows={2}
              disabled={pending} className="block w-full rounded-lg border border-white/15 bg-background/60 p-3" />
          </label>
          {error && <p role="alert" className="text-sm text-danger">{error}</p>}
          <div className="flex flex-wrap gap-2">
            <button type="button" className={button + ' bg-success/15 text-success'} disabled={pending} onClick={() => void decide('APPROVED')}>
              Accept and apply
            </button>
            <button type="button" className={button + ' bg-danger/15 text-danger'} disabled={pending} onClick={() => void decide('REJECTED')}>
              Decline
            </button>
          </div>
        </div>
      )}
    </article>
  );
}

export default function ChangeRequestsView({ admin = false, openAssistant }: { admin?: boolean; openAssistant?: () => void }) {
  const [filter, setFilter] = useState<ChangeStatus>('PENDING');
  const [page, setPage] = useState<ChangeRequestPage>({ items: [], nextCursor: null });
  const [cursor, setCursor] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const path = admin ? '/admin/change-requests' : '/citizen/change-requests';

  const load = useCallback(async (signal?: AbortSignal) => {
    try {
      const { data } = await api.get<ChangeRequestPage>(path, {
        signal, params: { cursor, ...(admin ? { status: filter } : {}) }
      });
      if (!signal?.aborted) {
        setPage(data);
        setError('');
      }
    } catch {
      if (!signal?.aborted) setError('Could not load change requests.');
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, [admin, cursor, filter, path]);

  useEffect(() => {
    const controller = new AbortController();
    void load(controller.signal);
    const timer = window.setInterval(() => void load(controller.signal), 15_000);
    return () => {
      controller.abort();
      window.clearInterval(timer);
    };
  }, [load]);

  function changePage(next?: string) {
    setCursor(next);
    setLoading(true);
  }

  return (
    <section className="glass-card space-y-6 rounded-2xl p-6 text-text">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold">Change Requests</h2>
          <p className="mt-1 text-sm text-text-muted">
            {admin ? 'Review proposed corrections before applying them to citizen profiles.' : 'Track your profile corrections and see each decision here.'}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {openAssistant && <button type="button" className={button + ' bg-primary-600/20 text-primary-400'} onClick={openAssistant}>New correction</button>}
          <button type="button" className={button} onClick={() => void load()}><RefreshCw size={15} aria-hidden="true" />Refresh</button>
        </div>
      </div>

      {admin && <div className="flex flex-wrap gap-2" aria-label="Filter by status">
        {(Object.keys(statusLabels) as ChangeStatus[]).map(status => (
          <button key={status} type="button" aria-pressed={filter === status} className={button + (filter === status ? ' bg-primary-600/20 text-primary-400' : '')}
            onClick={() => {
              if (filter === status) return;
              setFilter(status);
              changePage();
              setNotice('');
            }}>{statusLabels[status]}</button>
        ))}
      </div>}

      {notice && <p role="status" className="text-sm text-success">{notice}</p>}
      {error && <p role="alert" className="text-sm text-danger">{error}</p>}
      {loading ? <p className="text-sm text-text-muted">Loading requests…</p> :
        page.items.length === 0 ? <p className="text-sm text-text-muted">No requests to show.</p> :
          <div className="space-y-4">
            {page.items.map(request => <RequestCard key={request.id} request={request} admin={admin} onDecision={id => {
              setPage(current => ({ ...current, items: current.items.filter(item => item.id !== id) }));
              setNotice('Decision recorded.');
              void load();
            }} />)}
          </div>}

      {!loading && (cursor || page.nextCursor) && (
        <div className="flex flex-wrap gap-2">
          {cursor && <button type="button" className={button} onClick={() => changePage()}>Newest requests</button>}
          {page.nextCursor && <button type="button" className={button} onClick={() => changePage(page.nextCursor ?? undefined)}>Older requests</button>}
        </div>
      )}
    </section>
  );
}
