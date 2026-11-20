import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Bot, LockKeyhole, Send } from 'lucide-react';
import api from '../lib/axios';
import {
  correctionCategories, showChangeValue,
  type ChangeCategory, type ChangeValue, type CorrectionCategory, type CorrectionField
} from '../lib/changeRequests';
import { clearCorrectionDraft, readCorrectionDraft, writeCorrectionDraft, type CorrectionDraft } from '../lib/changeRequestDraft';

interface VerificationResponse {
  verification: string;
  suggestion: { category: ChangeCategory | null; field: string | null };
  catalog: CorrectionCategory[];
}
interface RequestError { message?: string; code?: string; errors?: Record<string, string> }
type Stage = 'intent' | 'verify' | 'form' | 'sent';
const sections = {
  IDENTITY: 'identityInfo', EDUCATION: 'educationInfo', FINANCIAL: 'financialInfo',
  MEDICAL: 'medicalInfo', CRIME: 'crimeInfo'
} as const;

function formValue(profile: Record<string, unknown>, category: ChangeCategory, field: string) {
  const record = category === 'PERSONAL' ? profile : profile[sections[category]] as Record<string, unknown> | undefined;
  const saved = record?.[field];
  if (saved == null) return field === 'hasCriminalRecord' ? 'false' : '';
  return field === 'dob' ? String(saved).slice(0, 10) : String(saved);
}

const input = 'block w-full rounded-lg border border-white/15 bg-background/70 px-3 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary-500';
const primary = 'inline-flex items-center justify-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-500 disabled:opacity-50';
const secondary = 'rounded-lg border border-white/15 px-3 py-2 text-sm text-text hover:bg-white/10 disabled:opacity-50';

function requestError(error: unknown): RequestError {
  return (error as { response?: { data?: RequestError } })?.response?.data ?? {};
}

function serialize(field: CorrectionField, value: string): ChangeValue {
  if (value === '') return null;
  if (field.kind === 'number') return Number(value);
  if (field.kind === 'boolean') return value === 'true';
  return value;
}

