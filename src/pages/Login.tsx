import ConnectionStatus from '../components/ConnectionStatus';
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import api from '../lib/axios';
import { Lock, Mail, ArrowRight, ShieldCheck, Sun, Moon } from 'lucide-react';
import Logo from '../components/Logo';
import { useTranslation } from '../store/useSettingsStore';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const { t, lang, setLang, theme, toggleTheme } = useTranslation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/login', { email, password });
      login(response.data.user, response.data.token);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-background">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-primary-600/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-accent/20 blur-[150px] pointer-events-none" />

      <div className="glass-card w-full max-w-md p-8 rounded-3xl z-10 relative border border-white/10 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in duration-500">
        {/* Theme & Language Controls */}
        <div className="absolute top-6 right-6 flex items-center space-x-2">
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
            {t('welcomeback', 'Welcome Back')}
          </h1>
          <p className="text-text-muted text-sm">{t('verifyoncetrusteverywhere', 'Verify Once, Trust Everywhere')}</p>
          <div className="mt-3"><ConnectionStatus /></div>
        </div>

        {error && (
          <div className="bg-danger/10 border border-danger/20 text-danger p-3 rounded-xl mb-6 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-1">
            <label className="text-sm font-medium text-text-muted ml-1">{t('emailaddress', 'Email Address')}</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-muted">
                <Mail size={18} />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-surface-hover/50 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-text placeholder-text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all duration-300"
                placeholder={t('enteremail', 'Enter your email')}
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center ml-1">
              <label className="text-sm font-medium text-text-muted">{t('password', 'Password')}</label>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-muted">
                <Lock size={18} />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-surface-hover/50 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-text placeholder-text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all duration-300"
                placeholder={t('enterpassword', 'Enter your password')}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white font-medium py-3 rounded-xl flex items-center justify-center space-x-2 transition-all duration-300 transform hover:scale-[1.02] shadow-lg shadow-primary-500/25 disabled:opacity-70 disabled:hover:scale-100"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>{t('signin', 'Sign In')}</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-white/10 text-center">
          <p className="text-sm text-text-muted mb-4">{t('secureauth', 'Secure authentication powered by SCTN')}</p>
          <div className="flex justify-center text-success/80">
            <ShieldCheck size={24} />
          </div>
        </div>

        <div className="mt-6 text-center text-sm text-text-muted">
          {t('donthaveaccount', "Don't have an account?")}{' '}
          <Link to="/register" className="text-accent hover:text-accent/80 font-medium transition-colors">
            {t('registerascitizen', 'Register as Citizen')}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
