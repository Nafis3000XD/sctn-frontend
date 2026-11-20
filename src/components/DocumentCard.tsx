// src/components/DocumentCard.tsx
import React from 'react';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

interface Field {
  label: string;
  value: string | number | null;
}

interface DocumentCardProps {
  title: string;
  icon: React.ReactNode;
  fields: Field[];
  status: 'Verified' | 'Pending Review' | 'Failed';
}

const statusColors: Record<string, string> = {
  Verified: 'bg-green-500',
  'Pending Review': 'bg-yellow-500',
  Failed: 'bg-red-500',
};

export const DocumentCard: React.FC<DocumentCardProps> = ({ title, icon, fields, status }) => {
  const StatusIcon =
    status === 'Verified' ? CheckCircle : status === 'Failed' ? XCircle : Clock;
  return (
    <div className="p-6 bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl shadow-lg hover:scale-[1.02] transition-transform duration-300">
      <div className="flex items-center gap-3 mb-4">
        <div className="text-2xl">{icon}</div>
        <h3 className="text-xl font-semibold text-white">{title}</h3>
        <div className={`ml-auto flex items-center gap-1 px-2 py-0.5 rounded ${statusColors[status]} text-xs text-white`}>
          <StatusIcon size={14} />
          <span>{status}</span>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {fields.map((f) => (
          <div key={f.label} className="bg-white/5 border border-white/10 rounded p-3">
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">{f.label}</p>
            <p className="text-sm text-white">{f.value ?? 'Not Provided'}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