function FieldInput({ field, value, change, invalid }: {
  field: CorrectionField; value: string; change: (value: string) => void; invalid: boolean;
}) {
  const props = {
    id: `correction-${field.key}`, className: input, value, required: field.required,
    'aria-invalid': invalid,
    'aria-describedby': invalid ? `correction-${field.key}-error` : undefined,
    onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => change(event.target.value)
  };
  if (field.kind === 'textarea') return <textarea {...props} rows={3} maxLength={field.maxLength} />;
  if (field.kind === 'select' || field.kind === 'boolean') {
    const options = field.kind === 'boolean'
      ? [{ value: 'true', label: 'Yes' }, { value: 'false', label: 'No' }]
      : field.options?.map(value => ({ value, label: value }));
    return (
      <select {...props}>
        <option value="">{field.required ? 'Choose a value' : 'Blank'}</option>
        {options?.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
    );
  }
  return <input {...props} type={field.kind} maxLength={field.maxLength} step={field.kind === 'number' ? 'any' : undefined} />;
}

export default function CorrectionAssistant({ userId, profile, initialCategory, onClose }: {
  userId: string; profile: Record<string, unknown>;
  initialCategory?: ChangeCategory; onClose: () => void;
}) {
  const [draft, setDraft] = useState(() => readCorrectionDraft(userId));
  const [intent, setIntent] = useState('');
  const [target, setTarget] = useState(initialCategory ?? draft?.category);
  const [stage, setStage] = useState<Stage>(initialCategory || draft ? 'verify' : 'intent');
  const [password, setPassword] = useState('');
  const [verification, setVerification] = useState<VerificationResponse | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const category = verification?.catalog.find(section => section.id === draft?.category);
  const fields = category?.fields.filter(field => Object.hasOwn(draft?.fields ?? {}, field.key)) ?? [];
  const available = category?.fields.filter(field => !Object.hasOwn(draft?.fields ?? {}, field.key)) ?? [];
  const current = !draft || draft.category === 'PERSONAL'
    ? profile : (profile[sections[draft.category]] as Record<string, unknown> | undefined) ?? {};

  function updateDraft(next: CorrectionDraft) {
    setDraft(next);
    writeCorrectionDraft(userId, next);
  }

  function begin(event: FormEvent) {
    event.preventDefault();
    setTarget(undefined);
    setError('');
    setStage('verify');
  }

  function reset() {
    clearCorrectionDraft(userId);
    setDraft(null);
    setVerification(null);
    setTarget(undefined);
    setPassword('');
    setIntent('');
    setError('');
    setErrors({});
    setStage('intent');
  }

  async function verify(event: FormEvent) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError('');
    try {
      const { data } = await api.post<VerificationResponse>('/citizen/change-requests/verify', {
        password, message: intent, ...(target ? { category: target } : {})
      });
      setVerification(data);
      const suggested = data.suggestion.category;
      if (suggested && draft?.category !== suggested) {
        updateDraft({
          category: suggested, reason: '',
          fields: data.suggestion.field ? { [data.suggestion.field]: formValue(profile, suggested, data.suggestion.field) } : {}
        });
      }
      setStage('form');
    } catch (err) {
      setError(requestError(err).message ?? 'Could not verify your password.');
    } finally {
      setPassword('');
      setBusy(false);
    }
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!draft || !verification || !fields.length || busy) return;
    setBusy(true);
    setError('');
    setErrors({});
    try {
      await api.post('/citizen/change-requests', {
        verification: verification.verification,
        category: draft.category,
        reason: draft.reason,
        changes: Object.fromEntries(fields.map(field => [field.key, serialize(field, draft.fields[field.key])]))
      });
      clearCorrectionDraft(userId);
      setDraft(null);
      setVerification(null);
      setStage('sent');
    } catch (err) {
      const problem = requestError(err);
      setError(problem.errors?.form ?? problem.message ?? 'Could not submit the change request.');
      setErrors(problem.errors ?? {});
      if (problem.code === 'VERIFY_AGAIN') {
        setTarget(draft.category);
        setVerification(null);
        setStage('verify');
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="space-y-4 p-4 text-sm text-text">
      {error && <p role="alert" className="rounded-lg border border-danger/30 bg-danger/10 p-3 text-danger">{error}</p>}

      {stage === 'intent' && (
        <>
          <p className="flex items-start gap-2 rounded-xl bg-surface-hover/60 p-3">
            <Bot size={19} className="mt-0.5 shrink-0 text-primary-400" aria-hidden="true" />
            <span>What would you like to correct? Tell me the field, such as “change my phone number”. Enter the new value in the form that follows.</span>
          </p>
          <form onSubmit={begin} className="flex items-end gap-2">
            <label className="min-w-0 flex-1">
              <span className="sr-only">What needs to change?</span>
              <input className={input} value={intent} onChange={e => setIntent(e.target.value)} placeholder="What needs to change?" required maxLength={300} />
            </label>
            <button type="submit" className={primary} aria-label="Continue"><Send size={16} /></button>
          </form>
          <div className="flex flex-wrap gap-2">
            {Object.entries(correctionCategories).map(([id, label]) => (
              <button key={id} className={secondary} onClick={() => {
                setTarget(id as ChangeCategory);
                setIntent('');
                setError('');
                setStage('verify');
              }}>{label}</button>
            ))}
          </div>
        </>
      )}

      {stage === 'verify' && (
        <form onSubmit={verify} className="space-y-4">
          <div className="flex items-start gap-2 rounded-xl bg-surface-hover/60 p-3">
            <LockKeyhole size={18} className="mt-0.5 shrink-0 text-primary-400" aria-hidden="true" />
            <div>
              <h4 className="font-semibold">Confirm your account</h4>
              <p className="mt-1 text-text-muted">Re-enter your SCTN password. Verification expires after 15 minutes and is tied to this session and connection.</p>
            </div>
          </div>
          <label className="block space-y-1">
            <span>Current password</span>
            <input className={input} type="password" autoComplete="current-password" required maxLength={128}
              value={password} onChange={e => setPassword(e.target.value)} disabled={busy} />
          </label>
          <div className="flex flex-wrap gap-2">
            <button type="submit" className={primary} disabled={busy}>{busy ? 'Verifying…' : 'Verify and open form'}</button>
            <button type="button" className={secondary} onClick={reset} disabled={busy}>Cancel</button>
          </div>
        </form>
      )}

      {stage === 'form' && verification && (
        <form onSubmit={submit} className="space-y-4">
          <p className="rounded-xl bg-surface-hover/60 p-3">
            Account verified. Enter only the values you want corrected. I’ll check the form before sending it to an admin.
          </p>
          <fieldset disabled={busy} className="space-y-4">
            <label className="block space-y-1">
              <span>Section</span>
              <select className={input} required value={draft?.category ?? ''} onChange={e => {
                setErrors({});
                setError('');
                updateDraft({ category: e.target.value as ChangeCategory, reason: draft?.reason ?? '', fields: {} });
              }}>
                <option value="" disabled>Choose a section</option>
                {verification.catalog.map(section => <option key={section.id} value={section.id}>{section.label}</option>)}
              </select>
            </label>
            {draft && fields.map(field => (
              <div key={field.key} className="space-y-2 rounded-xl border border-white/10 p-3">
                <div className="flex items-start justify-between gap-2">
                  <label htmlFor={`correction-${field.key}`} className="font-medium">{field.label}</label>
                  <button type="button" className="text-xs text-text-muted hover:text-text" aria-label={`Remove ${field.label}`} onClick={() => {
                    updateDraft({ ...draft, fields: Object.fromEntries(Object.entries(draft.fields).filter(([key]) => key !== field.key)) });
                  }}>Remove</button>
                </div>
                <p className="break-words text-xs text-text-muted">Current: {showChangeValue(field.key === 'dob' ? String(current[field.key] ?? '').slice(0, 10) : current[field.key])}</p>
                <FieldInput field={field} value={draft.fields[field.key]} invalid={!!errors[field.key]}
                  change={value => updateDraft({ ...draft, fields: { ...draft.fields, [field.key]: value } })} />
                {errors[field.key] && <p id={`correction-${field.key}-error`} className="text-xs text-danger">{errors[field.key]}</p>}
              </div>
            ))}
            {!!draft && available.length > 0 && fields.length < 20 && (
              <label className="block space-y-1">
                <span>{fields.length ? 'Add another field' : 'Field to correct'}</span>
                <select value="" className={input} onChange={e =>
                  updateDraft({ ...draft, fields: { ...draft.fields, [e.target.value]: formValue(profile, draft.category, e.target.value) } })
                }>
                  <option value="" disabled>Choose a field</option>
                  {available.map(field => <option key={field.key} value={field.key}>{field.label}</option>)}
                </select>
              </label>
            )}
            {draft && (
              <label className="block space-y-1">
                <span>Why is this information wrong?</span>
                <textarea className={input} rows={3} value={draft.reason} onChange={e => updateDraft({ ...draft, reason: e.target.value })}
                  required minLength={5} maxLength={1000} />
              </label>
            )}
          </fieldset>
          <div className="flex flex-wrap gap-2">
            <button type="submit" className={primary} disabled={!fields.length || busy}>{busy ? 'Checking and submitting…' : 'Submit for review'}</button>
            <button type="button" className={secondary} onClick={reset} disabled={busy}>Discard</button>
          </div>
        </form>
      )}

      {stage === 'sent' && (
        <div className="space-y-3 rounded-xl bg-success/10 p-4">
          <p role="status" className="font-semibold text-success">Request sent for admin review.</p>
          <p>Check Change Requests for the decision. Your profile updates after approval.</p>
          <button className={secondary} onClick={reset}>Start another request</button>
        </div>
      )}

      <Link to="/citizen/changes" onClick={onClose} className="inline-block font-medium text-primary-400 hover:underline">
        View change requests
      </Link>
    </section>
  );
}
