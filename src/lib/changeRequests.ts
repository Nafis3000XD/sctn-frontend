export const correctionCategories = {
  PERSONAL: 'Personal Info',
  IDENTITY: 'Identity Info',
  EDUCATION: 'Education Info',
  FINANCIAL: 'Financial Info',
  MEDICAL: 'Medical Info',
  CRIME: 'Crime Info'
} as const;

export type ChangeCategory = keyof typeof correctionCategories;
export type ChangeValue = string | number | boolean | null;
export type ChangeStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface CorrectionField {
  key: string;
  label: string;
  kind: 'text' | 'textarea' | 'date' | 'number' | 'select' | 'boolean';
  required?: boolean;
  options?: string[];
  maxLength?: number;
}

export interface CorrectionCategory {
  id: ChangeCategory;
  label: string;
  fields: CorrectionField[];
}

export interface ChangeRequest {
  id: string;
  category: ChangeCategory;
  status: ChangeStatus;
  createdAt: string;
  reviewedAt: string | null;
  reviewNote: string | null;
  reason: string;
  priorValues: Record<string, ChangeValue>;
  proposedValues: Record<string, ChangeValue>;
  labels?: Record<string, string>;
  verifiedAt?: string;
  network?: string;
  citizen?: { email: string; isActive: boolean; citizenProfile: { citizenId: string; fullName: string } | null };
}

export interface ChangeRequestPage {
  items: ChangeRequest[];
  nextCursor: string | null;
}

export const statusLabels: Record<ChangeStatus, string> = {
  PENDING: 'Pending review', APPROVED: 'Approved', REJECTED: 'Declined'
};

export function showChangeValue(value: unknown) {
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (value === '' || value == null) return 'Blank';
  return typeof value === 'string' ? value : String(value);
}
