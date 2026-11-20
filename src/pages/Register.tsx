import ConnectionStatus from '../components/ConnectionStatus';
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import api from '../lib/axios';
import { User, Mail, Lock, Phone, Calendar, MapPin, Activity, Sun, Moon } from 'lucide-react';
import Logo from '../components/Logo';
import { useTranslation } from '../store/useSettingsStore';

const Register = () => {
  const { t, lang, setLang, theme, toggleTheme } = useTranslation();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: '',
    dob: '',
    gender: 'Male',
    address: '',
    emergencyContactName: '',
    emergencyContactNumber: '',
    bloodGroup: 'A+',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const [successData, setSuccessData] = useState<{ citizenId: string, user: any, token: string } | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/register', formData);
      setSuccessData({
        citizenId: response.data.user.citizenProfile.citizenId,
        user: response.data.user,
        token: response.data.token
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to register');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-background py-12">
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-primary-600/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-accent/20 blur-[150px] pointer-events-none" />

      <div className="glass-card w-full max-w-4xl p-8 rounded-3xl z-10 relative border border-white/10 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in duration-500">
        {/* Theme & Language Controls */}
        <div className="absolute top-6 right-6 flex items-center space-x-2 z-20">
          <button
            onClick={toggleTheme}
            type="button"
            className="p-2 bg-white/5 hover:bg-white/10 text-text-muted hover:text-text border border-white/10 rounded-xl transition-all cursor-pointer hover:scale-105 active:scale-95 flex items-center justify-center shrink-0"
          >
            {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
          </button>
          <button
            onClick={() => setLang(lang === 'en' ? 'bn' : 'en')}
            type="button"
            className="px-2.5 py-1.5 bg-white/5 hover:bg-white/10 text-text-muted hover:text-text border border-white/10 rounded-xl text-xs font-bold transition-all cursor-pointer hover:scale-105 active:scale-95 shrink-0"
          >
            {lang === 'en' ? 'বাং' : 'EN'}
          </button>
        </div>

        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Logo className="w-16 h-16" />
          </div>
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-accent mb-2">
            {t('citizenregistration', 'Citizen Registration')}
          </h1>
          <p className="text-text-muted text-sm">{t('joinsctn', 'Join the Smart Citizen Trust Network')}</p>
          <div className="mt-3"><ConnectionStatus /></div>
        </div>

        {successData ? (
          <div className="text-center space-y-6 max-w-md mx-auto py-8">
            <div className="w-20 h-20 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <Activity className="text-success w-10 h-10" />
            </div>
            <h2 className="text-2xl font-bold text-white">{t('registrationsuccessful', 'Registration Successful!')}</h2>
            <p className="text-text-muted">{t('accountcreateddesc', 'Your account has been created. Here is your unique Citizen ID. Please keep it safe as it is your primary identifier in the SCTN system.')}</p>

            <div className="bg-surface-hover/50 border border-primary-500/30 rounded-2xl p-6 shadow-[0_0_20px_rgba(59,130,246,0.15)]">
              <p className="text-sm text-primary-400 font-medium mb-2 uppercase tracking-widest">{t('yourcitizenid', 'Your Citizen ID')}</p>
              <div className="text-4xl font-mono font-bold text-white tracking-wider select-all">
                {successData.citizenId}
              </div>
            </div>

            <button
              onClick={() => {
                login(successData.user, successData.token);
                navigate('/');
              }}
              className="w-full mt-6 bg-gradient-to-r from-success to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white font-medium py-3 rounded-xl flex items-center justify-center space-x-2 transition-all duration-300 transform hover:scale-[1.02] shadow-lg"
            >
              {t('gotodashboard', 'Go to Dashboard')}
            </button>
          </div>
        ) : (
          <>
            {error && (
              <div className="bg-danger/10 border border-danger/20 text-danger p-3 rounded-xl mb-6 text-sm text-center">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-sm font-medium text-text-muted ml-1">{t('fullname', 'Full Name')}</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-muted"><User size={18} /></div>
                  <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} className="w-full bg-surface-hover/50 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-text placeholder-text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all" required />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-text-muted ml-1">{t('emailaddress', 'Email Address')}</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-muted"><Mail size={18} /></div>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full bg-surface-hover/50 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-text placeholder-text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all" required />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-text-muted ml-1">{t('password', 'Password')}</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-muted"><Lock size={18} /></div>
                  <input type="password" name="password" value={formData.password} onChange={handleChange} className="w-full bg-surface-hover/50 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-text placeholder-text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all" required />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-text-muted ml-1">{t('phonenumber', 'Phone Number')}</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-muted"><Phone size={18} /></div>
                  <input type="text" name="phone" value={formData.phone} onChange={handleChange} className="w-full bg-surface-hover/50 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-text placeholder-text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all" required />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-text-muted ml-1">{t('dob', 'Date of Birth')}</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-muted"><Calendar size={18} /></div>
                  <input type="date" name="dob" value={formData.dob} onChange={handleChange} className="w-full bg-surface-hover/50 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-text placeholder-text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all" required />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-text-muted ml-1">{t('gender', 'Gender')}</label>
                <select name="gender" value={formData.gender} onChange={handleChange} className="w-full bg-surface-hover/50 border border-white/10 rounded-xl py-3 px-4 text-text focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all cursor-pointer">
                  <option value="Male">{t('male', 'Male')}</option>
                  <option value="Female">{t('female', 'Female')}</option>
                  <option value="Other">{t('other', 'Other')}</option>
                </select>
              </div>

              <div className="space-y-1 md:col-span-2">
                <label className="text-sm font-medium text-text-muted ml-1">{t('address', 'Address')}</label>
                <div className="relative">
                  <div className="absolute top-3 left-0 pl-3 flex items-center pointer-events-none text-text-muted"><MapPin size={18} /></div>
                  <textarea name="address" value={formData.address} onChange={handleChange} rows={2} className="w-full bg-surface-hover/50 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-text placeholder-text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all" required />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-text-muted ml-1">{t('emergencycontactname', 'Emergency Contact Name')}</label>
                <input type="text" name="emergencyContactName" value={formData.emergencyContactName} onChange={handleChange} className="w-full bg-surface-hover/50 border border-white/10 rounded-xl py-3 px-4 text-text placeholder-text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all" required />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-text-muted ml-1">{t('emergencycontactnumber', 'Emergency Contact Number')}</label>
                <input type="text" name="emergencyContactNumber" value={formData.emergencyContactNumber} onChange={handleChange} className="w-full bg-surface-hover/50 border border-white/10 rounded-xl py-3 px-4 text-text placeholder-text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all" required />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-text-muted ml-1">{t('bloodgroup', 'Blood Group')}</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-muted"><Activity size={18} /></div>
                  <select name="bloodGroup" value={formData.bloodGroup} onChange={handleChange} className="w-full bg-surface-hover/50 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-text focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all cursor-pointer">
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="md:col-span-2 mt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white font-medium py-3 rounded-xl flex items-center justify-center space-x-2 transition-all duration-300 transform hover:scale-[1.01] shadow-lg shadow-primary-500/25 disabled:opacity-70"
                >
                  {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <span>{t('completeregistration', 'Complete Registration')}</span>}
                </button>
              </div>
            </form>
          </>
        )}

        <div className="mt-6 text-center text-sm text-text-muted">
          {t('alreadyregistered', 'Already registered?')}{' '}
          <Link to="/login" className="text-accent hover:text-accent/80 font-medium transition-colors">
            {t('backtologin', 'Back to Login')}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
