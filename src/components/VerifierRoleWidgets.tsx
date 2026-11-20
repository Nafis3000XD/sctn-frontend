import React, { useState } from 'react';
import {
  Users, Briefcase, DollarSign, Calculator, Activity, Heart,
  Shield, AlertTriangle, Eye
} from 'lucide-react';

interface VerifierRoleWidgetsProps {
  role: string;
  navigate: (path: string) => void;
}

export const VerifierRoleWidgets: React.FC<VerifierRoleWidgetsProps> = ({ role, navigate }) => {
  // 1. Bank Loan Officer State: Interactive Risk Calculator
  const [loanAmount, setLoanAmount] = useState<number>(500000);
  const [monthlyIncome, setMonthlyIncome] = useState<number>(85000);
  const [existingDebt, setExistingDebt] = useState<number>(15000);

  // Calculate debt-to-income ratio for Loan Officer
  const dti = monthlyIncome > 0 ? Math.round(((existingDebt + (loanAmount * 0.015)) / monthlyIncome) * 100) : 0;
  const getRiskStatus = () => {
    if (dti < 35) return { label: 'LOW RISK', color: 'text-success bg-success/10 border-success/20' };
    if (dti >= 35 && dti <= 50) return { label: 'MEDIUM RISK', color: 'text-warning bg-warning/10 border-warning/20' };
    return { label: 'HIGH RISK', color: 'text-danger bg-danger/10 border-danger/20' };
  };
  const risk = getRiskStatus();

  // RENDER PORTALS SPECIFIC HOMEPAGE WIDGETS

  // JOB INTERVIEWER PORTAL HOME
  if (role === 'JobInterviewer') {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in">
        {/* Metric Cards */}
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card rounded-2xl p-5 border-l-4 border-l-primary-500">
            <span className="text-text-muted text-xs font-bold uppercase tracking-wider block">Applicants Screened</span>
            <h3 className="text-3xl font-bold text-white mt-1">48</h3>
            <p className="text-xs text-success font-medium mt-1">↑ 12% from last week</p>
          </div>
          <div className="glass-card rounded-2xl p-5 border-l-4 border-l-accent">
            <span className="text-text-muted text-xs font-bold uppercase tracking-wider block">Pending Consents</span>
            <h3 className="text-3xl font-bold text-white mt-1">5</h3>
            <p className="text-xs text-text-muted mt-1">Awaiting candidate action</p>
          </div>
          <div className="glass-card rounded-2xl p-5 border-l-4 border-l-success">
            <span className="text-text-muted text-xs font-bold uppercase tracking-wider block">Verification Success</span>
            <h3 className="text-3xl font-bold text-white mt-1">94.8%</h3>
            <p className="text-xs text-success font-medium mt-1">Identity & Academics validated</p>
          </div>
        </div>

        {/* Candidate List */}
        <div className="lg:col-span-2 glass-card rounded-2xl p-6 space-y-4">
          <div className="flex justify-between items-center border-b border-white/10 pb-3">
            <h4 className="font-semibold text-white flex items-center gap-2">
              <Briefcase size={20} className="text-primary-400" />
              Active Recruitment Queue
            </h4>
            <span className="text-xs text-text-muted">3 Candidates</span>
          </div>

          <div className="divide-y divide-white/5 space-y-3">
            {[
              { name: 'Md Robiul', id: 'SCTN-987654', role: 'Lead Backend Developer', status: 'Verified', statusColor: 'bg-success/15 text-success' },
              { name: 'Rahim Ali', id: 'SCTN-112233', role: 'Technical Product Manager', status: 'Verified', statusColor: 'bg-success/15 text-success' },
              { name: 'Sarah Khan', id: 'SCTN-445566', role: 'Frontend Engineer Intern', status: 'Pending Consent', statusColor: 'bg-warning/15 text-warning' }
            ].map((cand, i) => (
              <div key={i} className="flex items-center justify-between pt-3 first:pt-0">
                <div>
                  <h5 className="font-medium text-white text-sm">{cand.name}</h5>
                  <p className="text-xs text-text-muted">{cand.role} <span className="font-mono text-primary-400 ml-1">({cand.id})</span></p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${cand.statusColor}`}>{cand.status}</span>
                  <button
                    onClick={() => navigate('/verifier/search')}
                    className="p-1.5 bg-white/5 hover:bg-primary-600 rounded-lg text-text-muted hover:text-white transition-colors cursor-pointer"
                    title="Inspect Profile"
                  >
                    <Eye size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Requirements Checklist */}
        <div className="glass-card rounded-2xl p-6 space-y-4">
          <h4 className="font-semibold text-white border-b border-white/10 pb-3 flex items-center gap-2">
            <Users size={20} className="text-accent" />
            Verification Standards
          </h4>
          <ul className="space-y-3 text-sm text-text-muted">
            <li className="flex items-start gap-2">
              <span className="text-success mt-0.5">✓</span>
              <div>
                <strong className="text-white block text-xs">National ID & Birth Record</strong>
                Bypasses fake credentials checks
              </div>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-success mt-0.5">✓</span>
              <div>
                <strong className="text-white block text-xs">Academic Credential Check</strong>
                Roll/Registration matched with Board databases
              </div>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-success mt-0.5">✓</span>
              <div>
                <strong className="text-white block text-xs">Employment History</strong>
                Verifies past corporate compliance & tax payments
              </div>
            </li>
          </ul>
        </div>
      </div>
    );
  }

  // BANK LOAN OFFICER PORTAL HOME
  if (role === 'BankLoanOfficer') {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in">
        {/* Metric Cards */}
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card rounded-2xl p-5 border-l-4 border-l-success">
            <span className="text-text-muted text-xs font-bold uppercase tracking-wider block">Active Loan Appraisals</span>
            <h3 className="text-3xl font-bold text-white mt-1">12</h3>
            <p className="text-xs text-success font-medium mt-1">৳2.4M under review</p>
          </div>
          <div className="glass-card rounded-2xl p-5 border-l-4 border-l-accent">
            <span className="text-text-muted text-xs font-bold uppercase tracking-wider block">Average Debt-To-Income</span>
            <h3 className="text-3xl font-bold text-white mt-1">28.4%</h3>
            <p className="text-xs text-success font-medium mt-1">Highly compliant borrowers</p>
          </div>
          <div className="glass-card rounded-2xl p-5 border-l-4 border-l-warning">
            <span className="text-text-muted text-xs font-bold uppercase tracking-wider block">Tax Compliance Audits</span>
            <h3 className="text-3xl font-bold text-white mt-1">100%</h3>
            <p className="text-xs text-text-muted mt-1">All applicants filing returns</p>
          </div>
        </div>

        {/* Risk Calculator */}
        <div className="lg:col-span-2 glass-card rounded-2xl p-6 space-y-4">
          <h4 className="font-semibold text-white border-b border-white/10 pb-3 flex items-center gap-2">
            <Calculator size={20} className="text-success" />
            Quick Risk & Debt-To-Income (DTI) Analyzer
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-text-muted pt-2">
            <div className="space-y-3">
              <div>
                <label className="block mb-1 font-medium">Requested Loan Amount (৳)</label>
                <input
                  type="number"
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(Number(e.target.value))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">Monthly Income (৳)</label>
                <input
                  type="number"
                  value={monthlyIncome}
                  onChange={(e) => setMonthlyIncome(Number(e.target.value))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">Existing Monthly Debt Payments (৳)</label>
                <input
                  type="number"
                  value={existingDebt}
                  onChange={(e) => setExistingDebt(Number(e.target.value))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>
            </div>

            <div className="bg-white/2 border border-white/5 rounded-xl p-5 flex flex-col justify-center items-center text-center space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider">Estimated DTI Ratio</span>
              <h3 className={`text-4xl font-extrabold ${dti > 50 ? 'text-danger' : dti > 35 ? 'text-warning' : 'text-success'}`}>
                {dti}%
              </h3>
              <p className="text-xs max-w-[200px]">Includes estimated loan payment (1.5% monthly index)</p>

              <div className={`px-4 py-1.5 border rounded-lg text-xs font-bold ${risk.color}`}>
                {risk.label}
              </div>
            </div>
          </div>
        </div>

        {/* Verification Hub */}
        <div className="glass-card rounded-2xl p-6 space-y-4">
          <h4 className="font-semibold text-white border-b border-white/10 pb-3 flex items-center gap-2">
            <DollarSign size={20} className="text-accent" />
            Credit Scopes
          </h4>
          <ul className="space-y-3 text-sm text-text-muted">
            <li className="flex items-start gap-2">
              <span className="text-success">✓</span>
              <div>
                <strong className="text-white block text-xs">Income Statements</strong>
                Verified directly from employer/bank logs.
              </div>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-success">✓</span>
              <div>
                <strong className="text-white block text-xs">Tax Compliance Check</strong>
                Validates tax taxpayer circle, return receipts, and status.
              </div>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-success">✓</span>
              <div>
                <strong className="text-white block text-xs">Criminal Liability</strong>
                Validates active public prosecutions or outstanding penal fines.
              </div>
            </li>
          </ul>
        </div>
      </div>
    );
  }

  // DOCTOR PORTAL HOME
  if (role === 'Doctor') {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in">
        {/* Metric Cards */}
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card rounded-2xl p-5 border-l-4 border-l-danger">
            <span className="text-text-muted text-xs font-bold uppercase tracking-wider block">Checked In Patients</span>
            <h3 className="text-3xl font-bold text-white mt-1">16</h3>
            <p className="text-xs text-danger font-medium mt-1">4 patients in queue</p>
          </div>
          <div className="glass-card rounded-2xl p-5 border-l-4 border-l-accent">
            <span className="text-text-muted text-xs font-bold uppercase tracking-wider block">Prescriptions Uploaded</span>
            <h3 className="text-3xl font-bold text-white mt-1">32</h3>
            <p className="text-xs text-success font-medium mt-1">Validated on SCTN network</p>
          </div>
          <div className="glass-card rounded-2xl p-5 border-l-4 border-l-success">
            <span className="text-text-muted text-xs font-bold uppercase tracking-wider block">Triage Alert Status</span>
            <h3 className="text-3xl font-bold text-white mt-1">Normal</h3>
            <p className="text-xs text-success font-medium mt-1">No emergency warnings</p>
          </div>
        </div>

        {/* Patient Queue */}
        <div className="lg:col-span-2 glass-card rounded-2xl p-6 space-y-4">
          <div className="flex justify-between items-center border-b border-white/10 pb-3">
            <h4 className="font-semibold text-white flex items-center gap-2">
              <Activity size={20} className="text-danger" />
              Patient Triage & Consultation Queue
            </h4>
            <span className="text-xs text-text-muted">Active Shifts</span>
          </div>

          <div className="divide-y divide-white/5 space-y-3">
            {[
              { name: 'Md Robiul', id: 'SCTN-987654', condition: 'Mild Asthma Checkup', blood: 'O+', status: 'In Consultation', statusColor: 'bg-primary-500/10 text-primary-400' },
              { name: 'Sarah Khan', id: 'SCTN-445566', condition: 'Allergy Evaluation', blood: 'B+', status: 'Waiting', statusColor: 'bg-warning/10 text-warning' },
              { name: 'Bruce Wayne', id: 'SCTN-100001', condition: 'Physical Assessment', blood: 'A-', status: 'Checked Out', statusColor: 'bg-success/10 text-success' }
            ].map((patient, i) => (
              <div key={i} className="flex items-center justify-between pt-3 first:pt-0">
                <div>
                  <h5 className="font-medium text-white text-sm">{patient.name}</h5>
                  <p className="text-xs text-text-muted">{patient.condition} • Blood: <span className="font-bold text-danger">{patient.blood}</span></p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${patient.statusColor}`}>{patient.status}</span>
                  <button
                    onClick={() => navigate('/verifier/verifications')}
                    className="p-1.5 bg-white/5 hover:bg-danger-600 rounded-lg text-text-muted hover:text-white transition-colors cursor-pointer"
                    title="Evaluate Health Records"
                  >
                    <Heart size={14} className="text-danger" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Medical Stats */}
        <div className="glass-card rounded-2xl p-6 space-y-4">
          <h4 className="font-semibold text-white border-b border-white/10 pb-3 flex items-center gap-2">
            <Heart size={20} className="text-success" />
            Clinical Safeguards
          </h4>
          <ul className="space-y-3 text-sm text-text-muted">
            <li className="flex items-start gap-2">
              <span className="text-success">✓</span>
              <div>
                <strong className="text-white block text-xs">Zero-Knowledge Allergy Verification</strong>
                Allows checks of drug counter-indications without full history exposure.
              </div>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-success">✓</span>
              <div>
                <strong className="text-white block text-xs">Instant Visit Logging</strong>
                Securely uploads visit reason, doctor stamp, and prescription files.
              </div>
            </li>
          </ul>
        </div>
      </div>
    );
  }

  // INTELLIGENCE DEPARTMENT PORTAL HOME
  if (role === 'IntelligenceDepartment') {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in">
        {/* Metric Cards */}
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card rounded-2xl p-5 border-l-4 border-l-warning">
            <span className="text-text-muted text-xs font-bold uppercase tracking-wider block">Active Fraud Alerts</span>
            <h3 className="text-3xl font-bold text-white mt-1">3</h3>
            <p className="text-xs text-warning font-medium mt-1">High priority investigation</p>
          </div>
          <div className="glass-card rounded-2xl p-5 border-l-4 border-l-danger">
            <span className="text-text-muted text-xs font-bold uppercase tracking-wider block">Identity Breaches Blocked</span>
            <h3 className="text-3xl font-bold text-white mt-1">14</h3>
            <p className="text-xs text-success font-medium mt-1">Security system fully operational</p>
          </div>
          <div className="glass-card rounded-2xl p-5 border-l-4 border-l-accent">
            <span className="text-text-muted text-xs font-bold uppercase tracking-wider block">National Threat Level</span>
            <h3 className="text-3xl font-bold text-white mt-1">GUARD</h3>
            <p className="text-xs text-text-muted mt-1">Heightened compliance audits</p>
          </div>
        </div>

        {/* Live Fraud Alerts Feed */}
        <div className="lg:col-span-2 glass-card rounded-2xl p-6 space-y-4">
          <div className="flex justify-between items-center border-b border-white/10 pb-3">
            <h4 className="font-semibold text-white flex items-center gap-2">
              <AlertTriangle size={20} className="text-warning" />
              Live Security Audits & Fraud Signals
            </h4>
            <span className="text-xs text-text-muted">Real-time Feed</span>
          </div>

          <div className="divide-y divide-white/5 space-y-3">
            {[
              { type: 'NID IDENTITY FRAUD', detail: 'Duplicate name mismatch on passport cross-validation', target: 'Bruce Wayne', date: 'Just now', badgeColor: 'bg-danger/10 text-danger' },
              { type: 'FINANCIAL ANOMALY', detail: 'Asset value disparity compared to filed return limits', target: 'Tony Stark', date: '10 mins ago', badgeColor: 'bg-warning/10 text-warning' },
              { type: 'POLICE CLEARANCE BLOCK', detail: 'Unresolved public fines pending over 60 days', target: 'Rahim Ali', date: '1 hour ago', badgeColor: 'bg-warning/10 text-warning' }
            ].map((alert, i) => (
              <div key={i} className="pt-3 first:pt-0 space-y-1">
                <div className="flex justify-between items-center">
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${alert.badgeColor}`}>{alert.type}</span>
                  <span className="text-[10px] text-text-muted font-mono">{alert.date}</span>
                </div>
                <p className="text-sm font-semibold text-white">Target: {alert.target}</p>
                <p className="text-xs text-text-muted">{alert.detail}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Intelligence Scopes */}
        <div className="glass-card rounded-2xl p-6 space-y-4">
          <h4 className="font-semibold text-white border-b border-white/10 pb-3 flex items-center gap-2">
            <Shield size={20} className="text-accent" />
            Clearance Permissions
          </h4>
          <p className="text-xs text-text-muted leading-relaxed">
            As a certified Intelligence Officer, you hold direct search permissions to examine criminal records, tax zone violations, and identity files on the SCTN network.
          </p>
          <div className="border-t border-white/5 pt-3 mt-3">
            <button
              onClick={() => navigate('/verifier/search')}
              className="w-full bg-warning/20 hover:bg-warning text-warning border border-warning/30 font-semibold py-2 rounded-xl text-xs transition-colors duration-200 cursor-pointer"
            >
              Access Direct Search Portal
            </button>
          </div>
        </div>
      </div>
    );
  }



  // Fallback / default (if any other role)
  return null;
};
