import CorrectionAssistant from '../components/CorrectionAssistant';
import ChangeRequestsView from '../components/ChangeRequestsView';
import type { ChangeCategory } from '../lib/changeRequests';
import { parseRequestedData } from '../lib/consent';
import { useEffect, useState, useCallback } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { Home, User, FileText, Shield, Bell, Clock, CheckCircle, XCircle, Upload, Eye, ShieldAlert, FileWarning, AlertCircle, ChevronDown, ChevronUp, Activity } from 'lucide-react';
import api, { API_ORIGIN } from '../lib/axios';
import { Routes, Route, Navigate, useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { useNotificationStore } from '../store/useNotificationStore';
import { useTranslation } from '../store/useSettingsStore';

const renderStatusBadge = (status: string | undefined, hasValue: boolean) => {
  if (!hasValue) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs rounded-full font-medium bg-white/5 text-text-muted border border-white/10 shrink-0">
        - Unverified
      </span>
    );
  }
  const displayStatus = status || 'Pending Review';
  let classes = 'bg-white/5 text-text-muted border border-white/10';
  if (displayStatus === 'Verified') {
    classes = 'bg-success/10 text-success border border-success/20 shadow-[0_0_8px_rgba(34,197,94,0.15)]';
  } else if (displayStatus === 'Pending Review' || displayStatus === 'Pending') {
    classes = 'bg-warning/10 text-warning border border-warning/20 shadow-[0_0_8px_rgba(245,158,11,0.15)]';
  } else if (displayStatus === 'Failed') {
    classes = 'bg-danger/10 text-danger border border-danger/20 shadow-[0_0_8px_rgba(239,68,68,0.15)]';
  }
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-xs rounded-full font-medium shrink-0 ${classes}`}>
      {displayStatus === 'Verified' ? '✓ ' : displayStatus === 'Failed' ? '✕ ' : '- '}
      {displayStatus}
    </span>
  );
};

const ConsentCard = ({ req, duration, onDurationChange, onConsent, onRevoke }: {
  req: any;
  duration: number;
  onDurationChange: (minutes: number) => void;
  onConsent: (status: 'Approved' | 'Rejected', durationMinutes?: number) => void;
  onRevoke: () => void;
}) => (
  <div className="bg-surface border border-white/5 p-5 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-surface-hover/50 hover:border-white/10 transition-all duration-300">
    <div className="flex-1">
      <p className="text-white font-medium">{req.requester.role.replace(/([A-Z])/g, ' $1').trim()}</p>
      <p className="text-xs text-text-muted mt-0.5">{req.requester.email}</p>
      <p className="text-sm text-text-muted mt-2">
        <span className="text-primary-400 font-medium">Requested:</span> {parseRequestedData(req.requestedData)}
      </p>
      <div className="flex items-center gap-2 mt-2">
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-full font-medium ${
          req.status === 'Pending' ? 'bg-warning/15 text-warning border border-warning/20' :
          req.status === 'Approved' ? 'bg-success/15 text-success border border-success/20' :
          'bg-danger/15 text-danger border border-danger/20'
        }`}>
          {req.status === 'Pending' && <Clock size={12} />}
          {req.status === 'Approved' && <CheckCircle size={12} />}
          {req.status === 'Rejected' && <XCircle size={12} />}
          {req.status}
        </span>
        <span className="text-xs text-text-muted flex flex-wrap items-center gap-1.5">
          <span>Requested: {new Date(req.createdAt).toLocaleString()}</span>
          {req.expiryTime && (
            <>
              <span className="opacity-40">|</span>
              <span className={req.status === 'Expired' ? 'text-danger/90 font-medium' : 'text-success/90 font-medium'}>
                {req.status === 'Expired' ? 'Expired' : 'Expires'}: {new Date(req.expiryTime).toLocaleString()}
              </span>
            </>
          )}
        </span>
      </div>
    </div>

    {req.status === 'Pending' && (
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0 w-full sm:w-auto">
        <div className="flex items-center gap-2">
          <label className="text-xs text-text-muted font-medium">Duration:</label>
          <select
            value={duration}
            onChange={(e) => onDurationChange(parseInt(e.target.value))}
            className="bg-background border border-white/10 rounded-lg px-2 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary-500 cursor-pointer"
          >
            <option value="60">1 Hour</option>
            <option value="1440">24 Hours</option>
            <option value="10080">7 Days</option>
            <option value="43200">1 Month</option>
          </select>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => onConsent('Approved', duration)}
            className="flex-1 sm:flex-none px-4 py-2 bg-success/15 text-success hover:bg-success/25 border border-success/25 rounded-lg transition-all duration-200 text-sm font-medium hover:scale-[1.02]"
          >
            Approve
          </button>
          <button
            onClick={() => onConsent('Rejected')}
            className="flex-1 sm:flex-none px-4 py-2 bg-danger/15 text-danger hover:bg-danger/25 border border-danger/25 rounded-lg transition-all duration-200 text-sm font-medium hover:scale-[1.02]"
          >
            Reject
          </button>
        </div>
      </div>
    )}

    {req.status === 'Approved' && (!req.expiryTime || new Date(req.expiryTime) > new Date()) && (
      <div className="shrink-0 w-full sm:w-auto text-right">
        <button
          onClick={onRevoke}
          className="w-full sm:w-auto px-4 py-2 bg-danger/15 text-danger hover:bg-danger/25 border border-danger/25 rounded-lg transition-all duration-200 text-sm font-medium hover:scale-[1.02] cursor-pointer"
        >
          Remove Access
        </button>
      </div>
    )}
  </div>
);

