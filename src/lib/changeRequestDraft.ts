import { correctionCategories, type ChangeCategory } from './changeRequests';

export interface CorrectionDraft {
  category: ChangeCategory;
  fields: Record<string, string>;
  reason: string;
}

const draftKey = (userId: string) => `sctn:correction:${userId}`;

export function readCorrectionDraft(userId: string): CorrectionDraft | null {
  try {
    const saved = sessionStorage.getItem(draftKey(userId));
    if (!saved) {
      const legacy = sessionStorage.getItem('sctn:personal-info:' + userId);
      if (!legacy) return null;
      const fields = Object.fromEntries(Object.entries(JSON.parse(legacy)).filter(([, value]) => typeof value === 'string')) as Record<string, string>;
      return { category: 'PERSONAL', fields, reason: '' };
    }
    const { category, fields, reason } = JSON.parse(saved) as CorrectionDraft;
    if (!Object.hasOwn(correctionCategories, category) || !fields || typeof reason !== 'string') return null;
    return {
      category, reason,
      fields: Object.fromEntries(Object.entries(fields).filter(([, value]) => typeof value === 'string'))
    };
  } catch {
    return null;
  }
}

export function writeCorrectionDraft(userId: string, value: CorrectionDraft) {
  try {
    sessionStorage.setItem(draftKey(userId), JSON.stringify(value));
  } catch {
    // A browser without available storage can still submit the form.
  }
}

export function clearCorrectionDraft(userId: string) {
  try {
    sessionStorage.removeItem(draftKey(userId));
    sessionStorage.removeItem(`sctn:personal-info:${userId}`);
  } catch {
    // Storage can be disabled by the browser.
  }
}
