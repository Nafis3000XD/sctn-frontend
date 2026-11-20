import { parseRequestedData } from '../lib/consent';
import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { Home, Search, FileCheck, ShieldAlert, FileText, CheckCircle } from 'lucide-react';
import api, { API_ORIGIN } from '../lib/axios';
import { useAuthStore } from '../store/useAuthStore';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useTranslation } from '../store/useSettingsStore';
import { CitizenFullDetailsView } from '../components/CitizenFullDetailsView';
import { VerifierRoleWidgets } from '../components/VerifierRoleWidgets';

const fieldSuggestions: Record<string, string[]> = {
  age: ['18', '21', '30', '65'],
  income: ['20000', '30000', '50000', '80000', '100000'],
  net_take_home_pay: ['15000', '25000', '40000', '70000', '90000'],
  total_tax_paid: ['1000', '5000', '10000', '25000'],
  employment_status: ['Full-Time', 'Part-Time', 'Freelance', 'Contractual', 'Business Owner'],
  tin: ['123456789012'],
  primary_income_source: ['Salary', 'Freelance Remittance', 'Business Profit', 'Investments'],
  ssc_gpa: ['3.0', '4.0', '4.5', '5.0'],
  cgpa: ['2.5', '3.0', '3.5', '3.8', '4.0'],
  blood_type: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
  allergies: ['None', 'Peanuts', 'Penicillin', 'Dust', 'Lactose'],
  chronic_conditions: ['None', 'Asthma', 'Diabetes', 'Hypertension'],
  medical_history: ['None', 'Heart Surgery', 'Appendectomy'],
  immunization_status: ['Fully Vaccinated', 'Partially Vaccinated', 'Not Vaccinated'],
  insurance_provider: ['Green Delta Insurance', 'MetLife', 'Jiban Bima Corporation'],
  insurance_policy_number: ['POL-12345', 'INS-98765']
};