const CitizenDashboard = () => {
  const { user, updateProfilePicture } = useAuthStore();
  const { t, lang } = useTranslation();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [requests, setRequests] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadingProfilePic, setUploadingProfilePic] = useState(false);

  const { readIds, markAsRead, markAllRead: storeMarkAllRead } = useNotificationStore();
  const [copiedId, setCopiedId] = useState(false);

  const handleCopyId = () => {
    const id = profile?.citizenId || user?.citizenProfile?.citizenId;
    if (!id) return;
    navigator.clipboard.writeText(id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const markAllRead = () => {
    const allIds = notifications.map(n => n.id);
    storeMarkAllRead(allIds);
  };

  // Profile Form States
  const [profileTab, setProfileTab] = useState<'basic' | 'identity' | 'education' | 'financial' | 'medical' | 'crime'>('basic');
  const [openAccordions, setOpenAccordions] = useState<Record<string, boolean>>({
    nid: true,
    passport: false,
    drivingLicense: false,
    tradeLicense: false,
    tin: false,
    landRecord: false,
    familyCard: false,
    farmerCard: false
  });

  const fineLogs: any[] = profile?.crimeInfo?.fineLogs ?? [];
  const crimeLogs: any[] = profile?.crimeInfo?.crimeLogs ?? [];

  // Support Chat Portal States
  const [supportOpen, setSupportOpen] = useState(false);
  const [chatTab, setChatTab] = useState<'assistant' | 'support'>('assistant');
  const [assistantCategory, setAssistantCategory] = useState<ChangeCategory>();

  function openCorrectionAssistant(category?: ChangeCategory) {
    setAssistantCategory(category);
    setChatTab('assistant');
    setSupportOpen(true);
  }
  const [supportMessages, setSupportMessages] = useState<any[]>([]);
  const [newSupportMessage, setNewSupportMessage] = useState('');
  const [supportUnread, setSupportUnread] = useState(false);

  // Document Upload States
  const [docType, setDocType] = useState('NID');
  const [docFile, setDocFile] = useState<File | null>(null);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Hospital Visit Log States
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const [profileRes, requestsRes, alertsRes] = await Promise.all([
        api.get('/citizen/profile'),
        api.get('/consent/requests'),
        api.get('/citizen/alerts')
      ]);
      setProfile(profileRes.data);
      setRequests(requestsRes.data);
      setNotifications(alertsRes.data);
    } catch {
      console.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const fetchSupportMessages = useCallback(async () => {
    try {
      const res = await api.get('/citizen/support-messages');
      setSupportMessages(res.data);

      const statusHeader = res.headers['x-support-status'];
      if (statusHeader) {
        setProfile((prev: any) => prev ? {
          ...prev,
          user: {
            ...prev.user,
            supportStatus: statusHeader
          }
        } : null);
      }

      if (!supportOpen && res.data.length > 0) {
        const lastMsg = res.data[res.data.length - 1];
        if (lastMsg.sender.role === 'Admin') {
          const lastSeenId = localStorage.getItem('lastSeenSupportMsgId');
          if (lastSeenId !== lastMsg.id) {
            setSupportUnread(true);
          }
        }
      }
      if (supportOpen && res.data.length > 0) {
        const lastMsg = res.data[res.data.length - 1];
        localStorage.setItem('lastSeenSupportMsgId', lastMsg.id);
        setSupportUnread(false);
      }
    } catch (err) {
      console.error('Failed to fetch support messages:', err);
    }
  }, [supportOpen]);

  const handleSendSupportMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSupportMessage.trim()) return;
    try {
      const res = await api.post('/citizen/support-messages', { message: newSupportMessage });
      setSupportMessages([...supportMessages, res.data]);
      setNewSupportMessage('');

      setProfile((prev: any) => prev ? {
        ...prev,
        user: {
          ...prev.user,
          supportStatus: 'Open'
        }
      } : null);

      setTimeout(() => {
        const chatContainer = document.getElementById('support-chat-messages');
        if (chatContainer) chatContainer.scrollTop = chatContainer.scrollHeight;
      }, 50);
    } catch (err) {
      console.error('Failed to send support message:', err);
    }
  };

  useEffect(() => {
    if (supportOpen) {
      fetchSupportMessages();
      setSupportUnread(false);
      setTimeout(() => {
        const chatContainer = document.getElementById('support-chat-messages');
        if (chatContainer) chatContainer.scrollTop = chatContainer.scrollHeight;
      }, 100);
    }
  }, [supportOpen, fetchSupportMessages]);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const [requestsRes, alertsRes] = await Promise.all([
          api.get('/consent/requests'),
          api.get('/citizen/alerts')
        ]);
        setRequests(requestsRes.data);
        setNotifications(alertsRes.data);
        await fetchSupportMessages();
      } catch (e) {
        console.error('Failed to poll updates', e);
      }
    }, 10000);
    return () => clearInterval(interval);
  }, [supportOpen, supportMessages.length, fetchSupportMessages]);

  const [selectedDurations, setSelectedDurations] = useState<Record<string, number>>({});

  const handleConsent = async (requestId: string, status: string, customDuration?: number) => {
    try {
      await api.post('/consent/respond', {
        requestId,
        status,
        durationMinutes: status === 'Approved' ? (customDuration || 60) : undefined
      });
      await fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to respond to the consent request');
    }
  };

  const handleRevokeConsent = async (requestId: string) => {
    try {
      await api.post('/consent/revoke', { requestId });
      await fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to remove access');
    }
  };

  const handleProfilePicUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file (PNG, JPG, WEBP).');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      alert('Image file size must be 2MB or smaller.');
      return;
    }

    const formData = new FormData();
    formData.append('profilePic', file);

    setUploadingProfilePic(true);
    try {
      const response = await api.post('/auth/profile-picture', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      updateProfilePicture(response.data.profilePicture);
      await fetchData();
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'Failed to upload profile picture';
      alert(errMsg);
    } finally {
      setUploadingProfilePic(false);
    }
  };

  const handleUploadDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docFile) {
      setUploadMessage({ type: 'error', text: 'Please select a file to upload' });
      return;
    }
    setUploadingDoc(true);
    setUploadMessage(null);
    try {
      const formData = new FormData();
      formData.append('document', docFile);
      formData.append('type', docType);

      await api.post('/documents/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setUploadMessage({ type: 'success', text: 'Document uploaded successfully!' });
      setDocFile(null);
      const fileInput = document.getElementById('doc-file-input') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      await fetchData();
    } catch (err: any) {
      setUploadMessage({ type: 'error', text: err.response?.data?.message || 'Failed to upload document' });
    } finally {
      setUploadingDoc(false);
    }
  };

  const renderMedicalInfo = () => (
    <div className="space-y-6 animate-fade-in text-left">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-white">{lang === 'en' ? 'Medical & Health Profile' : 'চিকিৎসা ও স্বাস্থ্য প্রোফাইল'}</h3>
        <button type="button" onClick={() => openCorrectionAssistant('MEDICAL')} className="px-4 py-2 bg-primary-600/20 hover:bg-primary-500 text-primary-400 hover:text-white border border-primary-500/30 rounded-xl text-sm font-medium transition-all cursor-pointer">
          {t('requestcorrection', 'Request correction')}
        </button>
      </div>

      <div className="space-y-8">
        {/* Card 1: General Health & Allergies */}
        <div className="glass-card p-6 border border-white/5 rounded-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <h4 className="text-base font-semibold text-white flex items-center gap-2">
              <span>🩸</span> {lang === 'en' ? 'General Health & Allergies' : 'সাধারণ স্বাস্থ্য ও অ্যালার্জি'}
            </h4>
            {renderStatusBadge(profile?.medicalInfo?.status, !!profile?.medicalInfo?.bloodType)}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { label: lang === 'en' ? 'Blood Group / Type' : 'রক্তের গ্রুপ / ধরন', value: profile?.medicalInfo?.bloodType },
                { label: lang === 'en' ? 'Allergies & Sensitivities' : 'অ্যালার্জি ও সংবেদনশীলতা', value: profile?.medicalInfo?.allergies },
                { label: lang === 'en' ? 'Chronic Medical Conditions' : 'দীর্ঘস্থায়ী স্বাস্থ্য সমস্যা', value: profile?.medicalInfo?.chronicConditions }
              ].map(item => (
                <div key={item.label} className="bg-surface/50 border border-white/5 rounded-xl p-4">
                  <p className="text-[10px] text-text-muted uppercase tracking-wider font-semibold mb-1">{item.label}</p>
                  <p className="text-white font-medium text-sm">{item.value || (lang === 'en' ? 'None Declared / Not Provided' : 'উল্লেখ করা হয়নি')}</p>
                </div>
              ))}
            </div>
        </div>

        {/* Card 2: Medical History & Insurance Details */}
        <div className="glass-card p-6 border border-white/5 rounded-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <h4 className="text-base font-semibold text-white flex items-center gap-2">
              <span>📋</span> {lang === 'en' ? 'Medical History & Insurance Details' : 'চিকিৎসার ইতিহাস ও বীমা বিবরণ'}
            </h4>
            {renderStatusBadge(profile?.medicalInfo?.status, !!profile?.medicalInfo?.medicalHistory)}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { label: lang === 'en' ? 'Past Medical History' : 'পূর্ববর্তী চিকিৎসার ইতিহাস', value: profile?.medicalInfo?.medicalHistory },
                { label: lang === 'en' ? 'Immunization Status' : 'টিকাদানের অবস্থা', value: profile?.medicalInfo?.immunizationStatus },
                { label: lang === 'en' ? 'Insurance Provider' : 'বীমা প্রদানকারী', value: profile?.medicalInfo?.insuranceProvider },
                { label: lang === 'en' ? 'Policy Number' : 'পলিসি নম্বর', value: profile?.medicalInfo?.insurancePolicyNumber }
              ].map(item => (
                <div key={item.label} className="bg-surface/50 border border-white/5 rounded-xl p-4">
                  <p className="text-[10px] text-text-muted uppercase tracking-wider font-semibold mb-1">{item.label}</p>
                  <p className="text-white font-medium text-sm">{item.value || (lang === 'en' ? 'Not Provided' : 'প্রদান করা হয়নি')}</p>
                </div>
              ))}
            </div>
        </div>

      </div>

      {/* Hospital Visit Logs Section */}
      <div className="border-t border-white/10 pt-8 mt-8 space-y-6">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🏥</span>
          <h4 className="text-lg font-semibold text-white">{t('hospitalvisitlogs', 'Hospital Visit Logs')}</h4>
        </div>

        {/* Timeline View of Visit Logs */}
        <div className="space-y-4">
          {!profile?.medicalInfo?.visitLogs || profile.medicalInfo.visitLogs.length === 0 ? (
            <div className="text-center py-8 text-text-muted bg-surface/20 border border-white/5 rounded-2xl">
              <p className="text-sm">{t('novisitlogs', 'No hospital visit logs found.')}</p>
            </div>
          ) : (
            <div className="relative border-l-2 border-white/10 pl-6 ml-3 space-y-6">
              {profile.medicalInfo.visitLogs.map((log: any) => (
                <div key={log.id} className="relative group">
                  {/* Bullet point icon */}
                  <span className="absolute -left-[31px] top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-slate-900 border-2 border-primary-500 shadow-sm" />

                  <div className="glass-card p-5 border border-white/5 rounded-2xl hover:bg-surface-hover/50 hover:border-white/10 transition-all duration-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-primary-400 font-mono">
                          {new Date(log.visitDate).toLocaleDateString(lang === 'en' ? 'en-US' : 'bn-BD', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                      <h5 className="text-white font-semibold text-sm">{log.hospitalName}</h5>
                      <p className="text-xs text-text-muted">
                        <span className="font-semibold text-text-muted">{t('doctorname', 'Doctor Name')}:</span> {log.doctorName}
                      </p>
                      {log.reason && (
                        <p className="text-xs text-text-muted">
                          <span className="font-semibold text-text-muted">{lang === 'en' ? 'Reason' : 'कारण'}:</span> {log.reason}
                        </p>
                      )}
                      <div className="flex gap-3 mt-2">
                        {log.prescriptionPic && (
                          <button
                            type="button"
                            onClick={() => setPreviewImage(`${API_ORIGIN}${log.prescriptionPic}`)}
                            className="text-xs text-primary-400 hover:text-primary-300 font-medium inline-flex items-center gap-1 hover:underline cursor-pointer bg-transparent border-0 p-0"
                          >
                            👁️ {t('viewprescription', 'View Prescription')}
                          </button>
                        )}
                        {log.prescriptionPdf && (
                          <a
                            href={`${API_ORIGIN}${log.prescriptionPdf}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-primary-400 hover:text-primary-300 font-medium inline-flex items-center gap-1 hover:underline"
                          >
                            📄 {lang === 'en' ? 'Download/View PDF' : 'PDF ডাউনলোড/দেখুন'}
                          </a>
                        )}
                      </div>
                    </div>
                    {/* Read-only view, no delete button for citizen */}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderCrimeInfo = () => (
    <div className="space-y-6 animate-fade-in text-left">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-white">{lang === 'en' ? 'Background & Crime Records' : 'পৃষ্ঠভূমি ও অপরাধের রেকর্ড'}</h3>
        <button type="button" onClick={() => openCorrectionAssistant('CRIME')} className="px-4 py-2 bg-primary-600/20 hover:bg-primary-500 text-primary-400 hover:text-white border border-primary-500/30 rounded-xl text-sm font-medium transition-all cursor-pointer">
          {t('requestcorrection', 'Request correction')}
        </button>
      </div>

      <div className="space-y-8">
        {/* Card 1: Criminal Record Details */}
        <div className="glass-card p-6 border border-white/5 rounded-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <h4 className="text-base font-semibold text-white flex items-center gap-2">
              <span>⚖️</span> {lang === 'en' ? 'Criminal Record Details' : 'অপরাধের রেকর্ডের বিবরণ'}
            </h4>
            {renderStatusBadge(profile?.crimeInfo?.status, profile?.crimeInfo?.hasCriminalRecord !== undefined)}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-surface/50 border border-white/5 rounded-xl p-4">
                <p className="text-[10px] text-text-muted uppercase tracking-wider font-semibold mb-1">{lang === 'en' ? 'Has Criminal Record' : 'অপরাধের রেকর্ড আছে কি না'}</p>
                <p className={`font-semibold text-sm ${profile?.crimeInfo?.hasCriminalRecord ? 'text-danger' : 'text-success'}`}>
                  {profile?.crimeInfo?.hasCriminalRecord
                    ? (lang === 'en' ? 'Yes, Record Found' : 'হ্যাঁ, রেকর্ড পাওয়া গেছে')
                    : (lang === 'en' ? 'No Criminal Record' : 'কোনো অপরাধের রেকর্ড নেই')}
                </p>
              </div>
              <div className="bg-surface/50 border border-white/5 rounded-xl p-4">
                <p className="text-[10px] text-text-muted uppercase tracking-wider font-semibold mb-1">{lang === 'en' ? 'Pending Charges' : 'অপেক্ষমান অভিযোগ'}</p>
                <p className="text-white font-medium text-sm">{profile?.crimeInfo?.pendingCharges || (lang === 'en' ? 'None Declared' : 'কোনোটি নেই')}</p>
              </div>
              <div className="bg-surface/50 border border-white/5 rounded-xl p-4">
                <p className="text-[10px] text-text-muted uppercase tracking-wider font-semibold mb-1">{lang === 'en' ? 'Conviction / Case Details' : 'দণ্ডাদেশ / মামলার বিবরণ'}</p>
                <p className="text-white font-medium text-sm">{profile?.crimeInfo?.recordDetails || (lang === 'en' ? 'None' : 'কোনোটি নেই')}</p>
              </div>
            </div>
        </div>

        {/* Card 2: Police Clearance Certificate */}
        <div className="glass-card p-6 border border-white/5 rounded-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <h4 className="text-base font-semibold text-white flex items-center gap-2">
              <span>🛡️</span> {lang === 'en' ? 'Police Clearance Certification' : 'পুলিশ ক্লিয়ারেন্স প্রশংসাপত্র'}
            </h4>
            {renderStatusBadge(profile?.crimeInfo?.clearanceStatus, !!profile?.crimeInfo?.clearanceCertificateNumber)}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { label: lang === 'en' ? 'Clearance Certificate Number' : 'ক্লিয়ারেন্স সার্টিফিকেট নম্বর', value: profile?.crimeInfo?.clearanceCertificateNumber },
                { label: lang === 'en' ? 'Clearance Status' : 'ক্লিয়ারেন্স স্ট্যাটাস', value: profile?.crimeInfo?.clearanceStatus }
              ].map(item => (
                <div key={item.label} className="bg-surface/50 border border-white/5 rounded-xl p-4">
                  <p className="text-[10px] text-text-muted uppercase tracking-wider font-semibold mb-1">{item.label}</p>
                  <p className="text-white font-medium text-sm">{item.value || (lang === 'en' ? 'Not Provided' : 'প্রদান করা হয়নি')}</p>
                </div>
              ))}
            </div>
        </div>

      </div>

      {/* Fine Logs Section */}
      <div className="mt-8">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-white">{lang === 'en' ? 'Fine Logs & Tracking' : 'জরিমানা লগ ও ট্র্যাকিং'}</h3>
        </div>

        {/* Fine Logs Table */}
        {fineLogs.length > 0 ? (
          <div className="glass-card border border-white/5 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5 border-b border-white/5">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">{lang === 'en' ? 'Fine Reason' : 'জরিমানার কারণ'}</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">{lang === 'en' ? 'Fine Date' : 'জরিমানার তারিখ'}</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">{lang === 'en' ? 'Amount' : 'পরিমাণ'}</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">{lang === 'en' ? 'Status' : 'অবস্থা'}</th>
                  </tr>
                </thead>
                <tbody>
                  {fineLogs.map((fine) => (
                    <tr key={fine.id} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                      <td className="px-6 py-4 text-sm text-white font-medium">{fine.fineReason}</td>
                      <td className="px-6 py-4 text-sm text-text-muted">{new Date(fine.fineDate).toLocaleDateString()}</td>
                      <td className="px-6 py-4 text-sm text-white font-medium">{fine.fineAmount ? `${fine.fineAmount.toLocaleString()}` : '-'}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-full font-medium ${
                          fine.isCleared
                            ? 'bg-success/15 text-success border border-success/20'
                            : 'bg-warning/15 text-warning border border-warning/20'
                        }`}>
                          {fine.isCleared ? (lang === 'en' ? '✓ Cleared' : '✓ পরিশোধিত') : (lang === 'en' ? '⏱ Pending' : '⏱ অপেক্ষমান')}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="glass-card p-8 border border-white/5 rounded-2xl text-center">
            <p className="text-text-muted">{lang === 'en' ? 'No fines recorded yet' : 'এখনও কোনো জরিমানা রেকর্ড করা হয়নি'}</p>
          </div>
        )}
      </div>

      {/* Crime Logs Section */}
      <div className="mt-8">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-white">{lang === 'en' ? 'Crime Logs & Offenses' : 'অপরাধ লগ ও অপরাধসমূহ'}</h3>
        </div>

        {crimeLogs.length > 0 ? (
          <div className="glass-card border border-white/5 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5 border-b border-white/5">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">{lang === 'en' ? 'Offense' : 'অপরাধ'}</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">{lang === 'en' ? 'Case Number' : 'মামলা নম্বর'}</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">{lang === 'en' ? 'Severity' : 'তীব্রতা'}</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">{lang === 'en' ? 'Status / Verdict' : 'অবস্থা / রায়'}</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">{lang === 'en' ? 'Date' : 'তারিখ'}</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">{lang === 'en' ? 'Details' : 'বিবরণ'}</th>
                  </tr>
                </thead>
                <tbody>
                  {crimeLogs.map((log) => (
                    <tr key={log.id} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                      <td className="px-6 py-4 text-sm text-white font-medium">{log.offense}</td>
                      <td className="px-6 py-4 text-sm text-text-muted font-mono">{log.caseNumber}</td>
                      <td className="px-6 py-4 text-sm text-white">{log.severity}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-full font-medium ${
                          log.status === 'Convicted'
                            ? 'bg-danger/15 text-danger border border-danger/20'
                            : log.status === 'Acquitted' || log.status === 'Dismissed'
                              ? 'bg-success/15 text-success border border-success/20'
                              : 'bg-warning/15 text-warning border border-warning/20'
                        }`}>
                          {log.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-text-muted">{new Date(log.crimeDate).toLocaleDateString()}</td>
                      <td className="px-6 py-4 text-sm text-text-muted">{log.details || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="glass-card p-8 border border-white/5 rounded-2xl text-center">
            <p className="text-text-muted">{lang === 'en' ? 'No criminal record logs found' : 'এখনও কোনো অপরাধের লগ পাওয়া যায়নি'}</p>
          </div>
        )}
      </div>
    </div>
  );

  const pendingCount = requests.filter(r => r.status === 'Pending').length;
  const approvedCount = requests.filter(r => r.status === 'Approved').length;
  const latestApproval = notifications.find(notification => typeof notification.id === 'string'
    && notification.id.startsWith('change-review-') && notification.title === 'Profile change approved')?.id;
  useEffect(() => {
    if (!latestApproval) return;
    const controller = new AbortController();
    void api.get('/citizen/profile', { signal: controller.signal }).then(({ data }) => {
      if (!controller.signal.aborted) setProfile(data);
    }).catch(() => undefined);
    return () => controller.abort();
  }, [latestApproval]);

  const links = [
    { name: 'Dashboard', path: '/citizen', icon: <Home size={20} /> },
    { name: 'Profile', path: '/citizen/profile', icon: <User size={20} /> },
    { name: 'Change Requests', path: '/citizen/changes', icon: <FileText size={20} /> },
    { name: 'Documents', path: '/citizen/documents', icon: <FileText size={20} /> },
    { name: 'Permissions', path: '/citizen/permissions', icon: <Shield size={20} /> },
    { name: 'Medical Info', path: '/citizen/medical', icon: <Activity size={20} /> },
    { name: 'Crime Info', path: '/citizen/crime', icon: <FileWarning size={20} /> },
    { name: 'Notifications', path: '/citizen/notifications', icon: <Bell size={20} /> },
  ];

  const renderConsentCard = (req: any) => (
    <ConsentCard
      key={req.id}
      req={req}
      duration={selectedDurations[req.id] || 60}
      onDurationChange={(minutes) => setSelectedDurations({ ...selectedDurations, [req.id]: minutes })}
      onConsent={(status, durationMinutes) => handleConsent(req.id, status, durationMinutes)}
      onRevoke={() => handleRevokeConsent(req.id)}
    />
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar links={links} />

      <div className="flex-1 ml-64 relative overflow-y-auto h-screen">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-primary-600/10 blur-[120px] pointer-events-none" />

        <Navbar title="Citizen Vault" />

        <div className="p-8 relative z-10">
          <Routes>
            <Route path="/" element={
              <div className="space-y-8 animate-in">
                <div className="glass-card rounded-3xl p-8 relative overflow-hidden bg-gradient-to-r from-primary-950/40 via-surface/40 to-transparent border border-white/10 shadow-2xl">
                  <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-accent/20 to-primary-500/10 rounded-full blur-[80px] pointer-events-none" />
                  <h1 className="text-4xl font-extrabold text-white mb-2 relative tracking-tight font-display">
                    {t('welcome', 'Welcome')}, {profile?.fullName || user?.citizenProfile?.fullName || 'Citizen'}
                  </h1>
                  <p className="text-sm text-text-muted mt-1 leading-relaxed relative max-w-2xl">
                    Access and manage your digital credentials, verify policy rules securely using zero-knowledge proofs, and grant permissions.
                  </p>
                  <div className="text-text-muted relative flex items-center flex-wrap gap-2 text-sm mt-5">
                    <span className="font-semibold">{t('citizenid', 'Citizen ID')}:</span>
                    <button
                      onClick={handleCopyId}
                      title="Click to copy Citizen ID"
                      className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold bg-accent/10 hover:bg-accent/20 text-accent border border-accent/25 shadow-inner cursor-pointer transition-all active:scale-95 group/btn"
                    >
                      {profile?.citizenId || user?.citizenProfile?.citizenId || '...'}
                      {copiedId && (
                        <span className="text-[10px] text-success font-sans bg-success/15 px-1.5 py-0.5 rounded border border-success/20 animate-in">✓ Copied</span>
                      )}
                    </button>
                  </div>
                </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Link to="/citizen/profile" className="glass-card rounded-2xl p-6 flex flex-col items-center justify-center hover-glow cursor-pointer text-center group border border-white/5">
                    <div className="p-3 bg-success/10 text-success rounded-2xl border border-success/20 mb-3 group-hover:scale-110 transition-transform">
                      <Shield size={32} />
                    </div>
                    <h3 className="text-base font-bold text-white">{t('truststatus', 'Trust Status')}</h3>
                    <p className="text-success text-sm mt-1 font-semibold">{t('verified', 'Verified')}</p>
                  </Link>

                  <Link to="/citizen/documents" className="glass-card rounded-2xl p-6 flex flex-col items-center justify-center hover-glow cursor-pointer text-center group border border-white/5">
                    <div className="p-3 bg-primary-500/10 text-primary-400 rounded-2xl border border-primary-500/20 mb-3 group-hover:scale-110 transition-transform">
                      <FileText size={32} />
                    </div>
                    <h3 className="text-base font-bold text-white">{t('documents', 'Documents')}</h3>
                    <p className="text-primary-400 text-sm mt-1 font-semibold">{profile?.documents?.length || 0} {lang === 'en' ? 'Uploaded' : 'আপলোডকৃত'}</p>
                  </Link>

                  <Link to="/citizen/permissions" className="glass-card rounded-2xl p-6 flex flex-col items-center justify-center hover-glow cursor-pointer text-center group border border-white/5">
                    <div className="p-3 bg-warning/10 text-warning rounded-2xl border border-warning/20 mb-3 group-hover:scale-110 transition-transform">
                      <Clock size={32} />
                    </div>
                    <h3 className="text-base font-bold text-white">{t('pending', 'Pending')}</h3>
                    <p className="text-warning text-sm mt-1 font-semibold">{pendingCount} {lang === 'en' ? 'Requests' : 'অনুরোধ'}</p>
                  </Link>

                  <Link to="/citizen/permissions" className="glass-card rounded-2xl p-6 flex flex-col items-center justify-center hover-glow cursor-pointer text-center group border border-white/5">
                    <div className="p-3 bg-accent/10 text-accent rounded-2xl border border-accent/20 mb-3 group-hover:scale-110 transition-transform">
                      <CheckCircle size={32} />
                    </div>
                    <h3 className="text-base font-bold text-white">{t('approved', 'Approved')}</h3>
                    <p className="text-accent text-sm mt-1 font-semibold">{approvedCount} {lang === 'en' ? 'Active' : 'সক্রিয়'}</p>
                  </Link>
                </div>

                <div className="glass-card rounded-2xl p-8">
                  <h2 className="text-2xl font-semibold text-white mb-6">{t('recentconsentrequests', 'Recent Consent Requests')}</h2>

                  {requests.length === 0 ? (
                    <div className="text-center py-8 text-text-muted">
                      <Shield size={48} className="mx-auto mb-4 opacity-40" />
                      <p>{t('noconsentrequests', 'No recent consent requests')}</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {requests.slice(0, 5).map(renderConsentCard)}
                    </div>
                  )}
                </div>

                {/* Privacy Guard Policy Panel */}
                <div className="glass-card rounded-2xl p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <Shield size={28} className="text-primary-400 animate-pulse" />
                    <h2 className="text-2xl font-semibold text-white">Privacy Guard & Role Access Policy</h2>
                  </div>
                  <p className="text-sm text-text-muted mb-6">
                    To maintain strict citizen privacy, the Smart City Citizen Network enforces role-based access control (RBAC) boundaries. Verifiers can only verify criteria they are authorized to request, and they never see your raw details (Zero-Knowledge verification).
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* University Authority Card */}
                    <div className="bg-surface/40 border border-white/5 rounded-xl p-5 space-y-3 hover:border-white/10 transition-all">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-white">University Authority</span>
                        <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-primary-500/10 text-primary-400 border border-primary-500/20">Academic Only</span>
                      </div>
                      <p className="text-xs text-text-muted">
                        Authorized to verify HSC GPA, SSC GPA, University Enrollment, CGPA.
                      </p>
                      <div className="text-[11px] text-danger/90 font-semibold flex items-center gap-1">
                        🚫 Blocked from Financial & ID details
                      </div>
                    </div>

                    {/* Job Interviewer Card */}
                    <div className="bg-surface/40 border border-white/5 rounded-xl p-5 space-y-3 hover:border-white/10 transition-all">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-white">Job Interviewer</span>
                        <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-success/10 text-success border border-success/20">Employment</span>
                      </div>
                      <p className="text-xs text-text-muted">
                        Authorized to verify basic profile details and academic qualifications for screening.
                      </p>
                      <div className="text-[11px] text-danger/90 font-semibold flex items-center gap-1">
                        🚫 Blocked from financial records
                      </div>
                    </div>

                    {/* Bank Loan Officer Card */}
                    <div className="bg-surface/40 border border-white/5 rounded-xl p-5 space-y-3 hover:border-white/10 transition-all">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-white">Bank Loan Officer</span>
                        <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-warning/10 text-warning border border-warning/20">Credit & Income</span>
                      </div>
                      <p className="text-xs text-text-muted">
                        Authorized to verify monthly income, occupation, and Tax Clearance status.
                      </p>
                      <div className="text-[11px] text-danger/90 font-semibold flex items-center gap-1">
                        🚫 Blocked from academic transcript
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            } />

            <Route path="/profile" element={
              <div className="animate-in">
                <div className="glass-card rounded-2xl p-8">
                  <h2 className="text-2xl font-semibold text-white mb-6">{t('myprofile', 'My Profile')}</h2>

                  {/* Tabs */}
                  <div className="flex border-b border-white/10 mb-8 overflow-x-auto select-none">
                    {[
                      { id: 'basic', label: t('personalinfo', 'Personal Info') },
                      { id: 'identity', label: t('identityinfo', 'Identity Info') },
                      { id: 'education', label: t('educationinfo', 'Education Info') },
                      { id: 'financial', label: t('financialinfo', 'Financial Info') }
                    ].map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => {
                          setProfileTab(tab.id as 'basic' | 'identity' | 'education' | 'financial' | 'medical' | 'crime');

                        }}
                        className={`py-3 px-6 font-medium text-sm transition-all duration-200 border-b-2 shrink-0 ${
                          profileTab === tab.id
                            ? 'border-primary-500 text-primary-400'
                            : 'border-transparent text-text-muted hover:text-white'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {profile ? (
                    <div>
                      {/* Basic Profile Tab */}
                      {profileTab === 'basic' && (
                        <div className="space-y-6">
                          {/* Profile Picture Header Section */}
                          <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-white/10 mb-6 bg-surface/20 rounded-2xl p-6 border border-white/5 backdrop-blur-sm">
                            <div className="relative group shrink-0">
                              <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-primary-500/30 shadow-lg relative bg-surface-hover/30 flex items-center justify-center">
                                {user?.profilePicture ? (
                                  <img
                                    src={user.profilePicture.startsWith('/uploads') ? `${API_ORIGIN}${user.profilePicture}` : user.profilePicture}
                                    alt="Profile Avatar"
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <User size={48} className="text-primary-400" />
                                )}
                                {uploadingProfilePic && (
                                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                    <div className="w-5 h-5 border-2 border-primary-400 border-t-transparent rounded-full animate-spin" />
                                  </div>
                                )}
                              </div>

                              <label className="absolute bottom-0 right-0 p-1.5 bg-primary-600 hover:bg-primary-500 text-white rounded-full cursor-pointer shadow-lg hover:scale-105 transition-all">
                                <Upload size={14} />
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={handleProfilePicUpload}
                                  className="hidden"
                                  disabled={uploadingProfilePic}
                                />
                              </label>
                            </div>
                            <div className="text-center sm:text-left">
                              <h2 className="text-xl font-bold text-white">{profile.fullName}</h2>
                              <p className="text-xs text-text-muted mt-1">National ID: <span className="text-primary-400 font-mono">{profile.citizenId}</span></p>
                              <p className="text-[10px] text-text-muted mt-1 uppercase tracking-wider bg-white/5 border border-white/10 px-2.5 py-0.5 rounded inline-block font-medium">Citizen Account</p>
                            </div>
                          </div>

                          <div className="flex flex-wrap justify-end gap-3">
                            <button type="button" onClick={() => openCorrectionAssistant('PERSONAL')} className="px-4 py-2 bg-primary-600/20 hover:bg-primary-500 text-primary-400 hover:text-white border border-primary-500/30 rounded-xl text-sm font-medium transition-all cursor-pointer">
                              {t('requestcorrection', 'Request correction')}
                            </button>

                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              {[
                                { label: 'Full Name', value: profile.fullName },
                                { label: 'Phone', value: profile.phone },
                                { label: 'Email Address', value: user?.email || 'N/A' },
                                { label: 'Date of Birth', value: new Date(profile.dob).toLocaleDateString() },
                                { label: 'Gender', value: profile.gender },
                                { label: 'Blood Group', value: profile.bloodGroup },
                                { label: "Father's Name", value: profile.fathersName || 'Not Provided' },
                                { label: "Mother's Name", value: profile.mothersName || 'Not Provided' },
                                { label: 'Nationality / Citizenship', value: profile.nationality || 'Not Provided' },
                                { label: 'Marital Status', value: profile.maritalStatus || 'Not Provided' },
                                { label: 'Religion', value: profile.religion || 'Not Provided' },
                                { label: 'Emergency Contact Name', value: profile.emergencyContactName },
                                { label: 'Emergency Contact Number', value: profile.emergencyContactNumber },
                                { label: 'Relationship to Emergency Contact', value: profile.emergencyContactRelationship || 'Not Provided' },
                              ].map(item => (
                                <div key={item.label} className="bg-surface/50 border border-white/5 rounded-xl p-4">
                                  <p className="text-xs text-text-muted uppercase tracking-wider mb-1">{item.label}</p>
                                  <p className="text-white font-medium">{item.value}</p>
                                </div>
                              ))}
                              <div className="md:col-span-2 bg-surface/50 border border-white/5 rounded-xl p-4">
                                <p className="text-xs text-text-muted uppercase tracking-wider mb-1">Address</p>
                                <p className="text-white font-medium">{profile.address}</p>
                              </div>
                            </div>
                        </div>
                      )}

                      {/* Identity Details Tab */}
                      {profileTab === 'identity' && (
                        <div className="space-y-6">
                          <div className="flex justify-between items-center">
                            <h3 className="text-xl font-semibold text-white">Identity Details Wallet</h3>
                            <button type="button" onClick={() => openCorrectionAssistant('IDENTITY')} className="px-4 py-2 bg-primary-600/20 hover:bg-primary-500 text-primary-400 hover:text-white border border-primary-500/30 rounded-xl text-sm font-medium transition-all cursor-pointer">
                              {t('requestcorrection', 'Request correction')}
                            </button>
                          </div>

                          <div className="space-y-4">
                            {/* 1. NID Accordion */}
                            <div className="border border-white/5 bg-surface/20 rounded-2xl overflow-hidden transition-all duration-300">
                              <button
                                type="button"
                                onClick={() => setOpenAccordions({ ...openAccordions, nid: !openAccordions.nid })}
                                className="w-full flex items-center justify-between p-5 hover:bg-white/5 text-left transition-all"
                              >
                                <div className="flex items-center gap-3">
                                  <span className="text-xl">🪪</span>
                                  <span className="text-base font-semibold text-white">National ID (NID)</span>
                                  {renderStatusBadge(profile.identityInfo?.nidStatus, !!profile.identityInfo?.nid)}
                                </div>
                                {openAccordions.nid ? <ChevronUp className="text-text-muted" size={20} /> : <ChevronDown className="text-text-muted" size={20} />}
                              </button>
                              {openAccordions.nid && (
                                <div className="p-6 border-t border-white/5 bg-black/10">
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                      {[
                                        { label: 'NID Number', value: profile.identityInfo?.nid },
                                        { label: 'Full Name (Bangla)', value: profile.identityInfo?.nidNameBangla },
                                        { label: "Father's Name (Bangla)", value: profile.identityInfo?.nidFathersNameBangla },
                                        { label: "Mother's Name (Bangla)", value: profile.identityInfo?.nidMothersNameBangla }
                                      ].map(item => (
                                        <div key={item.label} className="bg-surface/50 border border-white/5 rounded-xl p-4">
                                          <p className="text-[10px] text-text-muted uppercase tracking-wider font-semibold mb-1">{item.label}</p>
                                          <p className="text-white font-medium text-sm">{item.value || 'Not Provided'}</p>
                                        </div>
                                      ))}
                                    </div>
                                </div>
                              )}
                            </div>

                            {/* 2. Passport Accordion */}
                            <div className="border border-white/5 bg-surface/20 rounded-2xl overflow-hidden transition-all duration-300">
                              <button
                                type="button"
                                onClick={() => setOpenAccordions({ ...openAccordions, passport: !openAccordions.passport })}
                                className="w-full flex items-center justify-between p-5 hover:bg-white/5 text-left transition-all"
                              >
                                <div className="flex items-center gap-3">
                                  <span className="text-xl">✈️</span>
                                  <span className="text-base font-semibold text-white">Passport Details</span>
                                  {renderStatusBadge(profile.identityInfo?.passportStatus, !!profile.identityInfo?.passport)}
                                </div>
                                {openAccordions.passport ? <ChevronUp className="text-text-muted" size={20} /> : <ChevronDown className="text-text-muted" size={20} />}
                              </button>
                              {openAccordions.passport && (
                                <div className="p-6 border-t border-white/5 bg-black/10">
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                      {[
                                        { label: 'Passport Number', value: profile.identityInfo?.passport },
                                        { label: 'Passport Type', value: profile.identityInfo?.passportType },
                                        { label: 'Issue Date', value: profile.identityInfo?.passportIssueDate },
                                        { label: 'Expiry Date', value: profile.identityInfo?.passportExpiryDate },
                                        { label: 'Place of Issue / Authority', value: profile.identityInfo?.passportIssuePlace }
                                      ].map(item => (
                                        <div key={item.label} className="bg-surface/50 border border-white/5 rounded-xl p-4">
                                          <p className="text-[10px] text-text-muted uppercase tracking-wider font-semibold mb-1">{item.label}</p>
                                          <p className="text-white font-medium text-sm">{item.value || 'Not Provided'}</p>
                                        </div>
                                      ))}
                                    </div>
                                </div>
                              )}
                            </div>

                            {/* 3. Driving License Accordion */}
                            <div className="border border-white/5 bg-surface/20 rounded-2xl overflow-hidden transition-all duration-300">
                              <button
                                type="button"
                                onClick={() => setOpenAccordions({ ...openAccordions, drivingLicense: !openAccordions.drivingLicense })}
                                className="w-full flex items-center justify-between p-5 hover:bg-white/5 text-left transition-all"
                              >
                                <div className="flex items-center gap-3">
                                  <span className="text-xl">🚗</span>
                                  <span className="text-base font-semibold text-white">Driving License</span>
                                  {renderStatusBadge(profile.identityInfo?.drivingLicenseStatus, !!profile.identityInfo?.drivingLicense)}
                                </div>
                                {openAccordions.drivingLicense ? <ChevronUp className="text-text-muted" size={20} /> : <ChevronDown className="text-text-muted" size={20} />}
                              </button>
                              {openAccordions.drivingLicense && (
                                <div className="p-6 border-t border-white/5 bg-black/10">
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                      {[
                                        { label: 'License Number', value: profile.identityInfo?.drivingLicense },
                                        { label: 'License Type', value: profile.identityInfo?.drivingLicenseType },
                                        { label: 'Vehicle Categories', value: profile.identityInfo?.drivingLicenseVehicleCategories },
                                        { label: 'Issue Date', value: profile.identityInfo?.drivingLicenseIssueDate },
                                        { label: 'Expiry Date', value: profile.identityInfo?.drivingLicenseExpiryDate }
                                      ].map(item => (
                                        <div key={item.label} className="bg-surface/50 border border-white/5 rounded-xl p-4">
                                          <p className="text-[10px] text-text-muted uppercase tracking-wider font-semibold mb-1">{item.label}</p>
                                          <p className="text-white font-medium text-sm">{item.value || 'Not Provided'}</p>
                                        </div>
                                      ))}
                                    </div>
                                </div>
                              )}
                            </div>

                            {/* 4. Trade License Accordion */}
                            <div className="border border-white/5 bg-surface/20 rounded-2xl overflow-hidden transition-all duration-300">
                              <button
                                type="button"
                                onClick={() => setOpenAccordions({ ...openAccordions, tradeLicense: !openAccordions.tradeLicense })}
                                className="w-full flex items-center justify-between p-5 hover:bg-white/5 text-left transition-all"
                              >
                                <div className="flex items-center gap-3">
                                  <span className="text-xl">💼</span>
                                  <span className="text-base font-semibold text-white">Trade License</span>
                                  {renderStatusBadge(profile.identityInfo?.tradeLicenseStatus, !!profile.identityInfo?.tradeLicense)}
                                </div>
                                {openAccordions.tradeLicense ? <ChevronUp className="text-text-muted" size={20} /> : <ChevronDown className="text-text-muted" size={20} />}
                              </button>
                              {openAccordions.tradeLicense && (
                                <div className="p-6 border-t border-white/5 bg-black/10">
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                      {[
                                        { label: 'Trade License Number', value: profile.identityInfo?.tradeLicense },
                                        { label: 'Business / Company Name', value: profile.identityInfo?.tradeLicenseBusinessName },
                                        { label: 'Nature of Trade', value: profile.identityInfo?.tradeLicenseBusinessType },
                                        { label: 'Issuing Authority / City Corp', value: profile.identityInfo?.tradeLicenseIssueAuthority },
                                        { label: 'Fiscal Year', value: profile.identityInfo?.tradeLicenseFiscalYear }
                                      ].map(item => (
                                        <div key={item.label} className="bg-surface/50 border border-white/5 rounded-xl p-4">
                                          <p className="text-[10px] text-text-muted uppercase tracking-wider font-semibold mb-1">{item.label}</p>
                                          <p className="text-white font-medium text-sm">{item.value || 'Not Provided'}</p>
                                        </div>
                                      ))}
                                    </div>
                                </div>
                              )}
                            </div>

                            {/* 5. TIN Accordion */}
                            <div className="border border-white/5 bg-surface/20 rounded-2xl overflow-hidden transition-all duration-300">
                              <button
                                type="button"
                                onClick={() => setOpenAccordions({ ...openAccordions, tin: !openAccordions.tin })}
                                className="w-full flex items-center justify-between p-5 hover:bg-white/5 text-left transition-all"
                              >
                                <div className="flex items-center gap-3">
                                  <span className="text-xl">📊</span>
                                  <span className="text-base font-semibold text-white">Tax Identification Number (TIN)</span>
                                  {renderStatusBadge(profile.identityInfo?.tinStatus, !!profile.identityInfo?.tin)}
                                </div>
                                {openAccordions.tin ? <ChevronUp className="text-text-muted" size={20} /> : <ChevronDown className="text-text-muted" size={20} />}
                              </button>
                              {openAccordions.tin && (
                                <div className="p-6 border-t border-white/5 bg-black/10">
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                      {[
                                        { label: 'e-TIN Number', value: profile.identityInfo?.tin },
                                        { label: 'Tax Circle & Zone', value: profile.identityInfo?.tinCircleZone },
                                        { label: 'Assessment Status', value: profile.identityInfo?.tinAssessmentStatus }
                                      ].map(item => (
                                        <div key={item.label} className="bg-surface/50 border border-white/5 rounded-xl p-4">
                                          <p className="text-[10px] text-text-muted uppercase tracking-wider font-semibold mb-1">{item.label}</p>
                                          <p className="text-white font-medium text-sm">{item.value || 'Not Provided'}</p>
                                        </div>
                                      ))}
                                    </div>
                                </div>
                              )}
                            </div>

                            {/* 6. Land Record Accordion */}
                            <div className="border border-white/5 bg-surface/20 rounded-2xl overflow-hidden transition-all duration-300">
                              <button
                                type="button"
                                onClick={() => setOpenAccordions({ ...openAccordions, landRecord: !openAccordions.landRecord })}
                                className="w-full flex items-center justify-between p-5 hover:bg-white/5 text-left transition-all"
                              >
                                <div className="flex items-center gap-3">
                                  <span className="text-xl">⛰️</span>
                                  <span className="text-base font-semibold text-white">Land Record Reference</span>
                                  {renderStatusBadge(profile.identityInfo?.landRecordStatus, !!profile.identityInfo?.landRecord)}
                                </div>
                                {openAccordions.landRecord ? <ChevronUp className="text-text-muted" size={20} /> : <ChevronDown className="text-text-muted" size={20} />}
                              </button>
                              {openAccordions.landRecord && (
                                <div className="p-6 border-t border-white/5 bg-black/10">
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                      {[
                                        { label: 'Khatian Number (BS, CS, RS, SA)', value: profile.identityInfo?.landRecord },
                                        { label: 'Daag Number (Plot)', value: profile.identityInfo?.landRecordDaagNumber },
                                        { label: 'Mouza & Thana / Upazila', value: profile.identityInfo?.landRecordMouzaThana },
                                        { label: 'District', value: profile.identityInfo?.landRecordDistrict }
                                      ].map(item => (
                                        <div key={item.label} className="bg-surface/50 border border-white/5 rounded-xl p-4">
                                          <p className="text-[10px] text-text-muted uppercase tracking-wider font-semibold mb-1">{item.label}</p>
                                          <p className="text-white font-medium text-sm">{item.value || 'Not Provided'}</p>
                                        </div>
                                      ))}
                                    </div>
                                </div>
                              )}
                            </div>

                            {/* 7. Family Card Accordion */}
                            <div className="border border-white/5 bg-surface/20 rounded-2xl overflow-hidden transition-all duration-300">
                              <button
                                type="button"
                                onClick={() => setOpenAccordions({ ...openAccordions, familyCard: !openAccordions.familyCard })}
                                className="w-full flex items-center justify-between p-5 hover:bg-white/5 text-left transition-all"
                              >
                                <div className="flex items-center gap-3">
                                  <span className="text-xl">👨‍👩‍👧‍👦</span>
                                  <span className="text-base font-semibold text-white">Family Card Details</span>
                                  {renderStatusBadge(profile.identityInfo?.familyCardStatus, !!profile.identityInfo?.familyCard)}
                                </div>
                                {openAccordions.familyCard ? <ChevronUp className="text-text-muted" size={20} /> : <ChevronDown className="text-text-muted" size={20} />}
                              </button>
                              {openAccordions.familyCard && (
                                <div className="p-6 border-t border-white/5 bg-black/10">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                      {[
                                        { label: 'Family Card Number', value: profile.identityInfo?.familyCard },
                                        { label: 'Total Family Members Registered', value: profile.identityInfo?.familyCardMembersCount }
                                      ].map(item => (
                                        <div key={item.label} className="bg-surface/50 border border-white/5 rounded-xl p-4">
                                          <p className="text-[10px] text-text-muted uppercase tracking-wider font-semibold mb-1">{item.label}</p>
                                          <p className="text-white font-medium text-sm">{item.value || 'Not Provided'}</p>
                                        </div>
                                      ))}
                                    </div>
                                </div>
                              )}
                            </div>

                            {/* 8. Farmer Card Accordion */}
                            <div className="border border-white/5 bg-surface/20 rounded-2xl overflow-hidden transition-all duration-300">
                              <button
                                type="button"
                                onClick={() => setOpenAccordions({ ...openAccordions, farmerCard: !openAccordions.farmerCard })}
                                className="w-full flex items-center justify-between p-5 hover:bg-white/5 text-left transition-all"
                              >
                                <div className="flex items-center gap-3">
                                  <span className="text-xl">🧑‍🌾</span>
                                  <span className="text-base font-semibold text-white">Farmer Card Details</span>
                                  {renderStatusBadge(profile.identityInfo?.farmerCardStatus, !!profile.identityInfo?.farmerCard)}
                                </div>
                                {openAccordions.farmerCard ? <ChevronUp className="text-text-muted" size={20} /> : <ChevronDown className="text-text-muted" size={20} />}
                              </button>
                              {openAccordions.farmerCard && (
                                <div className="p-6 border-t border-white/5 bg-black/10">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                      {[
                                        { label: 'Farmer Card Number', value: profile.identityInfo?.farmerCard },
                                        { label: 'Farmer Category / Type', value: profile.identityInfo?.farmerCardType }
                                      ].map(item => (
                                        <div key={item.label} className="bg-surface/50 border border-white/5 rounded-xl p-4">
                                          <p className="text-[10px] text-text-muted uppercase tracking-wider font-semibold mb-1">{item.label}</p>
                                          <p className="text-white font-medium text-sm">{item.value || 'Not Provided'}</p>
                                        </div>
                                      ))}
                                    </div>
                                </div>
                              )}
                            </div>

                          </div>
                        </div>
                      )}

                      {/* Education Details Tab */}
                      {profileTab === 'education' && (
                        <div className="space-y-6">
                          <div className="flex justify-between items-center">
                            <h3 className="text-xl font-semibold text-white">Academic Qualifications</h3>
                            <button type="button" onClick={() => openCorrectionAssistant('EDUCATION')} className="px-4 py-2 bg-primary-600/20 hover:bg-primary-500 text-primary-400 hover:text-white border border-primary-500/30 rounded-xl text-sm font-medium transition-all cursor-pointer">
                              {t('requestcorrection', 'Request correction')}
                            </button>
                          </div>

                          <div className="space-y-8">
                            {/* Card 1: SSC Details */}
                            <div className="glass-card p-6 border border-white/5 rounded-2xl space-y-4">
                              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                                <h4 className="text-base font-semibold text-white flex items-center gap-2">
                                  <span>🎓</span> Secondary School Certificate (SSC) or Equivalent
                                </h4>
                                {renderStatusBadge(profile.educationInfo?.sscStatus, !!profile.educationInfo?.sscRoll)}
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                  {[
                                    { label: 'Institution Name', value: profile.educationInfo?.sscInstitution },
                                    { label: 'Education Board', value: profile.educationInfo?.sscBoard },
                                    { label: 'Group / Major', value: profile.educationInfo?.sscGroup },
                                    { label: 'Roll Number', value: profile.educationInfo?.sscRoll },
                                    { label: 'Registration Number', value: profile.educationInfo?.sscReg },
                                    { label: 'GPA / Result', value: profile.educationInfo?.sscGpa ? profile.educationInfo.sscGpa.toFixed(2) : null },
                                    { label: 'Passing Year', value: profile.educationInfo?.sscPassingYear }
                                  ].map(item => (
                                    <div key={item.label} className="bg-surface/50 border border-white/5 rounded-xl p-4">
                                      <p className="text-[10px] text-text-muted uppercase tracking-wider font-semibold mb-1">{item.label}</p>
                                      <p className="text-white font-medium text-sm">{item.value || 'Not Provided'}</p>
                                    </div>
                                  ))}
                                </div>
                            </div>

                            {/* Card 2: HSC Details */}
                            <div className="glass-card p-6 border border-white/5 rounded-2xl space-y-4">
                              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                                <h4 className="text-base font-semibold text-white flex items-center gap-2">
                                  <span>🎓</span> Higher Secondary Certificate (HSC) or Equivalent
                                </h4>
                                {renderStatusBadge(profile.educationInfo?.hscStatus, !!profile.educationInfo?.hscRoll)}
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                  {[
                                    { label: 'Institution Name', value: profile.educationInfo?.hscInstitution },
                                    { label: 'Education Board', value: profile.educationInfo?.hscBoard },
                                    { label: 'Group / Major', value: profile.educationInfo?.hscGroup },
                                    { label: 'Roll Number', value: profile.educationInfo?.hscRoll },
                                    { label: 'Registration Number', value: profile.educationInfo?.hscReg },
                                    { label: 'GPA / Result', value: profile.educationInfo?.hscGpa ? profile.educationInfo.hscGpa.toFixed(2) : null },
                                    { label: 'Passing Year', value: profile.educationInfo?.hscPassingYear }
                                  ].map(item => (
                                    <div key={item.label} className="bg-surface/50 border border-white/5 rounded-xl p-4">
                                      <p className="text-[10px] text-text-muted uppercase tracking-wider font-semibold mb-1">{item.label}</p>
                                      <p className="text-white font-medium text-sm">{item.value || 'Not Provided'}</p>
                                    </div>
                                  ))}
                                </div>
                            </div>

                            {/* Card 3: University details */}
                            <div className="glass-card p-6 border border-white/5 rounded-2xl space-y-4">
                              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                                <h4 className="text-base font-semibold text-white flex items-center gap-2">
                                  <span>🏛️</span> Graduation / University Details
                                </h4>
                                {renderStatusBadge(profile.educationInfo?.universityStatus, !!profile.educationInfo?.university)}
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                  {[
                                    { label: 'University / College Name', value: profile.educationInfo?.university },
                                    { label: 'Degree Name', value: profile.educationInfo?.degree },
                                    { label: 'Department / Faculty', value: profile.educationInfo?.universityDepartment },
                                    { label: 'Student ID Number', value: profile.educationInfo?.universityStudentId },
                                    { label: 'Current CGPA', value: profile.educationInfo?.cgpa ? profile.educationInfo.cgpa.toFixed(2) : null },
                                    { label: 'Current Semester / Year', value: profile.educationInfo?.universitySemester },
                                    { label: 'Graduation / Expected Year', value: profile.educationInfo?.graduationYear },
                                    { label: 'Enrollment Year / Session', value: profile.educationInfo?.universityEnrollmentYear }
                                  ].map(item => (
                                    <div key={item.label} className="bg-surface/50 border border-white/5 rounded-xl p-4">
                                      <p className="text-[10px] text-text-muted uppercase tracking-wider font-semibold mb-1">{item.label}</p>
                                      <p className="text-white font-medium text-sm">{item.value || 'Not Provided'}</p>
                                    </div>
                                  ))}
                                </div>
                            </div>

                          </div>
                        </div>
                      )}

                      {/* Financial Details Tab */}
                      {profileTab === 'financial' && (
                        <div className="space-y-6">
                          <div className="flex justify-between items-center">
                            <h3 className="text-xl font-semibold text-white">Financial & Wealth Portfolio</h3>
                            <button type="button" onClick={() => openCorrectionAssistant('FINANCIAL')} className="px-4 py-2 bg-primary-600/20 hover:bg-primary-500 text-primary-400 hover:text-white border border-primary-500/30 rounded-xl text-sm font-medium transition-all cursor-pointer">
                              {t('requestcorrection', 'Request correction')}
                            </button>
                          </div>

                          <div className="space-y-8">
                            {/* Card 1: Occupation & Employment Status */}
                            <div className="glass-card p-6 border border-white/5 rounded-2xl space-y-4">
                              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                                <h4 className="text-base font-semibold text-white flex items-center gap-2">
                                  <span>💼</span> Occupation & Employment Status
                                </h4>
                                {renderStatusBadge(profile.financialInfo?.occupationStatus, !!profile.financialInfo?.occupation)}
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                  {[
                                    { label: 'Occupation / Job Title', value: profile.financialInfo?.occupation },
                                    { label: 'Employment Status', value: profile.financialInfo?.employmentStatus },
                                    { label: 'Company / Organization', value: profile.financialInfo?.companyName },
                                    { label: 'Work Experience', value: profile.financialInfo?.workExperience },
                                    { label: 'Office Address & Email', value: profile.financialInfo?.officeAddressEmail }
                                  ].map(item => (
                                    <div key={item.label} className="bg-surface/50 border border-white/5 rounded-xl p-4">
                                      <p className="text-[10px] text-text-muted uppercase tracking-wider font-semibold mb-1">{item.label}</p>
                                      <p className="text-white font-medium text-sm">{item.value || 'Not Provided'}</p>
                                    </div>
                                  ))}
                                </div>
                            </div>

                            {/* Card 2: Monthly Income & Financial Inflow */}
                            <div className="glass-card p-6 border border-white/5 rounded-2xl space-y-4">
                              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                                <h4 className="text-base font-semibold text-white flex items-center gap-2">
                                  <span>💵</span> Monthly Income & Financial Inflow
                                </h4>
                                <div className="flex items-center gap-2">
                                  {/* Verification Badge */}
                                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs rounded-full font-medium ${
                                    profile.financialInfo?.incomeVerificationBadge === 'Verified via Bank Statement'
                                      ? 'bg-success/10 text-success border border-success/20 shadow-[0_0_8px_rgba(34,197,94,0.15)]'
                                      : 'bg-white/5 text-text-muted border border-white/10'
                                  }`}>
                                    {profile.financialInfo?.incomeVerificationBadge === 'Verified via Bank Statement' ? '✓ Verified via Bank Statement' : '- Self-Declared'}
                                  </span>
                                  {renderStatusBadge(profile.financialInfo?.incomeStatus, !!profile.financialInfo?.monthlyIncome)}
                                </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                  {[
                                    { label: 'Gross Monthly Income (BDT)', value: profile.financialInfo?.monthlyIncome ? profile.financialInfo.monthlyIncome.toLocaleString() : null },
                                    { label: 'Net Take-Home Pay (BDT)', value: profile.financialInfo?.netTakeHomePay ? profile.financialInfo.netTakeHomePay.toLocaleString() : null },
                                    { label: 'Primary Income Source', value: profile.financialInfo?.primaryIncomeSource },
                                    { label: 'Secondary / Alt Income', value: profile.financialInfo?.secondaryIncome },
                                    { label: 'Preferred Payout Method', value: profile.financialInfo?.preferredPayoutMethod }
                                  ].map(item => (
                                    <div key={item.label} className="bg-surface/50 border border-white/5 rounded-xl p-4">
                                      <p className="text-[10px] text-text-muted uppercase tracking-wider font-semibold mb-1">{item.label}</p>
                                      <p className="text-white font-medium text-sm">{item.value || 'Not Provided'}</p>
                                    </div>
                                  ))}
                                </div>
                            </div>

                            {/* Card 3: Tax Compliance & Records */}
                            <div className="glass-card p-6 border border-white/5 rounded-2xl space-y-4">
                              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                                <h4 className="text-base font-semibold text-white flex items-center gap-2">
                                  <span>🧾</span> Tax Compliance & Records (e-TIN)
                                </h4>
                                {renderStatusBadge(profile.financialInfo?.taxComplianceStatus, !!profile.financialInfo?.tin)}
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                  {[
                                    { label: 'e-TIN Number', value: profile.financialInfo?.tin },
                                    { label: 'Tax Zone & Tax Circle', value: profile.financialInfo?.taxZoneCircle },
                                    { label: 'Tax Registration Status', value: profile.financialInfo?.taxRegistrationStatus },
                                    { label: 'Taxpayer Assessment Category', value: profile.financialInfo?.taxpayerAssessmentCategory }
                                  ].map(item => (
                                    <div key={item.label} className="bg-surface/50 border border-white/5 rounded-xl p-4">
                                      <p className="text-[10px] text-text-muted uppercase tracking-wider font-semibold mb-1">{item.label}</p>
                                      <p className="text-white font-medium text-sm">{item.value || 'Not Provided'}</p>
                                    </div>
                                  ))}
                                </div>
                            </div>

                            {/* Card 4: Tax Clearance & Return Filing Status */}
                            <div className="glass-card p-6 border border-white/5 rounded-2xl space-y-4">
                              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                                <h4 className="text-base font-semibold text-white flex items-center gap-2">
                                  <span>✅</span> Tax Clearance & Return Filing Status
                                </h4>
                                {renderStatusBadge(profile.financialInfo?.taxClearanceStatusBadge, !!profile.financialInfo?.taxClearanceStatus)}
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                  {[
                                    { label: 'Tax Clearance Status', value: profile.financialInfo?.taxClearanceStatus },
                                    { label: 'Last Return Submission Date', value: profile.financialInfo?.lastReturnSubmissionDate },
                                    { label: 'Tax Year of Last Return', value: profile.financialInfo?.taxYearOfLastReturn },
                                    { label: 'Acknowledgment Receipt Number', value: profile.financialInfo?.acknowledgmentReceiptNumber },
                                    { label: 'Total Tax Paid (Current Fiscal BDT)', value: profile.financialInfo?.totalTaxPaid ? profile.financialInfo.totalTaxPaid.toLocaleString() : null }
                                  ].map(item => (
                                    <div key={item.label} className="bg-surface/50 border border-white/5 rounded-xl p-4">
                                      <p className="text-[10px] text-text-muted uppercase tracking-wider font-semibold mb-1">{item.label}</p>
                                      <p className="text-white font-medium text-sm">{item.value || 'Not Provided'}</p>
                                    </div>
                                  ))}
                                </div>
                            </div>

                            {/* Card 5: Bank Account & Wealth Records */}
                            <div className="glass-card p-6 border border-white/5 rounded-2xl space-y-4">
                              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                                <h4 className="text-base font-semibold text-white flex items-center gap-2">
                                  <span>🏦</span> Bank Account & Wealth Records
                                </h4>
                                {renderStatusBadge(profile.financialInfo?.wealthStatus, !!profile.financialInfo?.bankAccountNumber)}
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                  {[
                                    { label: 'Primary Bank Account Number', value: profile.financialInfo?.bankAccountNumber },
                                    { label: 'Bank Name & Branch', value: profile.financialInfo?.bankNameBranch },
                                    { label: 'Routing Number', value: profile.financialInfo?.routingNumber },
                                    { label: 'MFS Wallet (bKash/Nagad)', value: profile.financialInfo?.mfsWallet }
                                  ].map(item => (
                                    <div key={item.label} className="bg-surface/50 border border-white/5 rounded-xl p-4">
                                      <p className="text-[10px] text-text-muted uppercase tracking-wider font-semibold mb-1">{item.label}</p>
                                      <p className="text-white font-medium text-sm">{item.value || 'Not Provided'}</p>
                                    </div>
                                  ))}
                                </div>
                            </div>

                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-text-muted">Loading profile...</p>
                  )}
                </div>
              </div>
            } />

            <Route path="/changes" element={<ChangeRequestsView openAssistant={() => openCorrectionAssistant()} />} />

            <Route path="/documents" element={
              <div className="animate-in space-y-6">
                {/* Documents Header */}
                <div className="glass-card rounded-2xl p-8 border border-white/5">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">My Documents</h2>
                  </div>
                  <p className="text-text-muted text-sm">Manage your verified documents for trust building</p>
                </div>

                {/* Document list */}
                {profile?.documents && profile.documents.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {profile.documents.map((doc: any) => {
                      const getDocIcon = () => {
                        if (doc.type.includes('NID')) return '🪪';
                        if (doc.type.includes('Passport')) return '📕';
                        if (doc.type.includes('SSC')) return '📘';
                        if (doc.type.includes('HSC')) return '📙';
                        if (doc.type.includes('Birth')) return '👶';
                        if (doc.type.includes('License')) return '🎫';
                        if (doc.type.includes('Tax')) return '💰';
                        if (doc.type.includes('Utility')) return '📄';
                        if (doc.type.includes('Medical')) return '⚕️';
                        if (doc.type.includes('Police')) return '🛡️';
                        if (doc.type.includes('Family')) return '👨‍👩‍👧‍👦';
                        if (doc.type.includes('Farmer')) return '🧑‍🌾';
                        return '📎';
                      };

                      const getStatusColor = (status: string) => {
                        if (status === 'Verified') return 'from-success/20 to-success/5 border-success/30 text-success';
                        if (status === 'Pending Review') return 'from-warning/20 to-warning/5 border-warning/30 text-warning';
                        return 'from-danger/20 to-danger/5 border-danger/30 text-danger';
                      };

                      return (
                        <div key={doc.id} className={`group glass-card rounded-2xl p-6 border border-white/5 hover:border-primary-500/30 transition-all duration-300 bg-gradient-to-br ${getStatusColor(doc.status)}`}>
                          <div className="flex items-start justify-between mb-4">
                            <div className="text-4xl">{getDocIcon()}</div>
                            <span className={`inline-flex items-center px-3 py-1 text-xs rounded-full font-semibold ${
                              doc.status === 'Verified' ? 'bg-success/20 text-success border border-success/30' :
                              doc.status === 'Pending Review' ? 'bg-warning/20 text-warning border border-warning/30' :
                              'bg-danger/20 text-danger border border-danger/30'
                            }`}>
                              {doc.status === 'Verified' ? '✓ Verified' : doc.status === 'Pending Review' ? '⏱ Pending' : '✕ Failed'}
                            </span>
                          </div>
                          <div className="mb-4">
                            <h4 className="text-white font-semibold text-lg mb-1">{doc.type}</h4>
                            <p className="text-text-muted text-xs">{new Date(doc.uploadDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                          </div>
                          <div className="flex gap-2 pt-4 border-t border-white/10">
                            <a
                              href={doc.fileUrl.startsWith('/uploads') ? `${API_ORIGIN}${doc.fileUrl}` : doc.fileUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 bg-primary-500/10 hover:bg-primary-500/20 text-primary-400 hover:text-primary-300 rounded-lg text-sm font-medium transition-all"
                              title="View Document"
                            >
                              <Eye size={14} /> View
                            </a>
                            <a
                              href={doc.fileUrl.startsWith('/uploads') ? `${API_ORIGIN}${doc.fileUrl}` : doc.fileUrl}
                              download
                              className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 bg-success/10 hover:bg-success/20 text-success hover:text-success/90 rounded-lg text-sm font-medium transition-all"
                              title="Download Document"
                            >
                              <ChevronDown size={14} /> Download
                            </a>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  ) : (
                    <div className="glass-card rounded-2xl p-12 border border-dashed border-white/10 text-center mb-8">
                      <FileText size={56} className="mx-auto mb-4 opacity-30" />
                      <p className="text-white font-semibold text-lg mb-1">No documents yet</p>
                      <p className="text-text-muted text-sm">Upload documents to build your trust profile</p>
                    </div>
                  )}

                  {/* Upload Form */}
                  <form onSubmit={handleUploadDocument} className="glass-card rounded-2xl p-8 border border-white/5 space-y-6">
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-2">Upload New Document</h3>
                      <p className="text-text-muted text-sm">Add documents to your profile for verification</p>
                    </div>

                    {uploadMessage && (
                      <div className={`p-4 rounded-xl text-sm font-medium flex items-center gap-3 ${
                        uploadMessage.type === 'success'
                          ? 'bg-success/15 text-success border border-success/30'
                          : 'bg-danger/15 text-danger border border-danger/30'
                      }`}>
                        <span>{uploadMessage.type === 'success' ? '✓' : '✕'}</span>
                        {uploadMessage.text}
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-white ml-1">Document Type *</label>
                        <select
                          value={docType}
                          onChange={(e) => setDocType(e.target.value)}
                          className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all font-medium"
                        >
                          <option value="NID">🪪 National ID (NID)</option>
                          <option value="Passport">📕 Passport</option>
                          <option value="SSC Certificate">📘 SSC Certificate</option>
                          <option value="HSC Certificate">📙 HSC Certificate</option>
                          <option value="Birth Certificate">👶 Birth Certificate</option>
                          <option value="Trade License">🎫 Trade License</option>
                          <option value="Tax Certificate">💰 Tax Certificate (TIN)</option>
                          <option value="Utility Bill">📄 Utility Bill</option>
                          <option value="Medical Report">⚕️ Medical Report</option>
                          <option value="Police Clearance">🛡️ Police Clearance</option>
                          <option value="Family Card">👨‍👩‍👧‍👦 Family Card</option>
                          <option value="Farmer Card">🧑‍🌾 Farmer Card</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-white ml-1">Select File *</label>
                        <input
                          id="doc-file-input"
                          type="file"
                          onChange={(e) => setDocFile(e.target.files ? e.target.files[0] : null)}
                          accept="image/*,.pdf"
                          className="w-full bg-slate-900 border border-white/10 rounded-xl py-2.5 px-4 text-text focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all text-sm file:mr-4 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-primary-500/20 file:text-primary-400 hover:file:bg-primary-500/30 cursor-pointer"
                          required
                        />
                      </div>
                    </div>

                    <div className="flex justify-end pt-4 border-t border-white/10">
                      <button
                        type="submit"
                        disabled={uploadingDoc}
                        className="px-8 py-3 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white font-semibold rounded-xl flex items-center gap-2 transition-all duration-200 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Upload size={18} />
                        {uploadingDoc ? 'Uploading...' : 'Upload Document'}
                      </button>
                    </div>
                  </form>
              </div>
            } />

            <Route path="/permissions" element={
              <div className="animate-in">
                <div className="glass-card rounded-2xl p-8">
                  <h2 className="text-2xl font-semibold text-white mb-6">All Consent Requests</h2>
                  {requests.length === 0 ? (
                    <div className="text-center py-8 text-text-muted">
                      <Shield size={48} className="mx-auto mb-4 opacity-40" />
                      <p>No requests found.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {requests.map(renderConsentCard)}
                    </div>
                  )}
                </div>
              </div>
            } />

            <Route path="/medical" element={
              <div className="animate-in">
                <div className="glass-card rounded-2xl p-8">

                  {profile ? renderMedicalInfo() : <p className="text-text-muted">Loading profile...</p>}
                </div>
              </div>
            } />

            <Route path="/crime" element={
              <div className="animate-in">
                <div className="glass-card rounded-2xl p-8">

                  {profile ? renderCrimeInfo() : <p className="text-text-muted">Loading profile...</p>}
                </div>
              </div>
            } />

            <Route path="/notifications" element={
              <div className="animate-in">
                <div className="glass-card rounded-2xl p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-semibold text-white font-display">Notifications</h2>
                    {notifications.filter(n => !readIds.includes(n.id)).length > 0 && (
                      <button
                        onClick={markAllRead}
                        className="px-4 py-2 bg-primary-500/10 text-primary-400 hover:bg-primary-500/20 border border-primary-500/25 rounded-xl transition-all duration-200 text-sm font-medium"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>

                  {notifications.length === 0 ? (
                    <div className="text-center py-12 text-text-muted">
                      <Bell size={48} className="mx-auto mb-4 opacity-40" />
                      <p className="font-semibold text-lg text-white">You're all caught up!</p>
                      <p className="text-sm mt-1">No new notifications at the moment.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {notifications.map((n) => {
                        const isRead = readIds.includes(n.id);
                        return (
                          <div
                            key={n.id}
                            onClick={() => {
                              markAsRead(n.id);
                              navigate(n.link);
                            }}
                            className={`p-5 rounded-2xl border transition-all duration-300 cursor-pointer flex gap-4 items-start relative overflow-hidden group ${
                              isRead
                                ? 'bg-surface/30 border-white/5 hover:bg-surface/50'
                                : 'bg-surface border-primary-500/20 shadow-md shadow-primary-950/20 hover:border-primary-500/30'
                            }`}
                          >
                            {!isRead && (
                              <div className="absolute top-0 left-0 w-1 h-full bg-primary-500" />
                            )}
                            <div className={`p-3 rounded-xl shrink-0 ${
                              n.severity === 'danger' ? 'bg-danger/10 text-danger' :
                              n.severity === 'warning' ? 'bg-warning/10 text-warning' :
                              'bg-primary-500/10 text-primary-400'
                            }`}>
                              {n.severity === 'danger' ? <ShieldAlert size={20} /> :
                               n.severity === 'warning' ? <FileWarning size={20} /> :
                               <AlertCircle size={20} />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <h3 className={`font-semibold text-base ${isRead ? 'text-text-muted' : 'text-white'}`}>
                                  {n.title}
                                </h3>
                                <span className="text-xs text-text-muted shrink-0">
                                  {new Date(n.createdAt).toLocaleDateString()} at {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                              <p className="text-sm text-text-muted mt-1 group-hover:text-text transition-colors duration-200">
                                {n.description}
                              </p>
                              {!isRead && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    markAsRead(n.id);
                                  }}
                                  className="text-xs text-primary-400 hover:text-primary-300 font-medium mt-3 inline-flex items-center gap-1"
                                >
                                  Mark as read
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            } />

            <Route path="*" element={<Navigate to="/citizen" replace />} />
          </Routes>
        </div>
      </div>

      {/* Floating Support Widget */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
        {/* Support Chat Box */}
        {supportOpen && (
          <div className="w-96 max-w-[calc(100vw-2rem)] h-[min(620px,calc(100dvh-8rem))] bg-surface border border-white/10 rounded-2xl flex flex-col shadow-2xl backdrop-blur-xl mb-4 animate-slide-up overflow-hidden">
            <div className="flex items-center justify-between border-b border-white/10 bg-surface-hover/50 px-4 py-3">
              <h4 className="font-semibold text-text">Citizen Chat</h4>
              <button type="button" aria-label="Close citizen chat" onClick={() => setSupportOpen(false)} className="px-2 text-xl text-text-muted hover:text-text">×</button>
            </div>
            <div className="flex gap-1 border-b border-white/10 px-3 pt-2" aria-label="Chat mode">
              <button type="button" aria-pressed={chatTab === 'assistant'} onClick={() => setChatTab('assistant')} className={chatTab === 'assistant' ? 'border-b-2 border-primary-500 px-3 pb-2 text-sm text-primary-400' : 'px-3 pb-2 text-sm text-text-muted'}>AI Assistant</button>
              <button type="button" aria-pressed={chatTab === 'support'} onClick={() => setChatTab('support')} className={chatTab === 'support' ? 'border-b-2 border-primary-500 px-3 pb-2 text-sm text-primary-400' : 'px-3 pb-2 text-sm text-text-muted'}>Support</button>
            </div>
            {chatTab === 'assistant' && user ? (
              <div className="min-h-0 flex-1 overflow-y-auto">
                <CorrectionAssistant key={assistantCategory ?? 'general'} userId={user.id} profile={profile ?? {}} initialCategory={assistantCategory} onClose={() => setSupportOpen(false)} />
              </div>
            ) : <>
            {/* Message List */}
            <div
              id="support-chat-messages"
              className="flex-1 p-4 overflow-y-auto space-y-3 flex flex-col scrollbar-thin"
            >
              {supportMessages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-text-muted">
                  <span className="text-3xl mb-2">💬</span>
                  <p className="text-xs font-semibold text-white">{lang === 'en' ? 'How can we help you today?' : 'আজ আমরা আপনাকে কীভাবে সাহায্য করতে পারি?'}</p>
                  <p className="text-[10px] mt-1">{lang === 'en' ? 'Send a message to our system administrators for assistance.' : 'সহায়তার জন্য আমাদের সিস্টেম অ্যাডমিনিস্ট্রেটরদের একটি বার্তা পাঠান।'}</p>
                </div>
              ) : (
                supportMessages.map((msg) => {
                  const isAdmin = msg.sender.role === 'Admin';
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col max-w-[80%] ${isAdmin ? 'self-start items-start' : 'self-end items-end'}`}
                    >
                      <div className={`px-3 py-2 rounded-2xl text-xs ${
                        isAdmin
                          ? 'bg-white/5 text-white rounded-tl-none border border-white/5'
                          : 'bg-primary-600 text-white rounded-tr-none'
                      }`}>
                        {msg.message}
                      </div>
                      <span className="text-[8px] text-text-muted mt-1 px-1">
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  );
                })
              )}
            </div>

            {/* Resolved Banner */}
            {profile?.user?.supportStatus === 'Closed' && (
              <div className="px-3 py-2 bg-danger/10 border-t border-white/5 text-[10px] text-danger text-center font-medium">
                {t('resolvedBanner', 'This ticket is resolved. Sending a new message will automatically reopen it.')}
              </div>
            )}

            {/* Input Form */}
            <form
              onSubmit={handleSendSupportMessage}
              className="p-3 bg-slate-950/40 border-t border-white/5 flex gap-2"
            >
              <input
                type="text"
                value={newSupportMessage}
                onChange={(e) => setNewSupportMessage(e.target.value)}
                placeholder={t('typeMessage', 'Type your message...')}
                className="flex-1 bg-surface-hover/30 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-text-muted/50 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
              <button
                type="submit"
                className="bg-primary-600 hover:bg-primary-500 text-white font-medium px-4 py-2 rounded-xl text-xs transition-colors shrink-0"
              >
                {t('send', 'Send')}
              </button>
            </form>
            </>}
          </div>
        )}

        {/* Floating Bubble Button */}
        <button
          type="button"
          aria-label={supportOpen ? "Close citizen chat" : "Open citizen chat"}
          aria-expanded={supportOpen}
          onClick={() => supportOpen ? setSupportOpen(false) : openCorrectionAssistant()}
          className="w-14 h-14 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-all duration-300 relative cursor-pointer group"
        >
          {supportOpen ? (
            <span className="text-xl font-bold font-sans">×</span>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-message-circle">
              <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>
            </svg>
          )}

          {/* Unread Badge Notification */}
          {supportUnread && (
            <div className="absolute top-0 right-0 w-3.5 h-3.5 bg-danger rounded-full border-2 border-background animate-pulse" />
          )}

          {/* Hover tooltip */}
          {!supportOpen && (
            <span className="absolute right-16 scale-0 group-hover:scale-100 bg-slate-900 border border-white/10 text-white text-[10px] px-2.5 py-1.5 rounded-lg whitespace-nowrap shadow-xl transition-all duration-200">
              {t('needHelp', 'Need Help? Chat with Us')}
            </span>
          )}
        </button>
      </div>

      {/* Prescription Preview Modal */}
      {previewImage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="relative max-w-3xl w-full bg-slate-900 border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
            <div className="p-4 border-b border-white/5 flex items-center justify-between bg-slate-950/40">
              <h3 className="text-sm font-semibold text-white">{t('prescription', 'Prescription')}</h3>
              <button
                onClick={() => setPreviewImage(null)}
                className="text-text-muted hover:text-white transition-colors text-lg font-bold bg-transparent border-0 cursor-pointer"
              >
                ×
              </button>
            </div>
            <div className="p-6 flex items-center justify-center bg-black/20 overflow-auto max-h-[80vh]">
              <img
                src={previewImage}
                alt="Prescription"
                className="max-w-full max-h-[70vh] object-contain rounded-lg"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CitizenDashboard;
