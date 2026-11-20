import ConnectionStatus from './ConnectionStatus';
import { useAuthStore } from '../store/useAuthStore';
import { Bell, UserCircle, LogOut, ShieldAlert, Clock, FileWarning, Upload, Sun, Moon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCallback, useState, useEffect, useRef } from 'react';
import api, { API_ORIGIN } from '../lib/axios';
import { useNotificationStore } from '../store/useNotificationStore';
import { useTranslation } from '../store/useSettingsStore';

const Navbar = ({ title }: { title: string }) => {
  const { user, logout, updateProfilePicture } = useAuthStore();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const [uploadingDropdownPic, setUploadingDropdownPic] = useState(false);

  const { readIds, markAsRead, markAllRead } = useNotificationStore();

  const handleDropdownPicUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

    setUploadingDropdownPic(true);
    try {
      const response = await api.post('/auth/profile-picture', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      updateProfilePicture(response.data.profilePicture);
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'Failed to upload profile picture';
      alert(errMsg);
    } finally {
      setUploadingDropdownPic(false);
    }
  };

  const getRoleLabel = (role?: string) => {
    if (!role) return '';
    return role.replace(/([A-Z])/g, ' $1').trim();
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const fetchNotifications = useCallback(async () => {
    if (user?.role === 'Citizen') {
      try {
        const res = await api.get('/citizen/alerts');
        setNotifications(res.data);
      } catch {
        console.error('Failed to load notifications');
      }
    } else if (user?.role === 'Admin') {
      try {
        const { data } = await api.get<{ count: number }>('/admin/change-requests/pending-count');
        setNotifications(data.count > 0 ? [{
          id: 'pending-profile-changes-' + data.count,
          type: 'Profile',
          title: 'Profile corrections awaiting review',
          description: String(data.count) + (data.count === 1 ? ' request is pending.' : ' requests are pending.'),
          createdAt: new Date(), severity: 'info', link: '/admin/changes'
        }] : []);
      } catch {
        console.error('Failed to load pending profile changes');
      }
    } else {
      // Mock notifications for verifier roles
      setNotifications([
        {
          id: 'verifier-req-1',
          type: 'Verification',
          title: 'New Verification Request',
          description: 'A citizen has submitted their documents for verification.',
          createdAt: new Date(Date.now() - 3600000 * 2),
          severity: 'info',
          link: '/verifier'
        },
        {
          id: 'verifier-sys-1',
          type: 'Security',
          title: 'Secure Node Connected',
          description: 'Successfully authenticated with Bangladesh Gov identity server.',
          createdAt: new Date(Date.now() - 3600000 * 24),
          severity: 'info',
          link: '/verifier'
        }
      ]);
    }
  }, [user?.role]);

  useEffect(() => {
    if (user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user, fetchNotifications]);

  // Handle outside click to close dropdown
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const unreadCount = notifications.filter(n => !readIds.includes(n.id)).length;

  const handleNotificationClick = (n: any) => {
    markAsRead(n.id);
    setIsOpen(false);
    navigate(n.link);
  };

  const markAllAsRead = () => {
    const allIds = notifications.map(n => n.id);
    markAllRead(allIds);
  };

  const getIcon = (severity: string) => {
    if (severity === 'danger') return <ShieldAlert className="text-danger" size={16} />;
    if (severity === 'warning') return <FileWarning className="text-warning" size={16} />;
    return <Clock className="text-primary-400" size={16} />;
  };

  const { t, lang, theme, toggleTheme, setLang } = useTranslation();

  return (
    <div className="h-20 glass-card border-b border-white/10 flex items-center justify-between px-8 sticky top-0 z-20">
      <div>
        <h2 className="text-xl font-bold text-text">
          {title === 'Citizen Vault' ? t('citizenVault', 'Citizen Vault') :
           title === 'Admin Control Center' ? t('adminControlCenter', 'Admin Control Center') :
           title.includes('Portal') ? t('verifierPortal', title) : t(title.toLowerCase().replace(/\s+/g, ''), title)}
        </h2>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
          <p className="text-xs text-text-muted">{t('loggedinas', 'Logged in as')} {getRoleLabel(user?.role)}</p>
          <ConnectionStatus />
        </div>
      </div>

      <div className="flex items-center space-x-6">
        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          className="p-2 bg-white/5 hover:bg-white/10 text-text-muted hover:text-text border border-white/10 rounded-xl transition-all duration-200 cursor-pointer shadow-sm hover:scale-105 active:scale-95 flex items-center justify-center shrink-0"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Language Toggle Button */}
        <button
          onClick={() => setLang(lang === 'en' ? 'bn' : 'en')}
          title={lang === 'en' ? 'বাংলা সংস্করণ' : 'English Version'}
          className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-text-muted hover:text-text border border-white/10 rounded-xl text-xs font-bold tracking-wider transition-all duration-200 cursor-pointer shadow-sm hover:scale-105 active:scale-95 flex items-center justify-center shrink-0"
        >
          {lang === 'en' ? 'বাং' : 'EN'}
        </button>

        {/* Notifications Bell */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`relative p-2 rounded-xl transition-all duration-200 ${
              isOpen
                ? 'bg-white/10 text-white shadow-lg'
                : 'text-text-muted hover:text-text hover:bg-white/5'
            }`}
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-danger text-[10px] font-bold text-white flex items-center justify-center rounded-full animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Glassmorphic Dropdown */}
          {isOpen && (
            <div className="absolute right-0 mt-3 w-80 glass-card border border-white/10 rounded-2xl shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-3 duration-250">
              <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-2">
                <span className="text-sm font-semibold text-white">Notifications</span>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-primary-400 hover:text-primary-300 font-medium transition-colors"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-64 overflow-y-auto space-y-1.5 pr-0.5">
                {notifications.length === 0 ? (
                  <div className="text-center py-6 text-text-muted text-xs">
                    No notifications
                  </div>
                ) : (
                  notifications.map((n) => {
                    const isRead = readIds.includes(n.id);
                    return (
                      <div
                        key={n.id}
                        onClick={() => handleNotificationClick(n)}
                        className={`p-2.5 rounded-xl border transition-all duration-200 cursor-pointer flex gap-3 ${
                          isRead
                            ? 'bg-white/2 border-transparent hover:bg-white/5'
                            : 'bg-white/5 border-white/5 hover:bg-white/8 hover:border-white/10'
                        }`}
                      >
                        <div className="pt-0.5 shrink-0">
                          {getIcon(n.severity)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className={`text-xs font-semibold truncate ${isRead ? 'text-text-muted' : 'text-white'}`}>
                              {n.title}
                            </p>
                            {!isRead && (
                              <span className="w-1.5 h-1.5 bg-primary-400 rounded-full shrink-0" />
                            )}
                          </div>
                          <p className="text-[11px] text-text-muted mt-0.5 line-clamp-2">
                            {n.description}
                          </p>
                          <span className="text-[9px] text-text-muted/60 mt-1 block">
                            {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {user?.role === 'Citizen' && (
                <div className="pt-2 border-t border-white/10 mt-2 text-center">
                  <button
                    onClick={() => { setIsOpen(false); navigate('/citizen/notifications'); }}
                    className="text-xs text-text-muted hover:text-white font-medium transition-colors"
                  >
                    View detailed history
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="relative" ref={profileDropdownRef}>
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center space-x-3 pl-6 border-l border-white/10 text-right hover:opacity-80 transition-all focus:outline-none cursor-pointer group"
          >
            <div className="text-right">
              <p className="text-sm font-medium text-text group-hover:text-primary-400 transition-colors">{user?.email}</p>
              <p className="text-3xs text-text-muted mt-0.5">{getRoleLabel(user?.role)}</p>
            </div>
            {user?.profilePicture ? (
              <div className="w-9 h-9 rounded-full overflow-hidden border border-primary-500/30 group-hover:scale-105 transition-all shrink-0">
                <img
                  src={user.profilePicture.startsWith('/uploads') ? `${API_ORIGIN}${user.profilePicture}` : user.profilePicture}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <UserCircle size={36} className="text-primary-400 group-hover:scale-105 transition-transform shrink-0" />
            )}
          </button>

          {/* User Profile Dropdown */}
          {isProfileOpen && (
            <div className="absolute right-0 mt-3 w-56 glass-card border border-white/10 rounded-2xl shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-3 duration-250 text-left">
              <div className="pb-3 border-b border-white/10 mb-2 flex items-center gap-3">
                {/* Avatar with upload trigger */}
                <div className="relative group shrink-0">
                  <div className="w-12 h-12 rounded-full overflow-hidden border border-white/10 bg-white/5 relative flex items-center justify-center">
                    {user?.profilePicture ? (
                      <img
                        src={user.profilePicture.startsWith('/uploads') ? `${API_ORIGIN}${user.profilePicture}` : user.profilePicture}
                        alt="Dropdown Avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <UserCircle size={28} className="text-primary-400" />
                    )}
                    {uploadingDropdownPic && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <div className="w-3.5 h-3.5 border border-primary-400 border-t-transparent rounded-full animate-spin" />
                      </div>
                    )}
                  </div>
                  <label className="absolute -bottom-1 -right-1 p-1 bg-primary-600 hover:bg-primary-500 text-white rounded-full cursor-pointer shadow-md hover:scale-105 transition-all">
                    <Upload size={8} />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleDropdownPicUpload}
                      className="hidden"
                      disabled={uploadingDropdownPic}
                    />
                  </label>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] text-text-muted uppercase tracking-wider">Logged in as</p>
                  <p className="text-xs font-semibold text-white truncate mt-0.5">{user?.email}</p>
                  <span className="inline-flex mt-1 px-1.5 py-0.5 rounded bg-primary-500/10 text-primary-400 text-[9px] font-semibold border border-primary-500/20">
                    {getRoleLabel(user?.role)}
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                {user?.role === 'Citizen' ? (
                  <button
                    onClick={() => { setIsProfileOpen(false); navigate('/citizen/profile'); }}
                    className="w-full text-left px-3 py-2 rounded-xl text-sm font-medium text-text-muted hover:text-white hover:bg-white/5 transition-all duration-200 cursor-pointer"
                  >
                    My Profile
                  </button>
                ) : (
                  <button
                    onClick={() => { setIsProfileOpen(false); navigate(user?.role === 'Admin' ? '/admin' : '/verifier'); }}
                    className="w-full text-left px-3 py-2 rounded-xl text-sm font-medium text-text-muted hover:text-white hover:bg-white/5 transition-all duration-200 cursor-pointer"
                  >
                    Dashboard Home
                  </button>
                )}

                <button
                  onClick={() => { setIsProfileOpen(false); handleLogout(); }}
                  className="w-full text-left px-3 py-2 rounded-xl text-sm font-medium text-danger hover:bg-danger/10 transition-all duration-200 flex items-center justify-between cursor-pointer"
                >
                  <span>Log Out</span>
                  <LogOut size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
