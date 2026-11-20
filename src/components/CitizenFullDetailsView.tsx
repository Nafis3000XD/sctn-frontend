import { API_ORIGIN } from '../lib/axios';
import React, { useState } from 'react';
import {
  User, Users, AlertCircle, FileText, Download, Phone, Mail, MapPin, CheckCircle,
  Calendar, Heart, Shield, Activity, FileCheck, CreditCard, TrendingUp,
  Briefcase, GraduationCap, ShieldAlert, Award, Globe, HeartPulse, BookOpen
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

interface CitizenFullDetailsViewProps {
  profile: any;
}


export const CitizenFullDetailsView: React.FC<CitizenFullDetailsViewProps> = ({ profile }) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'identity' | 'academic' | 'financial' | 'medical' | 'criminal' | 'documents'>('profile');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState(false);

  const handleCopyId = () => {
    if (!profile?.citizenId) return;
    navigator.clipboard.writeText(profile.citizenId);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const { user } = useAuthStore();
  const isHighClearance = user?.role === 'Admin' || user?.role === 'IntelligenceDepartment';

  if (!profile) return null;

  const userObj = profile.user || {};
  const identity = profile.identityInfo || {};
  const education = profile.educationInfo || {};
  const financial = profile.financialInfo || {};
  const medical = profile.medicalInfo || {};
  const crime = profile.crimeInfo || {};
  const visitLogs = medical.visitLogs || [];
  const fineLogs = crime.fineLogs || [];
  const crimeLogs = crime.crimeLogs || [];
  const documents = profile.documents || [];

  const tabClass = (tab: 'profile' | 'identity' | 'academic' | 'financial' | 'medical' | 'criminal' | 'documents') => `
    flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl transition-all duration-300 cursor-pointer whitespace-nowrap
    ${activeTab === tab
      ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-lg shadow-primary-500/25 border border-primary-400/20 scale-[1.02]'
      : 'text-text-muted hover:text-white hover:bg-white/5 border border-transparent'}
  `;

  return (
    <div className="glass-card rounded-3xl p-6 md:p-8 space-y-8 border border-white/10 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-primary-500/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-accent/5 rounded-full blur-[100px] pointer-events-none" />

      {/* High-Clearance Terminal HUD */}
      {isHighClearance && (
        <div className="relative overflow-hidden bg-slate-950/40 border border-emerald-500/20 rounded-2xl p-5 md:p-6 shadow-inner animate-pulse-slow">
          {/* Animated Scan Line */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(16,185,129,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(16,185,129,0.02)_1px,transparent_1px)] bg-[size:1rem_1rem] opacity-70" />
          <div className="absolute inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent opacity-80 animate-scan-line top-0 pointer-events-none" />

          <div className="relative flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="space-y-2 text-left">
              <div className="flex items-center gap-2">
                <span className="flex h-2.5 w-2.5 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <span className="text-[10px] font-mono font-bold tracking-widest text-emerald-400 uppercase">
                  SECURE ADMINISTRATIVE CLEARANCE
                </span>
              </div>
              <h2 className="text-xl md:text-2xl font-black text-white tracking-wide uppercase flex items-center gap-2">
                🛡️ DATABASE DOSSIER ACCESS
              </h2>
              <p className="text-xs text-text-muted max-w-xl">
                Cleared by identity verification and legislative audit logs. Full database traversal is authorized for this citizen record.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full lg:w-auto shrink-0">
              <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-xl p-3 text-center backdrop-blur-sm shadow-md">
                <span className="text-[9px] text-emerald-400 font-bold uppercase tracking-wider block">Access Level</span>
                <span className="text-white text-xs font-mono font-bold mt-1 block">CLASS-5</span>
              </div>
              <div className="bg-slate-900/60 border border-white/5 rounded-xl p-3 text-center backdrop-blur-sm">
                <span className="text-[9px] text-text-muted font-bold uppercase tracking-wider block">Decrypt Status</span>
                <span className="text-emerald-400 text-xs font-mono font-bold mt-1 block">AES-256</span>
              </div>
              <div className="bg-slate-900/60 border border-white/5 rounded-xl p-3 text-center backdrop-blur-sm">
                <span className="text-[9px] text-text-muted font-bold uppercase tracking-wider block">Audit Log</span>
                <span className="text-emerald-400 text-xs font-mono font-bold mt-1 block">RECORDED</span>
              </div>
              <div className="bg-slate-900/60 border border-white/5 rounded-xl p-3 text-center backdrop-blur-sm">
                <span className="text-[9px] text-text-muted font-bold uppercase tracking-wider block">NID Binding</span>
                <span className="text-emerald-400 text-xs font-mono font-bold mt-1 block">VERIFIED</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header Info */}
      <div className="relative flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8 bg-gradient-to-r from-white/3 via-white/1 to-transparent p-6 rounded-2xl border border-white/5">
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-tr from-primary-500 to-accent rounded-2xl blur opacity-30 group-hover:opacity-50 transition-opacity duration-300" />
          <div className="relative w-28 h-28 rounded-2xl bg-surface-hover/80 border border-white/10 flex items-center justify-center overflow-hidden flex-shrink-0">
            {userObj.profilePicture ? (
              <img
                src={`${API_ORIGIN}${userObj.profilePicture}`}
                alt={profile.fullName}
                className="w-full h-full object-cover"
              />
            ) : (
              <User size={56} className="text-text-muted" />
            )}
          </div>
        </div>

        <div className="flex-1 space-y-4 text-center md:text-left w-full">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 justify-center md:justify-start">
            <h3 className="text-3xl font-extrabold text-white tracking-tight">{profile.fullName}</h3>
            <button
              onClick={handleCopyId}
              title="Click to copy Citizen ID"
              className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-mono font-bold bg-primary-500/10 hover:bg-primary-500/20 text-primary-400 border border-primary-500/25 w-fit mx-auto md:mx-0 shadow-inner cursor-pointer transition-all active:scale-95 group/btn"
            >
              {profile.citizenId}
              {copiedId && (
                <span className="text-[10px] text-success animate-in font-sans">✓ Copied</span>
              )}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-text-muted">
            <div className="flex items-center gap-3 justify-center md:justify-start bg-white/2 px-4 py-2.5 rounded-xl border border-white/5">
              <Mail size={16} className="text-primary-400" />
              <span className="font-medium truncate">{userObj.email || 'N/A'}</span>
            </div>
            <div className="flex items-center gap-3 justify-center md:justify-start bg-white/2 px-4 py-2.5 rounded-xl border border-white/5">
              <Phone size={16} className="text-accent" />
              <span className="font-mono font-medium">{profile.phone}</span>
            </div>
            <div className="flex items-center gap-3 justify-center md:justify-start bg-white/2 px-4 py-2.5 rounded-xl border border-white/5 col-span-1 sm:col-span-2 lg:col-span-1">
              <MapPin size={16} className="text-danger" />
              <span className="font-medium truncate">{profile.address}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center overflow-x-auto gap-2 border-b border-white/5 pb-3 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        <button onClick={() => setActiveTab('profile')} className={tabClass('profile')}>
          <User size={16} /> Profile Info
        </button>
        <button onClick={() => setActiveTab('identity')} className={tabClass('identity')}>
          <Shield size={16} /> Identity Info
        </button>
        <button onClick={() => setActiveTab('academic')} className={tabClass('academic')}>
          <GraduationCap size={16} /> Academic Records
        </button>
        <button onClick={() => setActiveTab('financial')} className={tabClass('financial')}>
          <CreditCard size={16} /> Financial Status
        </button>
        <button onClick={() => setActiveTab('medical')} className={tabClass('medical')}>
          <HeartPulse size={16} /> Medical Records
        </button>
        <button onClick={() => setActiveTab('criminal')} className={tabClass('criminal')}>
          <ShieldAlert size={16} /> Criminal Records
        </button>
        <button onClick={() => setActiveTab('documents')} className={tabClass('documents')}>
          <FileText size={16} /> Documents
        </button>
      </div>

      {/* Tab Panels */}
      <div className="mt-2">
        {/* PROFILE TAB */}
        {activeTab === 'profile' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in">
            {/* Personal Details */}
            <div className="glass-card rounded-2xl p-6 border border-white/5 bg-gradient-to-br from-white/3 to-transparent space-y-5">
              <h4 className="text-xl font-bold text-white flex items-center gap-2 border-b border-white/10 pb-3">
                <User size={20} className="text-primary-400" />
                Personal Details
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: 'Date of Birth', value: profile.dob ? new Date(profile.dob).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A', icon: Calendar, color: 'text-primary-400' },
                  { label: 'Gender', value: profile.gender, icon: User, color: 'text-accent' },
                  { label: 'Blood Group', value: profile.bloodGroup || 'N/A', icon: HeartPulse, color: 'text-danger' },
                  { label: 'Nationality', value: profile.nationality || 'N/A', icon: Globe, color: 'text-success' },
                  { label: 'Marital Status', value: profile.maritalStatus || 'N/A', icon: Heart, color: 'text-warning' },
                  { label: 'Religion', value: profile.religion || 'N/A', icon: Shield, color: 'text-primary-400' }
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 bg-white/2 p-3.5 rounded-xl border border-white/5 hover-glow">
                    <div className={`p-2.5 rounded-lg bg-white/5 ${item.color}`}>
                      <item.icon size={18} />
                    </div>
                    <div>
                      <span className="text-text-muted text-xs block font-semibold">{item.label}</span>
                      <span className="text-white text-sm font-medium">{item.value}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Family & Emergency */}
            <div className="glass-card rounded-2xl p-6 border border-white/5 bg-gradient-to-br from-white/3 to-transparent space-y-5">
              <h4 className="text-xl font-bold text-white flex items-center gap-2 border-b border-white/10 pb-3">
                <Heart size={20} className="text-danger" />
                Family & Emergency
              </h4>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-white/2 p-4 rounded-xl border border-white/5">
                    <span className="text-text-muted text-xs block font-semibold">Father's Name</span>
                    <span className="text-white text-sm font-semibold">{profile.fathersName || 'N/A'}</span>
                  </div>
                  <div className="bg-white/2 p-4 rounded-xl border border-white/5">
                    <span className="text-text-muted text-xs block font-semibold">Mother's Name</span>
                    <span className="text-white text-sm font-semibold">{profile.mothersName || 'N/A'}</span>
                  </div>
                </div>

                <div className="bg-danger/5 border border-danger-500/20 rounded-xl p-5 relative overflow-hidden">
                  <div className="absolute top-0 right-0 bg-danger-500 text-white text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-bl">
                    Emergency Contact
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-danger-500/10 text-danger rounded-xl border border-danger-500/20">
                      <Phone size={24} />
                    </div>
                    <div>
                      <h5 className="text-white font-bold text-base">{profile.emergencyContactName || 'N/A'}</h5>
                      {profile.emergencyContactRelationship && (
                        <span className="text-xs text-text-muted font-medium bg-white/5 px-2 py-0.5 rounded border border-white/5 mt-1 inline-block">
                          Relationship: {profile.emergencyContactRelationship}
                        </span>
                      )}
                      <p className="text-danger-400 font-mono font-bold mt-1 text-base">{profile.emergencyContactNumber || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* IDENTITY TAB */}
        {activeTab === 'identity' && (
          <div className="space-y-6 animate-in">
            <h4 className="text-xl font-bold text-white border-b border-white/10 pb-3 flex items-center gap-2">
              <Shield size={20} className="text-accent" />
              National & Legal Identifiers
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { label: 'National ID (NID)', value: identity.nid, subLabel: identity.nidNameBangla ? `Name (BN): ${identity.nidNameBangla}` : 'NID System', icon: Shield, badge: 'Official Identity', cardColor: 'from-primary-600/10 via-primary-500/5 to-transparent' },
                { label: 'Passport', value: identity.passport, subLabel: identity.passportExpiryDate ? `Expiry: ${new Date(identity.passportExpiryDate).toLocaleDateString()}` : 'International Pass', icon: Globe, badge: 'Travel Doc', cardColor: 'from-accent/10 via-accent/5 to-transparent' },
                { label: 'Driving License', value: identity.drivingLicense, subLabel: identity.drivingLicenseType ? `Type: ${identity.drivingLicenseType}` : 'BRTA Portal', icon: User, badge: 'Permit', cardColor: 'from-success-600/10 via-success-500/5 to-transparent' },
                { label: 'TIN (Tax ID)', value: identity.tin, subLabel: identity.tinCircleZone || 'NBR Circle', icon: CreditCard, badge: 'Tax Registry', cardColor: 'from-warning-600/10 via-warning-500/5 to-transparent' },
                { label: 'Trade License', value: identity.tradeLicense, subLabel: identity.tradeLicenseBusinessName || 'Corporate', icon: Briefcase, badge: 'Business', cardColor: 'from-purple-600/10 via-purple-500/5 to-transparent' },
                { label: 'Land Record Reference', value: identity.landRecord, subLabel: identity.landRecordMouzaThana || 'Mouza Registry', icon: FileCheck, badge: 'Property', cardColor: 'from-teal-600/10 via-teal-500/5 to-transparent' },
                { label: 'Family Card', value: identity.familyCard, subLabel: identity.familyCardMembersCount ? `Members: ${identity.familyCardMembersCount}` : 'Family Registry', icon: Users, badge: 'Family', cardColor: 'from-pink-600/10 via-pink-500/5 to-transparent' },
                { label: 'Farmer Card', value: identity.farmerCard, subLabel: identity.farmerCardType || 'Agriculture Registry', icon: FileText, badge: 'Farmer', cardColor: 'from-amber-600/10 via-amber-500/5 to-transparent' }
              ].map((card, i) => (
                <div key={i} className={`glass-card rounded-2xl p-5 border border-white/10 bg-gradient-to-br ${card.cardColor} hover-glow relative group flex flex-col justify-between min-h-[140px]`}>
                  <div className="absolute top-4 right-4 bg-white/5 border border-white/15 px-2 py-0.5 rounded text-[9px] font-bold text-text-muted tracking-wider uppercase">
                    {card.badge}
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-white/5 text-white/80 group-hover:scale-110 transition-transform duration-300">
                      <card.icon size={20} />
                    </div>
                    <span className="text-text-muted text-xs font-bold uppercase tracking-wider">{card.label}</span>
                  </div>
                  <div className="mt-4 space-y-1">
                    <span className="text-white font-mono font-bold text-lg tracking-wide block truncate">
                      {card.value || 'Not Registered'}
                    </span>
                    <span className="text-text-muted text-xs font-medium block">
                      {card.subLabel}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ACADEMIC TAB */}
        {activeTab === 'academic' && (
          <div className="space-y-6 animate-in">
            <h4 className="text-xl font-bold text-white border-b border-white/10 pb-3 flex items-center gap-2">
              <GraduationCap size={20} className="text-primary-400" />
              Academic History
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* SSC Certificate Card */}
              <div className="glass-card rounded-2xl p-6 border border-white/10 bg-gradient-to-br from-primary-600/10 via-primary-500/5 to-transparent relative overflow-hidden group hover-glow">
                <div className="absolute -right-8 -bottom-8 opacity-5 text-white group-hover:scale-110 transition-transform duration-300">
                  <GraduationCap size={120} />
                </div>
                <div className="flex justify-between items-center border-b border-white/10 pb-3 mb-4">
                  <h5 className="font-bold text-white text-base">Secondary School Certificate (SSC)</h5>
                  <span className="text-xs px-3 py-1 rounded-full bg-success/20 text-success border border-success/30 font-bold">
                    GPA: {education.sscGpa || 'N/A'}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm text-text-muted">
                  <div>
                    <span className="text-xs font-semibold block uppercase tracking-wider">Roll / Registration</span>
                    <p className="text-white font-mono font-medium">{education.sscRoll || 'N/A'} / {education.sscReg || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-xs font-semibold block uppercase tracking-wider">Group / Board</span>
                    <p className="text-white font-medium">{education.sscGroup || 'N/A'} / {education.sscBoard || 'N/A'}</p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-xs font-semibold block uppercase tracking-wider">Institution</span>
                    <p className="text-white font-medium">{education.sscInstitution || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* HSC Certificate Card */}
              <div className="glass-card rounded-2xl p-6 border border-white/10 bg-gradient-to-br from-accent-600/10 via-accent-500/5 to-transparent relative overflow-hidden group hover-glow">
                <div className="absolute -right-8 -bottom-8 opacity-5 text-white group-hover:scale-110 transition-transform duration-300">
                  <Award size={120} />
                </div>
                <div className="flex justify-between items-center border-b border-white/10 pb-3 mb-4">
                  <h5 className="font-bold text-white text-base">Higher Secondary Certificate (HSC)</h5>
                  <span className="text-xs px-3 py-1 rounded-full bg-success/20 text-success border border-success/30 font-bold">
                    GPA: {education.hscGpa || 'N/A'}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm text-text-muted">
                  <div>
                    <span className="text-xs font-semibold block uppercase tracking-wider">Roll / Registration</span>
                    <p className="text-white font-mono font-medium">{education.hscRoll || 'N/A'} / {education.hscReg || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-xs font-semibold block uppercase tracking-wider">Group / Board</span>
                    <p className="text-white font-medium">{education.hscGroup || 'N/A'} / {education.hscBoard || 'N/A'}</p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-xs font-semibold block uppercase tracking-wider">Institution</span>
                    <p className="text-white font-medium">{education.hscInstitution || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* University Profile Card */}
              {education.university && (
                <div className="glass-card rounded-2xl p-6 border border-white/10 bg-gradient-to-br from-teal-600/10 via-teal-500/5 to-transparent relative overflow-hidden group md:col-span-2 hover-glow">
                  <div className="absolute -right-8 -bottom-8 opacity-5 text-white group-hover:scale-110 transition-transform duration-300">
                    <BookOpen size={120} />
                  </div>
                  <div className="flex justify-between items-center border-b border-white/10 pb-3 mb-4">
                    <div className="space-y-0.5">
                      <h5 className="font-bold text-white text-base">Tertiary Education</h5>
                      <p className="text-xs text-text-muted font-medium">{education.university}</p>
                    </div>
                    <span className="text-xs px-3 py-1 rounded-full bg-success/20 text-success border border-success/30 font-bold">
                      CGPA: {education.cgpa || 'N/A'}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-text-muted">
                    <div>
                      <span className="text-xs font-semibold block uppercase tracking-wider">Degree & Department</span>
                      <p className="text-white font-bold">{education.degree}</p>
                      <p className="text-xs text-text-muted mt-0.5">{education.universityDepartment || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-xs font-semibold block uppercase tracking-wider">Student ID</span>
                      <p className="text-white font-mono font-medium">{education.universityStudentId || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-xs font-semibold block uppercase tracking-wider">Enrollment & Graduation</span>
                      <p className="text-white">Graduation: {education.graduationYear || 'N/A'}</p>
                      <p className="text-xs text-text-muted">Enrolled: {education.universityEnrollmentYear || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* FINANCIAL TAB */}
        {activeTab === 'financial' && (
          <div className="space-y-6 animate-in">
            <h4 className="text-xl font-bold text-white border-b border-white/10 pb-3 flex items-center gap-2">
              <CreditCard size={20} className="text-accent" />
              Financial & Tax Records
            </h4>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Employment details */}
              <div className="glass-card rounded-2xl p-6 border border-white/10 bg-gradient-to-br from-white/3 to-transparent space-y-5 hover-glow">
                <h5 className="font-bold text-white flex items-center gap-2 border-b border-white/5 pb-2">
                  <Briefcase size={16} className="text-primary-400" />
                  Employment Status
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-text-muted">
                  <div className="bg-white/2 p-3.5 rounded-xl border border-white/5">
                    <span className="text-xs font-semibold block uppercase tracking-wider">Occupation</span>
                    <p className="text-white font-bold text-base mt-0.5">{financial.occupation || 'N/A'}</p>
                  </div>
                  <div className="bg-white/2 p-3.5 rounded-xl border border-white/5">
                    <span className="text-xs font-semibold block uppercase tracking-wider">Employment Status</span>
                    <p className="text-white font-bold text-base mt-0.5">{financial.employmentStatus || 'N/A'}</p>
                  </div>
                  <div className="col-span-1 sm:col-span-2 bg-white/2 p-3.5 rounded-xl border border-white/5">
                    <span className="text-xs font-semibold block uppercase tracking-wider">Company / Organization</span>
                    <p className="text-white font-semibold text-base mt-0.5">{financial.companyName || 'N/A'}</p>
                  </div>
                  <div className="bg-white/2 p-3.5 rounded-xl border border-white/5">
                    <span className="text-xs font-semibold block uppercase tracking-wider">Work Experience</span>
                    <p className="text-white font-semibold mt-0.5">{financial.workExperience || 'N/A'}</p>
                  </div>
                  <div className="bg-white/2 p-3.5 rounded-xl border border-white/5">
                    <span className="text-xs font-semibold block uppercase tracking-wider">Bank Details</span>
                    <p className="text-white font-bold truncate mt-0.5">{financial.bankNameBranch || 'N/A'}</p>
                    <p className="text-xs font-mono text-text-muted mt-0.5 truncate">{financial.bankAccountNumber || ''}</p>
                  </div>
                </div>
              </div>

              {/* Tax & Income Status */}
              <div className="glass-card rounded-2xl p-6 border border-white/10 bg-gradient-to-br from-white/3 to-transparent space-y-5 hover-glow">
                <h5 className="font-bold text-white flex items-center gap-2 border-b border-white/5 pb-2">
                  <TrendingUp size={16} className="text-success" />
                  Tax Clearance & Income
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-text-muted">
                  <div className="bg-success/5 border border-success-500/20 p-4 rounded-xl">
                    <span className="text-xs font-semibold block uppercase tracking-wider text-success/80">Monthly Income</span>
                    <p className="text-success font-black text-2xl mt-1">৳{financial.monthlyIncome?.toLocaleString() || '0'}</p>
                  </div>
                  <div className="bg-white/2 p-4 rounded-xl border border-white/5">
                    <span className="text-xs font-semibold block uppercase tracking-wider">Primary Income Source</span>
                    <p className="text-white font-bold text-base mt-1">{financial.primaryIncomeSource || 'N/A'}</p>
                  </div>

                  <div className="col-span-1 sm:col-span-2 bg-white/2 p-4 rounded-xl border border-white/5 space-y-2">
                    <span className="text-xs font-semibold block uppercase tracking-wider">e-TIN Compliance</span>
                    <div className="flex items-center justify-between border-t border-white/5 pt-2 mt-1">
                      <span className="text-xs">Tax Compliance Status:</span>
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                        financial.taxClearanceStatus === 'Compliant / Up-to-Date'
                          ? 'bg-success/15 text-success border border-success/20'
                          : 'bg-warning/15 text-warning border border-warning/20'
                      }`}>
                        {financial.taxClearanceStatus === 'Compliant / Up-to-Date' ? '● Compliant' : '● Action Required'}
                      </span>
                    </div>
                  </div>

                  <div className="bg-white/2 p-3.5 rounded-xl border border-white/5">
                    <span className="text-xs font-semibold block uppercase tracking-wider">Last Return Submission</span>
                    <p className="text-white font-semibold mt-0.5">{financial.lastReturnSubmissionDate || 'N/A'}</p>
                  </div>
                  <div className="bg-white/2 p-3.5 rounded-xl border border-white/5">
                    <span className="text-xs font-semibold block uppercase tracking-wider">Total Tax Paid (FY)</span>
                    <p className="text-white font-bold mt-0.5">৳{financial.totalTaxPaid?.toLocaleString() || '0'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MEDICAL TAB */}
        {activeTab === 'medical' && (
          <div className="space-y-6 animate-in">
            <h4 className="text-xl font-bold text-white border-b border-white/10 pb-3 flex items-center gap-2">
              <HeartPulse size={20} className="text-danger" />
              Medical Health Profile
            </h4>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Health conditions */}
              <div className="glass-card rounded-2xl p-6 border border-white/10 bg-gradient-to-br from-white/3 to-transparent space-y-5 hover-glow">
                <h5 className="font-bold text-white flex items-center gap-2 border-b border-white/5 pb-2">
                  <Activity size={16} className="text-danger" />
                  Vital Health Records
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-text-muted">
                  <div className="bg-danger/5 border border-danger-500/20 p-4 rounded-xl flex items-center gap-3">
                    <div className="p-2 bg-danger-500/10 text-danger rounded-lg">
                      <Heart size={20} />
                    </div>
                    <div>
                      <span className="text-xs font-semibold block uppercase tracking-wider text-danger/80">Blood Type</span>
                      <p className="text-danger font-black text-2xl mt-0.5">{medical.bloodType || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="bg-white/2 p-4 rounded-xl border border-white/5">
                    <span className="text-xs font-semibold block uppercase tracking-wider">Immunization Status</span>
                    <p className="text-white font-bold text-base mt-1.5">{medical.immunizationStatus || 'N/A'}</p>
                  </div>
                  <div className="col-span-1 sm:col-span-2 bg-white/2 p-3.5 rounded-xl border border-white/5">
                    <span className="text-xs font-semibold block uppercase tracking-wider">Drug & Dietary Allergies</span>
                    <p className="text-white font-medium mt-1">{medical.allergies || 'None Reported'}</p>
                  </div>
                  <div className="col-span-1 sm:col-span-2 bg-white/2 p-3.5 rounded-xl border border-white/5">
                    <span className="text-xs font-semibold block uppercase tracking-wider">Chronic Medical Conditions</span>
                    <p className="text-white font-medium mt-1">{medical.chronicConditions || 'None Reported'}</p>
                  </div>
                  <div className="col-span-1 sm:col-span-2 bg-white/2 p-3.5 rounded-xl border border-white/5">
                    <span className="text-xs font-semibold block uppercase tracking-wider">Health Insurance</span>
                    <p className="text-white font-bold mt-1">{medical.insuranceProvider || 'No Insurance Profile'}</p>
                    {medical.insurancePolicyNumber && <p className="text-xs text-text-muted font-mono mt-0.5">Policy: {medical.insurancePolicyNumber}</p>}
                  </div>
                </div>
              </div>

              {/* Hospital visit logs */}
              <div className="glass-card rounded-2xl p-6 border border-white/10 bg-gradient-to-br from-white/3 to-transparent space-y-4 hover-glow">
                <h5 className="font-bold text-white flex items-center gap-2 border-b border-white/5 pb-2">
                  <FileText size={16} className="text-primary-400" />
                  Hospital Visit Logs
                </h5>
                {visitLogs.length === 0 ? (
                  <div className="py-12 text-center bg-white/2 rounded-xl border border-white/5 border-dashed">
                    <p className="text-sm text-text-muted">No hospital visits recorded.</p>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-[360px] overflow-y-auto pr-1 timeline-scrollbar">
                    {visitLogs.map((log: any) => (
                      <div key={log.id} className="bg-white/2 hover:bg-white/5 transition-all border border-white/5 rounded-xl p-4 space-y-3 relative group">
                        <div className="flex justify-between items-start border-b border-white/5 pb-1.5">
                          <span className="text-[11px] text-primary-400 font-mono font-bold bg-primary-500/10 px-2 py-0.5 rounded border border-primary-500/20">
                            {new Date(log.visitDate).toLocaleDateString()}
                          </span>
                          <span className="text-xs text-accent font-semibold flex items-center gap-1">
                            👨‍⚕️ {log.doctorName}
                          </span>
                        </div>
                        <div>
                          <h6 className="text-sm font-bold text-white">{log.hospitalName}</h6>
                          {log.reason && <p className="text-xs text-text-muted mt-1 leading-normal">Reason: {log.reason}</p>}
                        </div>

                        <div className="flex gap-3 border-t border-white/5 pt-2 mt-2">
                          {log.prescriptionPic && (
                            <button
                              type="button"
                              onClick={() => setPreviewImage(`${API_ORIGIN}${log.prescriptionPic}`)}
                              className="text-xs text-primary-400 hover:text-primary-300 font-bold inline-flex items-center gap-1 hover:underline cursor-pointer bg-transparent border-0 p-0"
                            >
                              👁️ View Prescription
                            </button>
                          )}
                          {log.prescriptionPdf && (
                            <a
                              href={`${API_ORIGIN}${log.prescriptionPdf}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-primary-400 hover:text-primary-300 font-bold inline-flex items-center gap-1 hover:underline"
                            >
                              📄 Download PDF
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* CRIMINAL TAB */}
        {activeTab === 'criminal' && (
          <div className="space-y-6 animate-in">
            <h4 className="text-xl font-bold text-white border-b border-white/10 pb-3 flex items-center gap-2">
              <ShieldAlert size={20} className="text-danger" />
              Law Enforcement & Criminal Records
            </h4>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Criminal Status Card */}
              <div className="glass-card rounded-2xl p-6 border border-white/10 bg-gradient-to-br from-white/3 to-transparent space-y-5 lg:col-span-1 hover-glow">
                <h5 className="font-bold text-white border-b border-white/5 pb-2">
                  Background Check Status
                </h5>
                <div className="space-y-4 text-sm text-text-muted">
                  <div className="bg-white/2 p-4 rounded-xl border border-white/5 text-center">
                    <span className="text-xs font-semibold block uppercase tracking-wider">Has Criminal Record</span>
                    <div className="mt-3 flex justify-center">
                      <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold border ${
                        crime.hasCriminalRecord
                          ? 'bg-danger/15 text-danger border-danger-500/20'
                          : 'bg-success/15 text-success border-success-500/20'
                      }`}>
                        {crime.hasCriminalRecord ? <AlertCircle size={18} /> : <CheckCircle size={18} />}
                        {crime.hasCriminalRecord ? 'Yes (Record Found)' : 'No (Clear Record)'}
                      </span>
                    </div>
                  </div>
                  <div className="bg-white/2 p-3.5 rounded-xl border border-white/5">
                    <span className="text-xs font-semibold block uppercase tracking-wider">Clearance Status</span>
                    <p className="text-white font-bold text-base mt-1">{crime.clearanceStatus || 'N/A'}</p>
                  </div>
                  <div className="bg-white/2 p-3.5 rounded-xl border border-white/5">
                    <span className="text-xs font-semibold block uppercase tracking-wider">Clearance Certificate</span>
                    <p className="text-white font-mono font-medium mt-1 truncate">{crime.clearanceCertificateNumber || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Fines and Offenses logs */}
              <div className="space-y-6 lg:col-span-2">
                <div className="glass-card rounded-2xl p-6 border border-white/10 bg-gradient-to-br from-white/3 to-transparent space-y-4 hover-glow">
                  <h5 className="font-bold text-white border-b border-white/5 pb-2">
                    Fines Issued
                  </h5>
                  {fineLogs.length === 0 ? (
                    <div className="py-6 text-center bg-white/2 rounded-xl border border-white/5 border-dashed">
                      <p className="text-sm text-text-muted">No fines issued.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[220px] overflow-y-auto pr-1 timeline-scrollbar">
                      {fineLogs.map((fine: any) => (
                        <div key={fine.id} className="bg-white/2 border border-white/5 rounded-xl p-4 flex justify-between items-center text-sm">
                          <div className="space-y-1">
                            <span className="text-[10px] text-text-muted font-mono font-bold bg-white/5 px-2 py-0.5 rounded border border-white/10">
                              {new Date(fine.fineDate).toLocaleDateString()}
                            </span>
                            <p className="text-white font-bold leading-snug mt-1">{fine.fineReason}</p>
                            {fine.clearanceNotes && <p className="text-xs text-text-muted italic">{fine.clearanceNotes}</p>}
                          </div>
                          <div className="text-right ml-4 shrink-0">
                            <span className="text-white font-extrabold text-base block">৳{fine.fineAmount}</span>
                            <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wide mt-1.5 ${
                              fine.isCleared ? 'bg-success/15 text-success border border-success/20' : 'bg-danger/15 text-danger border border-danger/20'
                            }`}>
                              {fine.isCleared ? 'Paid' : 'Unpaid'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="glass-card rounded-2xl p-6 border border-white/10 bg-gradient-to-br from-white/3 to-transparent space-y-4 hover-glow">
                  <h5 className="font-bold text-white border-b border-white/5 pb-2">
                    Criminal Offense Logs
                  </h5>
                  {crimeLogs.length === 0 ? (
                    <div className="py-6 text-center bg-white/2 rounded-xl border border-white/5 border-dashed">
                      <p className="text-sm text-text-muted">No criminal offense logs.</p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1 timeline-scrollbar">
                      {crimeLogs.map((cLog: any) => (
                        <div key={cLog.id} className="bg-white/2 border border-white/5 rounded-xl p-4 text-sm space-y-2">
                          <div className="flex justify-between items-center border-b border-white/5 pb-1.5">
                            <span className="text-[10px] text-text-muted font-mono font-bold bg-white/5 px-2 py-0.5 rounded border border-white/10">
                              {new Date(cLog.crimeDate).toLocaleDateString()}
                            </span>
                            <span className={`px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wide ${
                              cLog.severity === 'Felony' ? 'bg-danger/15 text-danger border border-danger/25' : 'bg-warning/15 text-warning border border-warning/25'
                            }`}>
                              {cLog.severity}
                            </span>
                          </div>
                          <p className="text-white font-bold text-base leading-snug">{cLog.offense}</p>
                          <div className="flex flex-wrap items-center gap-3 text-xs text-text-muted">
                            <span>Case Number: <span className="font-mono text-white font-medium">{cLog.caseNumber}</span></span>
                          </div>
                          {cLog.details && (
                            <p className="text-xs text-text-muted italic bg-white/2 p-2.5 rounded border border-white/5 leading-relaxed">
                              "{cLog.details}"
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* DOCUMENTS TAB */}
        {activeTab === 'documents' && (
          <div className="space-y-6 animate-in">
            <h4 className="text-xl font-bold text-white border-b border-white/10 pb-3 flex items-center gap-2">
              <FileText size={20} className="text-primary-400" />
              Uploaded Files & Attachments
            </h4>
            {documents.length === 0 ? (
              <div className="py-12 text-center bg-white/2 rounded-2xl border border-white/5 border-dashed">
                <FileText size={48} className="mx-auto mb-3 opacity-30 text-text-muted" />
                <p className="text-sm text-text-muted">No documents uploaded.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {documents.map((doc: any) => (
                  <div key={doc.id} className="glass-card rounded-2xl p-5 border border-white/10 bg-gradient-to-br from-white/3 to-transparent flex items-center justify-between hover-glow">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 bg-primary-500/10 text-primary-400 rounded-xl border border-primary-500/20">
                        <FileText size={24} />
                      </div>
                      <div>
                        <p className="text-white font-bold text-sm tracking-wide">{doc.type}</p>
                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider mt-1 ${
                          doc.status === 'Verified' ? 'text-success' : 'text-warning'
                        }`}>
                          {doc.status === 'Verified' ? '✓ Verified' : '⧗ Pending Review'}
                        </span>
                      </div>
                    </div>
                    <a
                      href={`${API_ORIGIN}${doc.fileUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 bg-white/5 hover:bg-primary-600 rounded-xl text-text-muted hover:text-white border border-white/5 hover:border-primary-500 transition-all cursor-pointer"
                      title="Download/View File"
                    >
                      <Download size={18} />
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Image Preview Modal */}
      {previewImage && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="relative max-w-3xl w-full bg-slate-900 border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col animate-in">
            <div className="flex justify-between items-center p-4 border-b border-white/10">
              <h3 className="text-sm font-semibold text-white">Prescription</h3>
              <button
                onClick={() => setPreviewImage(null)}
                className="text-text-muted hover:text-white cursor-pointer text-sm font-bold bg-transparent border-0 p-1"
              >
                ✕ Close
              </button>
            </div>
            <div className="p-4 flex justify-center items-center overflow-auto max-h-[80vh]">
              <img
                src={previewImage}
                alt="Prescription"
                className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-inner"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