const VerifierDashboard = () => {
  const { t, lang } = useTranslation();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [citizenId, setCitizenId] = useState('');

  const categories = [
    { id: 'identity', label: 'Identity Info', description: 'NID, Passport, Driving License, Trade License, TIN, Land Record' },
    { id: 'education', label: 'Education Info', description: 'SSC, HSC, University Degree, CGPA' },
    { id: 'financial', label: 'Financial Info', description: 'Occupation, Monthly Income, Tax Compliance, Bank Account & Wealth' },
    { id: 'medical', label: 'Medical Info', description: 'Blood Type, Allergies, Chronic Conditions, Medical History' },
    { id: 'crime', label: 'Crime Info', description: 'Has Criminal Record, Crime Logs, Fine Logs' }
  ];

  const getAllowedCategories = (role: string) => {
    if (role === 'JobInterviewer' || role === 'UniversityAuthority') {
      return ['identity', 'education', 'crime'];
    }
    if (role === 'BankLoanOfficer') {
      return ['identity', 'financial', 'crime', 'medical'];
    }
    if (role === 'Doctor') {
      return ['medical'];
    }
    if (role === 'IntelligenceDepartment') {
      return ['identity', 'crime'];
    }
    return ['identity', 'education', 'financial', 'medical', 'crime'];
  };

  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);


  useEffect(() => {
    if (user?.role) {
      if (user.role === 'JobInterviewer') setSelectedCategories(['identity', 'education']);
      else if (user.role === 'BankLoanOfficer') setSelectedCategories(['identity', 'financial']);
      else if (user.role === 'Doctor') setSelectedCategories(['medical']);
      else if (user.role === 'IntelligenceDepartment') setSelectedCategories(['identity', 'crime']);
      else setSelectedCategories(['identity', 'education', 'financial', 'medical', 'crime']);
    }
  }, [user?.role]);

  const [requestStatus, setRequestStatus] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Direct search states for Admin and Intelligence
  const [directSearchId, setDirectSearchId] = useState('');
  const [searchedProfile, setSearchedProfile] = useState<any>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [searchingProfile, setSearchingProfile] = useState(false);

  const handleDirectSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!directSearchId.trim()) return;
    setSearchingProfile(true);
    setSearchError(null);
    setSearchedProfile(null);
    try {
      const res = await api.get(`/verifier/citizen-profile/details/${directSearchId.trim()}`);
      setSearchedProfile(res.data);
    } catch (err: any) {
      setSearchError(err.response?.data?.message || 'Citizen profile not found.');
    } finally {
      setSearchingProfile(false);
    }
  };

  // Verifications & Rules States
  const [consents, setConsents] = useState<any[]>([]);
  const [loadingConsents, setLoadingConsents] = useState(true);
  const [selectedConsent, setSelectedConsent] = useState<any>(null);
  const [rules, setRules] = useState<any[]>([
    { field: 'age', operator: '>=', value: '18' }
  ]);
  const [evaluationResults, setEvaluationResults] = useState<any[] | null>(null);
  const [evaluating, setEvaluating] = useState(false);
  const [evalError, setEvalError] = useState<string | null>(null);

  // Medical Visit Log states for Doctors
  const [selectedCitizenForLogs, setSelectedCitizenForLogs] = useState<{ citizenId: string, fullName: string } | null>(null);
  const [visitLogs, setVisitLogs] = useState<any[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [logDoctor, setLogDoctor] = useState('');
  const [logHospital, setLogHospital] = useState('');
  const [logDate, setLogDate] = useState('');
  const [logPrescriptionFile, setLogPrescriptionFile] = useState<File | null>(null);
  const [logReason, setLogReason] = useState('');
  const [logPrescriptionPdfFile, setLogPrescriptionPdfFile] = useState<File | null>(null);
  const [submittingLog, setSubmittingLog] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Criminal Record, Fines & Crime Logs states for Intelligence
  const [selectedCitizenForCrime, setSelectedCitizenForCrime] = useState<{ citizenId: string, fullName: string } | null>(null);
  const [intelFines, setIntelFines] = useState<any[]>([]);
  const [intelCrimeLogs, setIntelCrimeLogs] = useState<any[]>([]);
  const [loadingIntelCrime, setLoadingIntelCrime] = useState(false);

  // New Fine form states
  const [intelFineReason, setIntelFineReason] = useState('');
  const [intelFineAmount, setIntelFineAmount] = useState('');
  const [intelFineDate, setIntelFineDate] = useState('');
  const [submittingIntelFine, setSubmittingIntelFine] = useState(false);

  // New Crime Log form states
  const [intelOffense, setIntelOffense] = useState('');
  const [intelCaseNumber, setIntelCaseNumber] = useState('');
  const [intelCrimeDate, setIntelCrimeDate] = useState('');
  const [intelSeverity, setIntelSeverity] = useState('Felony');
  const [intelStatus, setIntelStatus] = useState('Convicted');
  const [intelCrimeDetails, setIntelCrimeDetails] = useState('');
  const [submittingIntelCrime, setSubmittingIntelCrime] = useState(false);


  const fetchConsents = async () => {
    try {
      setLoadingConsents(true);
      const res = await api.get('/verifier/consents');
      setConsents(res.data);
    } catch {
      console.error('Failed to fetch consents');
    } finally {
      setLoadingConsents(false);
    }
  };

  useEffect(() => {
    fetchConsents();
  }, []);

  useEffect(() => {
    // Poll at 1s to keep the dashboard up-to-date with real-time info.
    const interval = setInterval(async () => {
      try {
        const res = await api.get('/verifier/consents');
        setConsents(res.data);
      } catch (e) {
        console.error('Failed to poll consents', e);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const getRoleLabel = (role?: string) => {
    if (!role) return '';
    return role.replace(/([A-Z])/g, ' $1').trim();
  };

  const handleRequestAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    setRequestStatus(null);
    setIsSubmitting(true);
    try {
      const categoryMap: Record<string, string> = {
        identity: 'Identity Info',
        education: 'Education Info',
        financial: 'Financial Info',
        medical: 'Medical Info',
        crime: 'Crime Info'
      };
      const requestedDataArr = selectedCategories.map(c => categoryMap[c]).filter(Boolean);

      await api.post('/verifier/request-access', {
        citizenId,
        requestedData: requestedDataArr
      });
      setRequestStatus('Request sent successfully. Waiting for citizen approval.');
      setCitizenId('');
      fetchConsents(); // Refresh consents list
    } catch (err: any) {
      setRequestStatus(err.response?.data?.message || 'Failed to send request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const applyPreset = (presetRules: any[]) => {
    setRules(presetRules);
    setEvaluationResults(null);
    setEvalError(null);
  };

  const addRule = () => {
    setRules([...rules, { field: 'age', operator: '>=', value: '' }]);
  };

  const removeRule = (index: number) => {
    setRules(rules.filter((_, i) => i !== index));
  };

  const handleRuleChange = (index: number, key: string, value: any) => {
    const newRules = [...rules];
    newRules[index][key] = value;
    setRules(newRules);
  };

  const evaluatePolicy = async (targetCitizenId: string) => {
    setEvaluating(true);
    setEvalError(null);
    setEvaluationResults(null);
    try {
      const formattedRules = rules.map(rule => {
        let val = rule.value;
        const stringFields = ['blood_type', 'allergies', 'chronic_conditions', 'medical_history', 'immunization_status', 'insurance_provider', 'insurance_policy_number'];
        if (rule.field === 'tax_clearance' || rule.field === 'has_criminal_record') {
          val = val === 'true';
        } else if (stringFields.includes(rule.field)) {
          val = String(val);
        } else {
          val = parseFloat(val);
        }
        return {
          field: rule.field,
          operator: rule.operator,
          value: val
        };
      });

      const res = await api.post('/verifier/evaluate-policy', {
        citizenId: targetCitizenId,
        rules: formattedRules
      });
      setEvaluationResults(res.data.results);
    } catch (err: any) {
      setEvalError(err.response?.data?.message || 'Failed to evaluate policy');
    } finally {
      setEvaluating(false);
    }
  };

  // Emergency lookup states for Doctor
  const [emergencyCitizenId, setEmergencyCitizenId] = useState('');
  const [emergencyData, setEmergencyData] = useState<any>(null);
  const [emergencyError, setEmergencyError] = useState<string | null>(null);
  const [submittingEmergency, setSubmittingEmergency] = useState(false);

  const handleEmergencyAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmergencyError(null);
    setEmergencyData(null);
    setSubmittingEmergency(true);
    try {
      const res = await api.post('/verifier/medical/emergency', { citizenId: emergencyCitizenId });
      setEmergencyData(res.data);
    } catch (err: any) {
      setEmergencyError(err.response?.data?.message || 'Failed to fetch emergency details');
    } finally {
      setSubmittingEmergency(false);
    }
  };

  const handleOpenVisitLogs = async (citizenId: string, fullName: string) => {
    setSelectedCitizenForLogs({ citizenId, fullName });
    setSelectedConsent(null); // close rule evaluation if open
    setLoadingLogs(true);
    try {
      const res = await api.get(`/verifier/medical/visit-logs/${citizenId}`);
      setVisitLogs(res.data);
    } catch (err) {
      console.error('Failed to load visit logs:', err);
    } finally {
      setLoadingLogs(false);
    }
  };

  const fetchVisitLogs = async (citizenId: string) => {
    try {
      const res = await api.get(`/verifier/medical/visit-logs/${citizenId}`);
      setVisitLogs(res.data);
    } catch (err) {
      console.error('Failed to load visit logs:', err);
    }
  };

  const handleAddVisitLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCitizenForLogs) return;
    if (!logDoctor.trim() || !logHospital.trim() || !logDate.trim()) {
      alert(lang === 'en' ? 'Doctor name, Hospital name, and Visit date are required.' : 'ডাক্তারের নাম, হাসপাতালের নাম এবং পরিদর্শনের তারিখ আবশ্যক।');
      return;
    }
    setSubmittingLog(true);
    try {
      const formData = new FormData();
      formData.append('citizenId', selectedCitizenForLogs.citizenId);
      formData.append('doctorName', logDoctor);
      formData.append('hospitalName', logHospital);
      formData.append('visitDate', logDate);
      formData.append('reason', logReason);
      if (logPrescriptionFile) {
        formData.append('prescription', logPrescriptionFile);
      }
      if (logPrescriptionPdfFile) {
        formData.append('prescriptionPdf', logPrescriptionPdfFile);
      }
      await api.post('/verifier/medical/visit-logs', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setLogDoctor('');
      setLogHospital('');
      setLogDate('');
      setLogReason('');
      setLogPrescriptionFile(null);
      setLogPrescriptionPdfFile(null);
      const fileInput = document.getElementById('visit-prescription-input') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      const pdfInput = document.getElementById('visit-pdf-input') as HTMLInputElement;
      if (pdfInput) pdfInput.value = '';

      alert(lang === 'en' ? 'Visit log added successfully!' : 'পরিদর্শন লগ সফলভাবে যোগ করা হয়েছে!');
      await fetchVisitLogs(selectedCitizenForLogs.citizenId);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to add visit log');
    } finally {
      setSubmittingLog(false);
    }
  };

  const handleDeleteVisitLog = async (id: string) => {
    if (!selectedCitizenForLogs) return;
    if (!confirm(lang === 'en' ? 'Are you sure you want to delete this visit log?' : 'আপনি কি নিশ্চিত যে আপনি এই পরিদর্শন লগটি মুছে ফেলতে চান?')) return;
    try {
      await api.delete(`/verifier/medical/visit-logs/${id}`);
      await fetchVisitLogs(selectedCitizenForLogs.citizenId);
      alert(lang === 'en' ? 'Visit log deleted successfully!' : 'পরিদর্শন লগ সফলভাবে মুছে ফেলা হয়েছে!');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete visit log');
    }
  };

  const handleOpenCriminalRecords = async (citizenId: string, fullName: string) => {
    setSelectedCitizenForCrime({ citizenId, fullName });
    setSelectedConsent(null); // close rule evaluation if open
    setSelectedCitizenForLogs(null); // close medical logs if open
    setLoadingIntelCrime(true);
    try {
      const [finesRes, logsRes] = await Promise.all([
        api.get(`/verifier/crime/fines/${citizenId}`),
        api.get(`/verifier/crime/crime-logs/${citizenId}`)
      ]);
      setIntelFines(finesRes.data);
      setIntelCrimeLogs(logsRes.data);
    } catch (err) {
      console.error('Failed to load criminal info:', err);
    } finally {
      setLoadingIntelCrime(false);
    }
  };

  const fetchIntelCrimeData = async (citizenId: string) => {
    try {
      const [finesRes, logsRes] = await Promise.all([
        api.get(`/verifier/crime/fines/${citizenId}`),
        api.get(`/verifier/crime/crime-logs/${citizenId}`)
      ]);
      setIntelFines(finesRes.data);
      setIntelCrimeLogs(logsRes.data);
    } catch (err) {
      console.error('Failed to load criminal info:', err);
    }
  };

  const handleAddIntelFine = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCitizenForCrime) return;
    if (!intelFineReason.trim()) {
      alert(lang === 'en' ? 'Fine reason is required.' : 'জরিমানার কারণ আবশ্যক।');
      return;
    }
    setSubmittingIntelFine(true);
    try {
      await api.post('/verifier/crime/fines', {
        citizenId: selectedCitizenForCrime.citizenId,
        fineReason: intelFineReason,
        fineAmount: intelFineAmount ? parseFloat(intelFineAmount) : null,
        fineDate: intelFineDate || new Date().toISOString().split('T')[0]
      });
      setIntelFineReason('');
      setIntelFineAmount('');
      setIntelFineDate('');
      alert(lang === 'en' ? 'Fine recorded successfully!' : 'জরিমানা সফলভাবে রেকর্ড করা হয়েছে!');
      await fetchIntelCrimeData(selectedCitizenForCrime.citizenId);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to add fine');
    } finally {
      setSubmittingIntelFine(false);
    }
  };

  const handleUpdateIntelFineStatus = async (fineId: string, isCleared: boolean) => {
    if (!selectedCitizenForCrime) return;
    try {
      await api.patch(`/verifier/crime/fines/${fineId}`, {
        isCleared: !isCleared,
        clearanceDate: !isCleared ? new Date().toISOString().split('T')[0] : null
      });
      await fetchIntelCrimeData(selectedCitizenForCrime.citizenId);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update fine status');
    }
  };

  const handleDeleteIntelFine = async (fineId: string) => {
    if (!selectedCitizenForCrime) return;
    if (!confirm(lang === 'en' ? 'Are you sure you want to delete this fine record?' : 'আপনি কি নিশ্চিত যে আপনি এই জরিমানার রেকর্ডটি মুছে ফেলতে চান?')) return;
    try {
      await api.delete(`/verifier/crime/fines/${fineId}`);
      await fetchIntelCrimeData(selectedCitizenForCrime.citizenId);
      alert(lang === 'en' ? 'Fine record deleted successfully!' : 'জরিমানার রেকর্ড সফলভাবে মুছে ফেলা হয়েছে!');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete fine record');
    }
  };

  const handleAddIntelCrimeLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCitizenForCrime) return;
    if (!intelOffense.trim() || !intelCaseNumber.trim()) {
      alert(lang === 'en' ? 'Offense and Case number are required.' : 'অপরাধ এবং মামলা নম্বর আবশ্যক।');
      return;
    }
    setSubmittingIntelCrime(true);
    try {
      await api.post('/verifier/crime/crime-logs', {
        citizenId: selectedCitizenForCrime.citizenId,
        offense: intelOffense,
        caseNumber: intelCaseNumber,
        severity: intelSeverity,
        status: intelStatus,
        details: intelCrimeDetails,
        crimeDate: intelCrimeDate || new Date().toISOString().split('T')[0]
      });
      setIntelOffense('');
      setIntelCaseNumber('');
      setIntelCrimeDate('');
      setIntelSeverity('Felony');
      setIntelStatus('Convicted');
      setIntelCrimeDetails('');
      alert(lang === 'en' ? 'Crime log recorded successfully!' : 'অপরাধের লগ সফলভাবে রেকর্ড করা হয়েছে!');
      await fetchIntelCrimeData(selectedCitizenForCrime.citizenId);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to add crime log');
    } finally {
      setSubmittingIntelCrime(false);
    }
  };

  const handleDeleteIntelCrimeLog = async (logId: string) => {
    if (!selectedCitizenForCrime) return;
    if (!confirm(lang === 'en' ? 'Are you sure you want to delete this crime log?' : 'আপনি কি নিশ্চিত যে আপনি এই অপরাধের লগটি মুছে ফেলতে চান?')) return;
    try {
      await api.delete(`/verifier/crime/crime-logs/${logId}`);
      await fetchIntelCrimeData(selectedCitizenForCrime.citizenId);
      alert(lang === 'en' ? 'Crime log deleted successfully!' : 'অপরাধের লগ সফলভাবে মুছে ফেলা হয়েছে!');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete crime log');
    }
  };

  const links = [
    { name: 'Dashboard', path: '/verifier', icon: <Home size={20} /> },
    { name: 'Search Citizen', path: '/verifier/search', icon: <Search size={20} /> },
    { name: 'Access Grants', path: '/verifier/grants', icon: <FileCheck size={20} /> },
    ...(user?.role === 'Admin' ? [{ name: 'Admin Portal', path: '/admin', icon: <ShieldAlert size={20} /> }] : []),
  ];

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar links={links} />

      <div className="flex-1 ml-64 relative overflow-y-auto h-screen">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-primary-600/10 blur-[120px] pointer-events-none" />

        <Navbar title={`${getRoleLabel(user?.role)} Portal`} />

        <div className="p-8 relative z-10">
          <Routes>
            <Route path="/" element={
              <div className="space-y-8 animate-in">
                <div className="glass-card rounded-2xl p-8 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-accent/15 rounded-full blur-[80px]" />
                  <h1 className="text-3xl font-bold text-white mb-2 relative">
                    Welcome to the {getRoleLabel(user?.role)} Portal
                  </h1>
                  <p className="text-text-muted relative">
                    Use the navigation options to evaluate citizen records, manage compliance checks, and inspect network logs securely.
                  </p>
                </div>

                {/* Role Specific Polished Widgets & Calculators */}
                <VerifierRoleWidgets role={user?.role || ''} navigate={navigate} />

                {/* Quick Navigation Shortcuts */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div
                    onClick={() => navigate('/verifier/search')}
                    className="glass-card rounded-2xl p-5 flex items-center space-x-4 hover:scale-[1.02] transition-transform duration-300 cursor-pointer"
                  >
                    <div className="p-3 bg-primary-600/20 rounded-xl text-primary-400 shrink-0">
                      <Search size={24} />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-white">Search Citizen</h3>
                      <p className="text-text-muted text-xs mt-0.5">Request consent or search records directly.</p>
                    </div>
                  </div>

                  <div
                    onClick={() => navigate('/verifier/grants')}
                    className="glass-card rounded-2xl p-5 flex items-center space-x-4 hover:scale-[1.02] transition-transform duration-300 cursor-pointer"
                  >
                    <div className="p-3 bg-success/20 rounded-xl text-success shrink-0">
                      <CheckCircle size={24} />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-white">Active Access Grants</h3>
                      <p className="text-text-muted text-xs mt-0.5">Evaluate rules on approved consent records.</p>
                    </div>
                  </div>
                </div>
              </div>
            } />

            <Route path="/search" element={
              user?.role === 'IntelligenceDepartment' || user?.role === 'Admin' ? (
                <div className="space-y-6 animate-in">
                  <div className="glass-card rounded-2xl p-8 max-w-2xl mx-auto">
                    <div className="flex items-center space-x-3 mb-6">
                      <Search size={28} className="text-primary-400" />
                      <h2 className="text-2xl font-semibold text-white">Search Citizen Records</h2>
                    </div>

                    <p className="text-text-muted mb-6">
                      Enter a Citizen ID to view their full profile details. As an Admin/Intelligence Department officer, you have direct clearance to inspect all records.
                    </p>

                    {searchError && (
                      <div className="p-4 rounded-xl mb-6 text-sm font-medium bg-danger/15 text-danger border border-danger/20">
                        {searchError}
                      </div>
                    )}

                    <form onSubmit={handleDirectSearch} className="space-y-6">
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-text-muted ml-1">Citizen ID</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-muted">
                            <Search size={18} />
                          </div>
                          <input
                            type="text"
                            value={directSearchId}
                            onChange={(e) => setDirectSearchId(e.target.value)}
                            className="w-full bg-surface-hover/50 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-text placeholder-text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all duration-200"
                            placeholder="e.g. SCTN-987654"
                            required
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={searchingProfile}
                        className="w-full bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white font-medium py-3 rounded-xl transition-all duration-300 transform hover:scale-[1.02] shadow-lg shadow-primary-500/25 disabled:opacity-70 disabled:hover:scale-100 flex items-center justify-center cursor-pointer"
                      >
                        {searchingProfile ? (
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          'Search Profile'
                        )}
                      </button>
                    </form>
                  </div>

                  {searchedProfile && (
                    <div className="max-w-6xl mx-auto">
                      <CitizenFullDetailsView profile={searchedProfile} />
                    </div>
                  )}
                </div>
              ) : (
                <div className={`grid grid-cols-1 ${user?.role === 'Doctor' ? 'lg:grid-cols-2' : ''} gap-8 max-w-6xl mx-auto animate-in text-left`}>
                  {/* Standard Request Form */}
                  <div className="glass-card rounded-2xl p-8 border border-white/10">
                    <div className="flex items-center space-x-3 mb-6">
                      <ShieldAlert size={28} className="text-warning" />
                      <h2 className="text-2xl font-semibold text-white">Request Data Access</h2>
                    </div>

                    <p className="text-text-muted mb-6">
                      Enter the Citizen ID to request consent for viewing their verified records.
                      Access will only be granted upon explicit citizen approval.
                    </p>

                    {requestStatus && (
                      <div className={`p-4 rounded-xl mb-6 text-sm font-medium ${
                        requestStatus.includes('success') ? 'bg-success/15 text-success border border-success/20' : 'bg-danger/15 text-danger border border-danger/20'
                      }`}>
                        {requestStatus}
                      </div>
                    )}

                    <form onSubmit={handleRequestAccess} className="space-y-6">
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-text-muted ml-1">Citizen ID</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-muted">
                            <Search size={18} />
                          </div>
                          <input
                            type="text"
                            value={citizenId}
                            onChange={(e) => setCitizenId(e.target.value)}
                            className="w-full bg-surface-hover/50 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-text placeholder-text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all duration-200"
                            placeholder="e.g. SCTN-987654"
                            required
                          />
                        </div>
                      </div>

                      {/* Suggested Data Selection Cards */}
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-text-muted ml-1">Requested Data Categories</label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                          {categories.map((cat) => {
                            const isAllowed = getAllowedCategories(user?.role || '').includes(cat.id);
                            const isSelected = selectedCategories.includes(cat.id);
                            return (
                              <div
                                key={cat.id}
                                onClick={() => {
                                  if (!isAllowed) return;
                                  if (isSelected) {
                                    setSelectedCategories(selectedCategories.filter(id => id !== cat.id));
                                  } else {
                                    setSelectedCategories([...selectedCategories, cat.id]);
                                  }
                                }}
                                className={`p-3 rounded-xl border transition-all cursor-pointer text-left flex flex-col justify-between ${
                                  isSelected
                                    ? 'bg-primary-600/10 border-primary-500 text-white'
                                    : isAllowed
                                      ? 'bg-surface-hover/20 border-white/10 hover:border-white/25 text-text'
                                      : 'bg-surface/5 border-white/5 opacity-40 cursor-not-allowed text-text-muted'
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <span className="font-semibold text-xs text-white">{cat.label}</span>
                                  {isSelected && <span className="text-primary-400 text-xs">✓ Selected</span>}
                                  {!isAllowed && <span className="text-[10px] text-danger-450 bg-danger/10 px-1.5 py-0.5 rounded">Blocked</span>}
                                </div>
                                <span className="text-[10px] text-text-muted mt-1 leading-normal">{cat.description}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmitting || selectedCategories.length === 0}
                        className="w-full bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white font-semibold py-3 rounded-xl transition-all duration-300 transform hover:scale-[1.02] shadow-lg shadow-primary-500/25 disabled:opacity-70 disabled:hover:scale-100 flex items-center justify-center cursor-pointer"
                      >
                        {isSubmitting ? (
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          'Send Consent Request'
                        )}
                      </button>
                    </form>
                  </div>

                  {/* Doctor Emergency Override Card */}
                  {user?.role === 'Doctor' && (
                    <div className="glass-card rounded-2xl p-8 border border-danger-500/30 bg-danger-950/5 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center space-x-3 mb-6">
                          <span className="text-2xl animate-pulse">🚨</span>
                          <h2 className="text-2xl font-semibold text-white">Emergency Override</h2>
                        </div>

                        <p className="text-text-muted mb-6 text-sm">
                          Use this ONLY in case of critical emergency if the patient is unconscious or unresponsive.
                          This action bypasses standard consent to fetch lifesaving contact and blood details, and is strictly audited.
                        </p>

                        {emergencyError && (
                          <div className="p-4 rounded-xl mb-6 text-sm font-medium bg-danger/15 text-danger border border-danger/20">
                            {emergencyError}
                          </div>
                        )}

                        <form onSubmit={handleEmergencyAccess} className="space-y-6">
                          <div className="space-y-1">
                            <label className="text-sm font-medium text-text-muted ml-1">Citizen ID</label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-muted">
                                <Search size={18} />
                              </div>
                              <input
                                type="text"
                                value={emergencyCitizenId}
                                onChange={(e) => setEmergencyCitizenId(e.target.value)}
                                className="w-full bg-slate-900 border border-white/10 focus:border-danger-500 rounded-xl py-3 pl-10 pr-4 text-text placeholder-text-muted/50 focus:outline-none focus:ring-2 focus:ring-danger-500/30 transition-all duration-200"
                                placeholder="e.g. SCTN-987654"
                                required
                              />
                            </div>
                          </div>

                          <button
                            type="submit"
                            disabled={submittingEmergency}
                            className="w-full bg-gradient-to-r from-danger-600 to-danger-500 hover:from-danger-500 hover:to-danger-400 text-white font-semibold py-3 rounded-xl transition-all duration-300 transform hover:scale-[1.02] shadow-lg shadow-danger-500/25 disabled:opacity-70 disabled:hover:scale-100 flex items-center justify-center cursor-pointer"
                          >
                            {submittingEmergency ? (
                              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                              'Emergency Override Access'
                            )}
                          </button>
                        </form>
                      </div>

                      {/* Display Emergency Details */}
                      {emergencyData && (
                        <div className="mt-8 bg-danger-500/10 border border-danger-500/20 rounded-xl p-5 text-left animate-in relative overflow-hidden">
                          <div className="absolute top-0 right-0 bg-danger-500 text-white text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-bl">
                            Emergency Data
                          </div>
                          <h4 className="font-bold text-white mb-4 text-base">Patient Lifesaving Records</h4>
                          <div className="space-y-2 text-sm text-text">
                            <div className="flex justify-between border-b border-white/5 pb-1">
                              <span className="text-text-muted">Full Name:</span>
                              <span className="font-semibold text-white">{emergencyData.fullName}</span>
                            </div>
                            <div className="flex justify-between border-b border-white/5 pb-1">
                              <span className="text-text-muted">Blood Group:</span>
                              <span className="font-bold text-danger-400 text-base">{emergencyData.bloodGroup}</span>
                            </div>
                            <div className="flex justify-between border-b border-white/5 pb-1">
                              <span className="text-text-muted">Emergency Contact Name:</span>
                              <span className="font-semibold text-white">{emergencyData.emergencyContactName}</span>
                            </div>
                            <div className="flex justify-between border-b border-white/5 pb-1">
                              <span className="text-text-muted">Relationship:</span>
                              <span className="font-medium text-white">{emergencyData.emergencyContactRelationship || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-text-muted">Contact Number:</span>
                              <span className="font-bold text-white text-base">{emergencyData.emergencyContactNumber}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            } />

            <Route path="/grants" element={
              <div className="space-y-8 animate-in">
                <div className="glass-card rounded-2xl p-8">
                  <h2 className="text-2xl font-semibold text-white mb-6">Active Access Grants</h2>

                  {/* Direct Action Search Box */}
                  {user?.role === 'IntelligenceDepartment' && (
                    <div className="glass-card rounded-2xl p-6 mb-8 border border-white/10 max-w-2xl mx-auto text-left">
                      <h4 className="font-semibold text-white text-base mb-2">
                        ⚖️ Direct Criminal Record & Citation Hub
                      </h4>
                      <p className="text-xs text-text-muted mb-4">
                        Enter the Citizen ID to issue fines or manage criminal record entries directly without a consent request.
                      </p>
                      <form
                        onSubmit={async (e) => {
                          e.preventDefault();
                          const inputVal = (document.getElementById('direct-op-citizen-id') as HTMLInputElement)?.value?.trim();
                          if (!inputVal) return;

                          try {
                            const checkProfile = await api.get(`/verifier/citizen-lookup/${inputVal}`);
                            const fullName = checkProfile.data.fullName;
                            handleOpenCriminalRecords(inputVal, fullName);
                          } catch (err: any) {
                            alert(err.response?.data?.message || 'Citizen not found');
                          }
                        }}
                        className="flex gap-3"
                      >
                        <input
                          type="text"
                          id="direct-op-citizen-id"
                          placeholder="e.g. SCTN-987654"
                          className="flex-1 bg-surface-hover/30 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                        />
                        <button
                          type="submit"
                          className="bg-primary-600 hover:bg-primary-500 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-all cursor-pointer whitespace-nowrap"
                        >
                          Open Crime Logs
                        </button>
                      </form>
                    </div>
                  )}

                  {loadingConsents ? (
                    <div className="text-center py-8">
                      <div className="w-8 h-8 border-3 border-primary-500/30 border-t-primary-500 rounded-full animate-spin mx-auto" />
                    </div>
                  ) : consents.length === 0 ? (
                    (user?.role !== 'IntelligenceDepartment') ? (
                      <div className="text-center py-12 text-text-muted border border-dashed border-white/15 rounded-xl">
                        <FileText size={48} className="mx-auto mb-4 opacity-40" />
                        <p className="font-medium">No active access grants yet</p>
                        <p className="text-sm mt-1">Use the Search Citizen tab to send a consent request first.</p>
                      </div>
                    ) : null
                  ) : (
                    <div className="overflow-x-auto border border-white/10 rounded-2xl">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-white/2 border-b border-white/10 text-text-muted text-xs uppercase tracking-wider">
                            <th className="px-6 py-4 font-semibold">Citizen ID</th>
                            <th className="px-6 py-4 font-semibold">Citizen Details</th>
                            <th className="px-6 py-4 font-semibold">Requested Fields</th>
                            <th className="px-6 py-4 font-semibold">Ending Time & Date</th>
                            <th className="px-6 py-4 font-semibold">Status</th>
                            <th className="px-6 py-4 font-semibold text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {consents.map((req) => (
                            <tr key={req.id} className="hover:bg-white/2 transition-colors duration-200">
                              <td className="px-6 py-4 text-accent font-mono text-sm font-semibold">{req.target.citizenProfile?.citizenId || 'Pending'}</td>
                              <td className="px-6 py-4">
                                <p className="text-white font-semibold text-sm">{req.target.citizenProfile?.fullName || 'N/A'}</p>
                                <p className="text-xs text-text-muted mt-0.5">{req.target.email}</p>
                              </td>
                              <td className="px-6 py-4 text-text-muted text-sm">{parseRequestedData(req.requestedData)}</td>
                              <td className="px-6 py-4 text-text-muted text-sm font-mono">
                                {req.expiryTime ? new Date(req.expiryTime).toLocaleString() : 'N/A'}
                              </td>
                              <td className="px-6 py-4">
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                                  req.status === 'Pending' ? 'bg-warning/10 text-warning border border-warning/20' :
                                  req.status === 'Approved' ? 'bg-success/10 text-success border border-success/20' :
                                  'bg-danger/10 text-danger border border-danger/20'
                                }`}>
                                  ● {req.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-right">
                                <div className="flex justify-end gap-2">
                                  {req.status === 'Approved' && (
                                    <button
                                      onClick={() => {
                                        setSelectedConsent(req);
                                        setSelectedCitizenForLogs(null);
                                        setRules([{ field: 'age', operator: '>=', value: '18' }]);
                                        setEvaluationResults(null);
                                        setEvalError(null);
                                      }}
                                      className="px-3.5 py-1.5 bg-primary-600/20 hover:bg-primary-500 text-primary-400 hover:text-white border border-primary-500/30 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer active:scale-95 shadow-sm"
                                    >
                                      Evaluate Rules
                                    </button>
                                  )}
                                  {req.status === 'Approved' && user?.role === 'Doctor' && (
                                    <button
                                      onClick={() => {
                                        handleOpenVisitLogs(req.target.citizenProfile.citizenId, req.target.citizenProfile.fullName);
                                      }}
                                      className="px-3.5 py-1.5 bg-success/20 hover:bg-success text-success border border-success/30 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer active:scale-95 shadow-sm"
                                    >
                                      Medical Visit Logs
                                    </button>
                                  )}
                                  {req.status === 'Approved' && user?.role === 'IntelligenceDepartment' && (
                                    <button
                                      onClick={() => {
                                        handleOpenCriminalRecords(req.target.citizenProfile.citizenId, req.target.citizenProfile.fullName);
                                      }}
                                      className="px-3.5 py-1.5 bg-warning/20 hover:bg-warning text-warning border border-warning/30 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer active:scale-95 shadow-sm"
                                    >
                                      Criminal Record & Logs
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Rules Evaluation Panel */}
                {selectedConsent && (
                  <div className="glass-card rounded-2xl p-8 border border-white/10 relative animate-in">
                    <button
                      onClick={() => setSelectedConsent(null)}
                      className="absolute top-4 right-4 text-text-muted hover:text-white text-sm"
                    >
                      Close ×
                    </button>

                    <h3 className="text-xl font-bold text-white mb-2">
                      {t('zeroKnowledgeVerification', 'Zero-Knowledge Policy Verification')}
                    </h3>
                    <p className="text-sm text-text-muted mb-6">
                      {lang === 'en'
                        ? `Verify logic rules against the profile of ${selectedConsent.target.citizenProfile?.fullName} (${selectedConsent.target.citizenProfile?.citizenId}) dynamically. Raw values are not shared with you.`
                        : `${selectedConsent.target.citizenProfile?.fullName} (${selectedConsent.target.citizenProfile?.citizenId}) এর প্রোফাইলের বিপরীতে লজিক নিয়মগুলো ডায়নামিকভাবে যাচাই করুন। মূল মানগুলো আপনার সাথে শেয়ার করা হয় না।`}
                    </p>

                    {/* Presets Row */}
                    <div className="mb-6 bg-white/2 border border-white/5 p-4 rounded-xl space-y-2">
                      <label className="text-xs font-semibold text-text-muted uppercase tracking-wider block">
                        Quick Verification Presets
                      </label>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => applyPreset([{ field: 'age', operator: '>=', value: '18' }])}
                          className="px-3 py-1.5 bg-white/5 hover:bg-primary-600 border border-white/10 hover:border-primary-500 rounded-lg text-xs text-white transition-all cursor-pointer font-medium"
                        >
                          🔞 Adult Check (Age ≥ 18)
                        </button>

                        {(user?.role === 'Admin' || user?.role === 'JobInterviewer' || user?.role === 'UniversityAuthority') && (
                          <>
                            <button
                              type="button"
                              onClick={() => applyPreset([
                                { field: 'ssc_gpa', operator: '>=', value: '4.0' },
                                { field: 'cgpa', operator: '>=', value: '3.0' }
                              ])}
                              className="px-3 py-1.5 bg-white/5 hover:bg-primary-600 border border-white/10 hover:border-primary-500 rounded-lg text-xs text-white transition-all cursor-pointer font-medium"
                            >
                              🎓 Graduate Clearance (SSC ≥ 4.0, CGPA ≥ 3.0)
                            </button>
                            <button
                              type="button"
                              onClick={() => applyPreset([
                                { field: 'age', operator: '>=', value: '18' },
                                { field: 'has_criminal_record', operator: '==', value: 'false' }
                              ])}
                              className="px-3 py-1.5 bg-white/5 hover:bg-primary-600 border border-white/10 hover:border-primary-500 rounded-lg text-xs text-white transition-all cursor-pointer font-medium"
                            >
                              💼 Clean Background Check
                            </button>
                          </>
                        )}

                        {(user?.role === 'Admin' || user?.role === 'BankLoanOfficer') && (
                          <>
                            <button
                              type="button"
                              onClick={() => applyPreset([
                                { field: 'income', operator: '>=', value: '80000' },
                                { field: 'tax_clearance', operator: '==', value: 'true' }
                              ])}
                              className="px-3 py-1.5 bg-white/5 hover:bg-primary-600 border border-white/10 hover:border-primary-500 rounded-lg text-xs text-white transition-all cursor-pointer font-medium"
                            >
                              💰 Premier Loan Pass (Income ≥ 80k, Tax OK)
                            </button>
                            <button
                              type="button"
                              onClick={() => applyPreset([
                                { field: 'income', operator: '>=', value: '30000' },
                                { field: 'tax_clearance', operator: '==', value: 'true' }
                              ])}
                              className="px-3 py-1.5 bg-white/5 hover:bg-primary-600 border border-white/10 hover:border-primary-500 rounded-lg text-xs text-white transition-all cursor-pointer font-medium"
                            >
                              💵 Standard Loan Pass (Income ≥ 30k, Tax OK)
                            </button>
                          </>
                        )}

                        {(user?.role === 'Admin' || user?.role === 'IntelligenceDepartment') && (
                          <button
                            type="button"
                            onClick={() => applyPreset([{ field: 'has_criminal_record', operator: '==', value: 'false' }])}
                            className="px-3 py-1.5 bg-white/5 hover:bg-primary-600 border border-white/10 hover:border-primary-500 rounded-lg text-xs text-white transition-all cursor-pointer font-medium"
                          >
                            🛡️ Safe Record Check (No Crime Record)
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="space-y-4">
                      {rules.map((rule, idx) => (
                        <div key={idx} className="flex flex-col md:flex-row items-start gap-4 bg-surface/30 p-4 border border-white/5 rounded-xl">
                          <div className="flex-1 w-full space-y-1">
                            <label className="text-xs font-medium text-text-muted">{lang === 'en' ? 'Field to Check' : 'যাচাই করার ক্ষেত্র'}</label>
                            <select
                              value={rule.field}
                              onChange={(e) => {
                                handleRuleChange(idx, 'field', e.target.value);
                                handleRuleChange(idx, 'value', ''); // clear previous value
                              }}
                              className="w-full bg-surface-hover/50 border border-white/10 rounded-xl py-2 px-3 text-text focus:outline-none focus:ring-1 focus:ring-primary-500 text-sm"
                            >
                              <option value="age">{lang === 'en' ? 'Age' : 'বয়স'}</option>
                              {(user?.role === 'Admin' || user?.role === 'BankLoanOfficer') && (
                                <>
                                  <option value="income">{lang === 'en' ? 'Monthly Income' : 'মাসিক আয়'}</option>
                                  <option value="net_take_home_pay">{lang === 'en' ? 'Net Take-Home Pay' : 'নেট টেক-হোম পে'}</option>
                                  <option value="total_tax_paid">{lang === 'en' ? 'Total Tax Paid' : 'মোট পরিশোধিত কর'}</option>
                                  <option value="employment_status">{lang === 'en' ? 'Employment Status' : 'কর্মসংস্থানের অবস্থা'}</option>
                                  <option value="tin">{lang === 'en' ? 'e-TIN Number' : 'ই-টিন নম্বর'}</option>
                                  <option value="primary_income_source">{lang === 'en' ? 'Primary Income Source' : 'আয়ের প্রধান উৎস'}</option>
                                  <option value="tax_clearance">{lang === 'en' ? 'Tax Clearance (true/false)' : 'কর পরিশোধের অবস্থা (সত্য/মিথ্যা)'}</option>
                                </>
                              )}
                              {(user?.role === 'Admin' || user?.role === 'JobInterviewer' || user?.role === 'UniversityAuthority') && (
                                <>
                                  <option value="ssc_gpa">{lang === 'en' ? 'SSC GPA' : 'এসএসসি জিপিএ'}</option>
                                  <option value="cgpa">{lang === 'en' ? 'CGPA (University)' : 'সিজিপিএ (বিশ্ববিদ্যালয়)'}</option>
                                </>
                              )}
                              {(user?.role === 'Admin' || user?.role === 'JobInterviewer' || user?.role === 'IntelligenceDepartment') && (
                                <option value="has_criminal_record">{lang === 'en' ? 'Criminal Record (true/false)' : 'অপরাধের রেকর্ড (সত্য/মিথ্যা)'}</option>
                              )}
                              {(user?.role === 'Admin' || user?.role === 'Doctor') && (
                                <>
                                  <option value="blood_type">{lang === 'en' ? 'Blood Type' : 'রক্তের গ্রুপ'}</option>
                                  <option value="allergies">{lang === 'en' ? 'Allergies' : 'অ্যালার্জি'}</option>
                                  <option value="chronic_conditions">{lang === 'en' ? 'Chronic Conditions' : 'দীর্ঘস্থায়ী স্বাস্থ্য সমস্যাসমূহ'}</option>
                                  <option value="medical_history">{lang === 'en' ? 'Medical History' : 'চিকিৎসাগত ইতিহাস'}</option>
                                  <option value="immunization_status">{lang === 'en' ? 'Immunization Status' : 'টিকা দেওয়ার অবস্থা'}</option>
                                  <option value="insurance_provider">{lang === 'en' ? 'Insurance Provider' : 'বীমা প্রদানকারী'}</option>
                                  <option value="insurance_policy_number">{lang === 'en' ? 'Insurance Policy Number' : 'বীমা পলিসি নম্বর'}</option>
                                </>
                              )}
                            </select>
                          </div>

                          <div className="flex-1 w-full space-y-1">
                            <label className="text-xs font-medium text-text-muted">{lang === 'en' ? 'Operator' : 'অপারেটর'}</label>
                            <select
                              value={rule.operator}
                              onChange={(e) => handleRuleChange(idx, 'operator', e.target.value)}
                              className="w-full bg-surface-hover/50 border border-white/10 rounded-xl py-2 px-3 text-text focus:outline-none focus:ring-1 focus:ring-primary-500 text-sm"
                            >
                              <option value=">=">&gt;= {lang === 'en' ? '(Greater or Equal)' : '(অধিক অথবা সমান)'}</option>
                              <option value="<=">&lt;= {lang === 'en' ? '(Less or Equal)' : '(কম অথবা সমান)'}</option>
                              <option value="==">== {lang === 'en' ? '(Exactly Equal)' : '(হুবহু সমান)'}</option>
                            </select>
                          </div>

                          <div className="flex-1 w-full space-y-1">
                            <label className="text-xs font-medium text-text-muted">{lang === 'en' ? 'Threshold Value' : 'সীমা মান'}</label>
                            {rule.field === 'tax_clearance' || rule.field === 'has_criminal_record' ? (
                              <select
                                value={rule.value}
                                onChange={(e) => handleRuleChange(idx, 'value', e.target.value)}
                                className="w-full bg-surface-hover/50 border border-white/10 rounded-xl py-2 px-3 text-text focus:outline-none focus:ring-1 focus:ring-primary-500 text-sm"
                              >
                                <option value="">{lang === 'en' ? 'Select Option' : 'বিকল্প নির্বাচন করুন'}</option>
                                {rule.field === 'tax_clearance' ? (
                                  <>
                                    <option value="true">{lang === 'en' ? 'Cleared (True)' : 'পরিশোধিত (সত্য)'}</option>
                                    <option value="false">{lang === 'en' ? 'Uncleared (False)' : 'অপরিশোধিত (মিথ্যা)'}</option>
                                  </>
                                ) : (
                                  <>
                                    <option value="true">{lang === 'en' ? 'Has Record (True)' : 'রেকর্ড আছে (সত্য)'}</option>
                                    <option value="false">{lang === 'en' ? 'No Record (False)' : 'রেকর্ড নেই (মিথ্যা)'}</option>
                                  </>
                                )}
                              </select>
                            ) : (
                              <>
                                <input
                                  type="text"
                                  value={rule.value}
                                  onChange={(e) => handleRuleChange(idx, 'value', e.target.value)}
                                  placeholder={lang === 'en' ? 'Enter value' : 'মান লিখুন'}
                                  list={`suggestions-${idx}-${rule.field}`}
                                  className="w-full bg-surface-hover/50 border border-white/10 rounded-xl py-2 px-3 text-text focus:outline-none focus:ring-1 focus:ring-primary-500 text-sm"
                                />
                                <datalist id={`suggestions-${idx}-${rule.field}`}>
                                  {(fieldSuggestions[rule.field] || []).map((sugg) => (
                                    <option key={sugg} value={sugg} />
                                  ))}
                                </datalist>
                                {(fieldSuggestions[rule.field] || []).length > 0 && (
                                  <div className="mt-1.5 flex flex-wrap gap-1.5 items-center">
                                    <span className="text-[10px] text-text-muted font-medium mr-0.5">
                                      {lang === 'en' ? 'Suggestions:' : 'পরামর্শ:'}
                                    </span>
                                    {(fieldSuggestions[rule.field] || []).map((sugg) => (
                                      <button
                                        key={sugg}
                                        type="button"
                                        onClick={() => handleRuleChange(idx, 'value', sugg)}
                                        className="px-2 py-0.5 text-[11px] font-medium bg-white/5 hover:bg-primary-600/35 border border-white/10 hover:border-primary-500/50 rounded-md text-text-muted hover:text-white transition-all cursor-pointer select-none active:scale-95"
                                      >
                                        {sugg}
                                      </button>
                                    ))}
                                  </div>
                                )}
                              </>
                            )}
                          </div>

                          {rules.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeRule(idx)}
                              className="w-full md:w-auto mt-2 md:mt-6 p-2 bg-danger/15 text-danger hover:bg-danger/25 rounded-lg text-sm shrink-0 cursor-pointer transition-all hover:scale-[1.01] active:scale-95"
                            >
                              {lang === 'en' ? 'Remove' : 'মুছে ফেলুন'}
                            </button>
                          )}
                        </div>
                      ))}

                      <div className="flex justify-between items-center pt-2">
                        <button
                          type="button"
                          onClick={addRule}
                          className="text-primary-400 hover:text-primary-300 text-sm font-medium"
                        >
                          + {lang === 'en' ? 'Add Another Rule' : 'আরেকটি নিয়ম যোগ করুন'}
                        </button>

                        <button
                          type="button"
                          onClick={() => evaluatePolicy(selectedConsent.target.citizenProfile.citizenId)}
                          disabled={evaluating || rules.some(r =>
                            r.value === '' ||
                            (r.field !== 'tax_clearance' && r.field !== 'has_criminal_record' && !['blood_type', 'allergies', 'chronic_conditions', 'medical_history', 'immunization_status', 'insurance_provider', 'insurance_policy_number', 'employment_status', 'tin', 'primary_income_source'].includes(r.field) && isNaN(parseFloat(r.value)))
                          )}
                          className="px-6 py-2.5 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white font-medium rounded-xl transition-all duration-200 disabled:opacity-50 hover:scale-[1.02]"
                        >
                          {evaluating
                            ? (lang === 'en' ? 'Verifying Zero Knowledge Proof...' : 'জিরো নলেজ প্রুফ যাচাই করা হচ্ছে...')
                            : t('runVerification', 'Verify Cryptographic Rules')}
                        </button>
                      </div>

                      {evalError && (
                        <div className="bg-danger/10 border border-danger/20 text-danger p-3 rounded-xl text-sm">
                          {evalError}
                        </div>
                      )}

                       {evaluationResults && (
                        <div className="bg-surface/50 border border-white/5 rounded-2xl p-6 mt-6 space-y-6 animate-in">
                          <div className="flex items-center gap-3 pb-4 border-b border-white/10">
                            <div className="w-10 h-10 rounded-full bg-primary-500/10 flex items-center justify-center text-primary-400 font-bold font-display">
                              {selectedConsent.target.citizenProfile?.fullName?.charAt(0) || 'C'}
                            </div>
                            <div>
                              <h4 className="font-semibold text-white">
                                {selectedConsent.target.citizenProfile?.fullName || 'Citizen'}
                              </h4>
                              <p className="text-xs text-text-muted">
                                ID: {selectedConsent.target.citizenProfile?.citizenId} | {selectedConsent.target.email}
                              </p>
                            </div>
                          </div>

                          {/* Zero-Knowledge Conclusion Card */}
                          {evaluationResults.every((res: any) => res.result === 'PASSED') ? (
                            <div className="bg-success/15 border border-success/20 p-6 rounded-xl text-center space-y-2">
                              <span className="inline-flex p-3 rounded-full bg-success/20 text-success animate-bounce">
                                <CheckCircle size={32} />
                              </span>
                              <h3 className="text-2xl font-bold text-success">{t('verified', 'Verified')}</h3>
                              <p className="text-xs text-success/80">
                                {lang === 'en'
                                  ? 'Cryptographic ZK Proof verified. All policy criteria have been successfully met.'
                                  : 'ক্রিপ্টোগ্রাফিক জেকে প্রুফ যাচাই করা হয়েছে। সব পলিসির মানদণ্ড সফলভাবে পূরণ করা হয়েছে।'}
                              </p>
                            </div>
                          ) : (
                            <div className="bg-danger/15 border border-danger/20 p-6 rounded-xl text-center space-y-2">
                              <span className="inline-flex p-3 rounded-full bg-danger/20 text-danger">
                                <ShieldAlert size={32} />
                              </span>
                              <h3 className="text-2xl font-bold text-danger">{lang === 'en' ? 'Not eligible' : 'যোগ্য নয়'}</h3>
                              <p className="text-xs text-danger/80">
                                {lang === 'en'
                                  ? 'Cryptographic check completed. The citizen does not meet one or more policy criteria.'
                                  : 'ক্রিপ্টোগ্রাফিক পরীক্ষা সম্পন্ন হয়েছে। নাগরিক এক বা একাধিক পলিসির মানদণ্ড পূরণ করেননি।'}
                              </p>
                            </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

                  {/* Medical Visit Logs Panel */}
                  {selectedCitizenForLogs && (
                    <div className="glass-card rounded-2xl p-8 border border-white/10 relative animate-in mt-6">
                      <button
                        onClick={() => setSelectedCitizenForLogs(null)}
                        className="absolute top-4 right-4 text-text-muted hover:text-white text-sm"
                      >
                        Close ×
                      </button>

                      <div className="flex items-center gap-3 mb-6">
                        <span className="text-2xl">🏥</span>
                        <h3 className="text-xl font-bold text-white">
                          {lang === 'en' ? `Medical Visit Logs for ${selectedCitizenForLogs.fullName}` : `${selectedCitizenForLogs.fullName} এর চিকিৎসা পরিদর্শনের লগসমূহ`}
                        </h3>
                      </div>

                       {/* Log Form */}
                      <form onSubmit={handleAddVisitLog} className="glass-card p-6 border border-white/5 rounded-2xl space-y-4 bg-surface/10 mb-8 text-left">
                        <h5 className="text-sm font-semibold text-white">{lang === 'en' ? 'Log New Visit' : 'নতুন পরিদর্শন লগ করুন'}</h5>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-1">
                            <label className="text-xs font-semibold text-text-muted uppercase tracking-wider ml-1">{lang === 'en' ? 'Doctor Name' : 'ডাক্তারের নাম'}</label>
                            <input
                              type="text"
                              value={logDoctor}
                              onChange={(e) => setLogDoctor(e.target.value)}
                              placeholder="e.g. Dr. John Doe"
                              className="w-full bg-slate-900 border border-white/10 rounded-xl py-2.5 px-4 text-text focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all text-sm text-white"
                              required
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs font-semibold text-text-muted uppercase tracking-wider ml-1">{lang === 'en' ? 'Hospital Name' : 'হাসপাতালের নাম'}</label>
                            <input
                              type="text"
                              value={logHospital}
                              onChange={(e) => setLogHospital(e.target.value)}
                              placeholder="e.g. Square Hospital"
                              className="w-full bg-slate-900 border border-white/10 rounded-xl py-2.5 px-4 text-text focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all text-sm text-white"
                              required
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs font-semibold text-text-muted uppercase tracking-wider ml-1">{lang === 'en' ? 'Visit Date' : 'পরিদর্শনের তারিখ'}</label>
                            <input
                              type="date"
                              value={logDate}
                              onChange={(e) => setLogDate(e.target.value)}
                              className="w-full bg-slate-900 border border-white/10 rounded-xl py-2.5 px-4 text-text focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all text-sm text-white"
                              required
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-text-muted uppercase tracking-wider ml-1">{lang === 'en' ? 'Reason for Visit' : 'পরিদর্শনের কারণ'}</label>
                          <input
                            type="text"
                            value={logReason}
                            onChange={(e) => setLogReason(e.target.value)}
                            placeholder="e.g. Asthma checkup, regular consult"
                            className="w-full bg-slate-900 border border-white/10 rounded-xl py-2.5 px-4 text-text focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all text-sm text-white"
                          />
                        </div>

                        <div className="flex flex-col sm:flex-row items-end sm:items-center justify-between gap-4 pt-2">
                          <div className="flex flex-col sm:flex-row gap-4 w-full sm:max-w-xl text-left">
                            <div className="space-y-1 w-full sm:w-1/2">
                              <label className="text-xs font-semibold text-text-muted uppercase tracking-wider ml-1">{lang === 'en' ? 'Upload Prescription Picture' : 'প্রেসক্রিপশন ছবি আপলোড করুন'}</label>
                              <input
                                id="visit-prescription-input"
                                type="file"
                                accept="image/*"
                                onChange={(e) => setLogPrescriptionFile(e.target.files?.[0] || null)}
                                className="w-full text-xs text-text-muted file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-primary-600/20 file:text-primary-400 hover:file:bg-primary-600/30 file:cursor-pointer cursor-pointer"
                              />
                            </div>
                            <div className="space-y-1 w-full sm:w-1/2">
                              <label className="text-xs font-semibold text-text-muted uppercase tracking-wider ml-1">{lang === 'en' ? 'Upload Prescription PDF' : 'প্রেসক্রিপশন PDF আপলোড করুন'}</label>
                              <input
                                id="visit-pdf-input"
                                type="file"
                                accept="application/pdf"
                                onChange={(e) => setLogPrescriptionPdfFile(e.target.files?.[0] || null)}
                                className="w-full text-xs text-text-muted file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-primary-600/20 file:text-primary-400 hover:file:bg-primary-600/30 file:cursor-pointer cursor-pointer"
                              />
                            </div>
                          </div>
                          <button
                            type="submit"
                            disabled={submittingLog}
                            className="px-6 py-2.5 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white font-medium rounded-xl transition-all hover:scale-[1.01] disabled:opacity-50 cursor-pointer text-sm shrink-0"
                          >
                            {submittingLog ? (lang === 'en' ? 'Logging...' : 'যোগ হচ্ছে...') : (lang === 'en' ? 'Add Visit Log' : 'পরিদর্শন লগ যোগ করুন')}
                          </button>
                        </div>
                      </form>

                      {/* Timeline View of Visit Logs */}
                      <div className="space-y-4 text-left">
                        <h4 className="text-md font-semibold text-white mb-2">{lang === 'en' ? 'Existing Visit Logs' : 'বিদ্যমান পরিদর্শনের লগসমূহ'}</h4>
                        {loadingLogs ? (
                          <div className="text-center py-8">
                            <div className="w-8 h-8 border-3 border-primary-500/30 border-t-primary-500 rounded-full animate-spin mx-auto" />
                          </div>
                        ) : visitLogs.length === 0 ? (
                          <div className="text-center py-8 text-text-muted bg-surface/20 border border-white/5 rounded-2xl">
                            <p className="text-sm">{lang === 'en' ? 'No hospital visit logs found.' : 'কোনো হাসপাতাল পরিদর্শনের লগ পাওয়া যায়নি।'}</p>
                          </div>
                        ) : (
                          <div className="relative border-l-2 border-white/10 pl-6 ml-3 space-y-6">
                            {visitLogs.map((log: any) => (
                              <div key={log.id} className="relative group">
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
                                      <span className="font-semibold text-text-muted">{lang === 'en' ? 'Doctor Name' : 'ডাক্তারের নাম'}:</span> {log.doctorName}
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
                                          className="text-xs text-primary-400 hover:text-primary-300 font-medium inline-flex items-center gap-1 hover:underline cursor-pointer bg-transparent border-0 p-0 text-left"
                                        >
                                          👁️ {lang === 'en' ? 'View Prescription' : 'প্রেসক্রিপশন দেখুন'}
                                        </button>
                                      )}
                                      {log.prescriptionPdf && (
                                        <a
                                          href={`${API_ORIGIN}${log.prescriptionPdf}`}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-xs text-primary-400 hover:text-primary-300 font-medium inline-flex items-center gap-1 hover:underline cursor-pointer bg-transparent border-0 p-0 text-left"
                                        >
                                          📄 {lang === 'en' ? 'Download/View PDF' : 'PDF ডাউনলোড/দেখুন'}
                                        </a>
                                      )}
                                    </div>
                                  </div>
                                  {user?.role !== 'Doctor' && (
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteVisitLog(log.id)}
                                      className="px-3 py-1.5 bg-danger/10 text-danger hover:bg-danger/20 border border-danger/20 rounded-lg text-xs font-medium transition-all self-end sm:self-center cursor-pointer"
                                    >
                                      🗑️ {lang === 'en' ? 'Delete Log' : 'মুছে ফেলুন'}
                                    </button>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Criminal Record & Logs Panel */}
                  {selectedCitizenForCrime && (
                    <div className="glass-card rounded-2xl p-8 border border-white/10 relative animate-in mt-6">
                      <button
                        onClick={() => setSelectedCitizenForCrime(null)}
                        className="absolute top-4 right-4 text-text-muted hover:text-white text-sm cursor-pointer"
                      >
                        Close ×
                      </button>

                      <div className="flex items-center gap-3 mb-6">
                        <span className="text-2xl">⚖️</span>
                        <h3 className="text-xl font-bold text-white">
                          {lang === 'en' ? `Criminal Records & Logs for ${selectedCitizenForCrime.fullName}` : `${selectedCitizenForCrime.fullName} এর অপরাধের রেকর্ড ও লগসমূহ`}
                        </h3>
                      </div>

                      {/* Forms */}
                      {user?.role === 'Admin' && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                          {/* Record Fine Form */}
                          <form onSubmit={handleAddIntelFine} className="glass-card p-6 border border-white/5 rounded-2xl space-y-4 bg-surface/10 text-left">
                            <h5 className="text-sm font-semibold text-white">{lang === 'en' ? 'Record New Fine' : 'নতুন জরিমানা রেকর্ড করুন'}</h5>
                            <div className="space-y-3">
                              <div className="space-y-1">
                                <label className="text-xs font-semibold text-text-muted uppercase tracking-wider ml-1">{lang === 'en' ? 'Fine Reason' : 'জরিমানার কারণ'} *</label>
                                <input
                                  type="text"
                                  value={intelFineReason}
                                  onChange={(e) => setIntelFineReason(e.target.value)}
                                  placeholder={lang === 'en' ? 'e.g. Speeding ticket' : 'উদাহরণ: ওভারস্পিড টিকিট'}
                                  className="w-full bg-slate-900 border border-white/10 rounded-xl py-2.5 px-4 text-text focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all text-sm text-white"
                                  required
                                />
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                  <label className="text-xs font-semibold text-text-muted uppercase tracking-wider ml-1">{lang === 'en' ? 'Fine Amount' : 'জরিমানার পরিমাণ'}</label>
                                  <input
                                    type="number"
                                    step="0.01"
                                    value={intelFineAmount}
                                    onChange={(e) => setIntelFineAmount(e.target.value)}
                                    placeholder="e.g. 1500"
                                    className="w-full bg-slate-900 border border-white/10 rounded-xl py-2.5 px-4 text-text focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all text-sm text-white"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-xs font-semibold text-text-muted uppercase tracking-wider ml-1">{lang === 'en' ? 'Fine Date' : 'জরিমানার তারিখ'}</label>
                                  <input
                                    type="date"
                                    value={intelFineDate}
                                    onChange={(e) => setIntelFineDate(e.target.value)}
                                    className="w-full bg-slate-900 border border-white/10 rounded-xl py-2.5 px-4 text-text focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all text-sm text-white"
                                  />
                                </div>
                              </div>
                            </div>
                            <button
                              type="submit"
                              disabled={submittingIntelFine}
                              className="w-full px-6 py-2.5 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white font-medium rounded-xl transition-all hover:scale-[1.01] disabled:opacity-50 cursor-pointer text-sm"
                            >
                              {submittingIntelFine ? (lang === 'en' ? 'Recording...' : 'রেকর্ড হচ্ছে...') : (lang === 'en' ? 'Record Fine' : 'জরিমানা রেকর্ড করুন')}
                            </button>
                          </form>

                          {/* Record Crime Log Form */}
                          <form onSubmit={handleAddIntelCrimeLog} className="glass-card p-6 border border-white/5 rounded-2xl space-y-4 bg-surface/10 text-left">
                            <h5 className="text-sm font-semibold text-white">{lang === 'en' ? 'Record New Crime Log' : 'নতুন অপরাধের লগ রেকর্ড করুন'}</h5>
                            <div className="space-y-3">
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                  <label className="text-xs font-semibold text-text-muted uppercase tracking-wider ml-1">{lang === 'en' ? 'Offense' : 'অপরাধ'} *</label>
                                  <input
                                    type="text"
                                    value={intelOffense}
                                    onChange={(e) => setIntelOffense(e.target.value)}
                                    placeholder="e.g. Theft"
                                    className="w-full bg-slate-900 border border-white/10 rounded-xl py-2.5 px-4 text-text focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all text-sm text-white"
                                    required
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-xs font-semibold text-text-muted uppercase tracking-wider ml-1">{lang === 'en' ? 'Case Number' : 'মামলা নম্বর'} *</label>
                                  <input
                                    type="text"
                                    value={intelCaseNumber}
                                    onChange={(e) => setIntelCaseNumber(e.target.value)}
                                    placeholder="e.g. CN-2026-003"
                                    className="w-full bg-slate-900 border border-white/10 rounded-xl py-2.5 px-4 text-text focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all text-sm text-white"
                                    required
                                  />
                                </div>
                              </div>
                              <div className="grid grid-cols-3 gap-2">
                                <div className="space-y-1">
                                  <label className="text-xs font-semibold text-text-muted uppercase tracking-wider ml-1">{lang === 'en' ? 'Severity' : 'তীব্রতা'}</label>
                                  <select
                                    value={intelSeverity}
                                    onChange={(e) => setIntelSeverity(e.target.value)}
                                    className="w-full bg-slate-900 border border-white/10 rounded-xl py-2.5 px-3 text-text focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all text-xs text-white cursor-pointer"
                                  >
                                    <option value="Felony">Felony</option>
                                    <option value="Misdemeanor">Misdemeanor</option>
                                    <option value="Infraction">Infraction</option>
                                  </select>
                                </div>
                                <div className="space-y-1">
                                  <label className="text-xs font-semibold text-text-muted uppercase tracking-wider ml-1">{lang === 'en' ? 'Status' : 'অবস্থা'}</label>
                                  <select
                                    value={intelStatus}
                                    onChange={(e) => setIntelStatus(e.target.value)}
                                    className="w-full bg-slate-900 border border-white/10 rounded-xl py-2.5 px-3 text-text focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all text-xs text-white cursor-pointer"
                                  >
                                    <option value="Convicted">Convicted</option>
                                    <option value="Pending Trial">Pending Trial</option>
                                    <option value="Acquitted">Acquitted</option>
                                    <option value="Dismissed">Dismissed</option>
                                  </select>
                                </div>
                                <div className="space-y-1">
                                  <label className="text-xs font-semibold text-text-muted uppercase tracking-wider ml-1">{lang === 'en' ? 'Crime Date' : 'অপরাধের তারিখ'}</label>
                                  <input
                                    type="date"
                                    value={intelCrimeDate}
                                    onChange={(e) => setIntelCrimeDate(e.target.value)}
                                    className="w-full bg-slate-900 border border-white/10 rounded-xl py-2.5 px-3 text-text focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all text-xs text-white"
                                  />
                                </div>
                              </div>
                              <div className="space-y-1">
                                <label className="text-xs font-semibold text-text-muted uppercase tracking-wider ml-1">{lang === 'en' ? 'Details' : 'বিবরণ'}</label>
                                <input
                                  type="text"
                                  value={intelCrimeDetails}
                                  onChange={(e) => setIntelCrimeDetails(e.target.value)}
                                  placeholder="Details of charges/sentence..."
                                  className="w-full bg-slate-900 border border-white/10 rounded-xl py-2.5 px-4 text-text focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all text-sm text-white"
                                />
                              </div>
                            </div>
                            <button
                              type="submit"
                              disabled={submittingIntelCrime}
                              className="w-full px-6 py-2.5 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white font-medium rounded-xl transition-all hover:scale-[1.01] disabled:opacity-50 cursor-pointer text-sm"
                            >
                              {submittingIntelCrime ? (lang === 'en' ? 'Recording...' : 'রেকর্ড করছি...') : (lang === 'en' ? 'Record Crime Log' : 'অপরাধ লগ রেকর্ড করুন')}
                            </button>
                          </form>
                        </div>
                      )}

                      {/* Display Lists of Fines & Crime Logs */}
                      {loadingIntelCrime ? (
                        <div className="text-center py-8">
                          <div className="w-8 h-8 border-3 border-primary-500/30 border-t-primary-500 rounded-full animate-spin mx-auto" />
                        </div>
                      ) : (
                        <div className="space-y-8">
                          {/* Fines List */}
                          <div className="space-y-3 text-left">
                            <h4 className="text-md font-semibold text-white">{lang === 'en' ? 'Fine Logs' : 'জরিমানা লগসমূহ'}</h4>
                            {intelFines.length === 0 ? (
                              <p className="text-xs text-text-muted bg-surface/20 border border-white/5 rounded-xl p-4">{lang === 'en' ? 'No fine logs recorded for this citizen.' : 'এই নাগরিকের জন্য কোনো জরিমানা রেকর্ড করা হয়নি।'}</p>
                            ) : (
                              <div className="glass-card border border-white/5 rounded-2xl overflow-hidden">
                                <table className="w-full text-xs">
                                  <thead className="bg-white/5 border-b border-white/5 font-semibold text-text-muted">
                                    <tr>
                                      <th className="px-4 py-2.5 text-left">{lang === 'en' ? 'Reason' : 'কারণ'}</th>
                                      <th className="px-4 py-2.5 text-left">{lang === 'en' ? 'Date' : 'তারিখ'}</th>
                                      <th className="px-4 py-2.5 text-left">{lang === 'en' ? 'Amount' : 'পরিমাণ'}</th>
                                      <th className="px-4 py-2.5 text-left">{lang === 'en' ? 'Status' : 'অবস্থা'}</th>
                                      {user?.role === 'Admin' && <th className="px-4 py-2.5 text-right">{lang === 'en' ? 'Actions' : 'পদক্ষেপসমূহ'}</th>}
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-white/5">
                                    {intelFines.map((fine) => (
                                      <tr key={fine.id} className="hover:bg-white/2 transition-colors">
                                        <td className="px-4 py-3 text-white font-medium">{fine.fineReason}</td>
                                        <td className="px-4 py-3 text-text-muted">{new Date(fine.fineDate).toLocaleDateString()}</td>
                                        <td className="px-4 py-3 text-white">{fine.fineAmount ? fine.fineAmount.toLocaleString() : '-'}</td>
                                        <td className="px-4 py-3">
                                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-medium ${
                                            fine.isCleared ? 'bg-success/15 text-success border border-success/20' : 'bg-warning/15 text-warning border border-warning/20'
                                          }`}>
                                            {fine.isCleared ? 'Cleared' : 'Pending'}
                                          </span>
                                        </td>
                                        {user?.role === 'Admin' && (
                                          <td className="px-4 py-3 text-right space-x-2">
                                            <button
                                              type="button"
                                              onClick={() => handleUpdateIntelFineStatus(fine.id, fine.isCleared)}
                                              className="px-2 py-1 bg-primary-600/20 hover:bg-primary-500 text-primary-400 hover:text-white border border-primary-500/30 rounded text-[10px] font-medium transition-all cursor-pointer"
                                            >
                                              {fine.isCleared ? 'Mark Pending' : 'Mark Cleared'}
                                            </button>
                                            {user?.role === 'Admin' && (
                                              <button
                                                type="button"
                                                onClick={() => handleDeleteIntelFine(fine.id)}
                                                className="px-2 py-1 bg-danger/20 hover:bg-danger text-danger hover:text-white border border-danger/30 rounded text-[10px] font-medium transition-all cursor-pointer"
                                              >
                                                Delete
                                              </button>
                                            )}
                                          </td>
                                        )}
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            )}
                          </div>

                          {/* Crime Logs List */}
                          <div className="space-y-3 text-left">
                            <h4 className="text-md font-semibold text-white">{lang === 'en' ? 'Crime Logs' : 'অপরাধ লগসমূহ'}</h4>
                            {intelCrimeLogs.length === 0 ? (
                              <p className="text-xs text-text-muted bg-surface/20 border border-white/5 rounded-xl p-4">{lang === 'en' ? 'No crime logs recorded for this citizen.' : 'এই নাগরিকের জন্য কোনো অপরাধের লগ রেকর্ড করা হয়নি।'}</p>
                            ) : (
                              <div className="glass-card border border-white/5 rounded-2xl overflow-hidden">
                                <table className="w-full text-xs">
                                  <thead className="bg-white/5 border-b border-white/5 font-semibold text-text-muted">
                                    <tr>
                                      <th className="px-4 py-2.5 text-left">{lang === 'en' ? 'Offense' : 'অপরাধ'}</th>
                                      <th className="px-4 py-2.5 text-left">{lang === 'en' ? 'Case Number' : 'মামলা নম্বর'}</th>
                                      <th className="px-4 py-2.5 text-left">{lang === 'en' ? 'Severity' : 'তীব্রতা'}</th>
                                      <th className="px-4 py-2.5 text-left">{lang === 'en' ? 'Status' : 'অবস্থা'}</th>
                                      <th className="px-4 py-2.5 text-left">{lang === 'en' ? 'Date' : 'তারিখ'}</th>
                                      <th className="px-4 py-2.5 text-left">{lang === 'en' ? 'Details' : 'বিবরণ'}</th>
                                      {user?.role === 'Admin' && <th className="px-4 py-2.5 text-right">{lang === 'en' ? 'Actions' : 'পদক্ষেপসমূহ'}</th>}
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-white/5">
                                    {intelCrimeLogs.map((log) => (
                                      <tr key={log.id} className="hover:bg-white/2 transition-colors">
                                        <td className="px-4 py-3 text-white font-medium">{log.offense}</td>
                                        <td className="px-4 py-3 text-text-muted font-mono">{log.caseNumber}</td>
                                        <td className="px-4 py-3 text-white">{log.severity}</td>
                                        <td className="px-4 py-3">
                                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-medium ${
                                            log.status === 'Convicted' ? 'bg-danger/15 text-danger border border-danger/20' :
                                            log.status === 'Acquitted' || log.status === 'Dismissed' ? 'bg-success/15 text-success border border-success/20' :
                                            'bg-warning/15 text-warning border border-warning/20'
                                          }`}>
                                            {log.status}
                                          </span>
                                        </td>
                                        <td className="px-4 py-3 text-text-muted">{new Date(log.crimeDate).toLocaleDateString()}</td>
                                        <td className="px-4 py-3 text-text-muted">{log.details || '-'}</td>
                                        {user?.role === 'Admin' && (
                                          <td className="px-4 py-3 text-right">
                                            <button
                                              type="button"
                                              onClick={() => handleDeleteIntelCrimeLog(log.id)}
                                              className="px-2 py-1 bg-danger/20 hover:bg-danger text-danger hover:text-white border border-danger/30 rounded text-[10px] font-medium transition-all cursor-pointer"
                                            >
                                              Delete
                                            </button>
                                          </td>
                                        )}
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
            } />

            {/* Prescription Preview Modal */}
            {previewImage && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
                <div className="relative max-w-3xl w-full bg-slate-900 border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
                  <div className="p-4 border-b border-white/5 flex items-center justify-between bg-slate-950/40">
                    <h3 className="text-sm font-semibold text-white">{lang === 'en' ? 'Prescription' : 'প্রেসক্রিপশন'}</h3>
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


            <Route path="*" element={<Navigate to="/verifier" replace />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default VerifierDashboard;
