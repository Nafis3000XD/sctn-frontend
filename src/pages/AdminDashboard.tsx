import ChangeRequestsView from '../components/ChangeRequestsView';
import { parseRequestedData } from '../lib/consent';
import React, { useCallback, useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { Home, Users, AlertTriangle, Activity, UserPlus, FileCheck, MessageSquare, Search } from 'lucide-react';
import api from '../lib/axios';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useTranslation } from '../store/useSettingsStore';
import { CitizenFullDetailsView } from '../components/CitizenFullDetailsView';

const AdminDashboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [stats, setStats] = useState<any>({});
  const [alerts, setAlerts] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [consentRequests, setConsentRequests] = useState<any[]>([]);
  const [newUser, setNewUser] = useState({ email: '', password: '', role: 'Citizen' });
  const [createUserStatus, setCreateUserStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedAlertId, setExpandedAlertId] = useState<string | null>(null);
  const [loadingToggleStatus, setLoadingToggleStatus] = useState<string | null>(null);

  // Direct citizen search states
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

  const fetchAllData = useCallback(async () => {
    try {
      const [statsRes, alertsRes, usersRes, logsRes, requestsRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/fraud-alerts'),
        api.get('/admin/users'),
        api.get('/admin/audit-logs'),
        api.get('/admin/consent-requests')
      ]);
      setStats(statsRes.data);
      setAlerts(alertsRes.data);
      setUsers(usersRes.data);
      setAuditLogs(logsRes.data);
      setConsentRequests(requestsRes.data);
    } catch {
      console.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load + background refresh. 15s is ample for dashboard stats; 1s
  // polling caused constant refetch + re-render and hammered the API.
  useEffect(() => {
    fetchAllData();
    const interval = setInterval(fetchAllData, 15000);
    return () => clearInterval(interval);
  }, [fetchAllData]);

  const handleResolve = async (alertId: string) => {
    try {
      await api.post('/admin/fraud-alerts/resolve', { alertId });
      await fetchAllData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleUserStatus = async (userId: string, currentStatus: boolean) => {
    setLoadingToggleStatus(userId);
    try {
      await api.post('/admin/users/toggle-status', { userId, isActive: !currentStatus });
      await fetchAllData();
    } catch (err) {
      console.error('Failed to toggle user status:', err);
    } finally {
      setLoadingToggleStatus(null);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateUserStatus(null);
    try {
      await api.post('/admin/users', newUser);
      setCreateUserStatus('User created successfully!');
      setNewUser({ email: '', password: '', role: 'Citizen' });
      await fetchAllData();
    } catch (err: any) {
      setCreateUserStatus(err.response?.data?.message || 'Failed to create user');
    }
  };

  const links = [
    { name: 'Dashboard', path: '/admin', icon: <Home size={20} /> },
    { name: 'Search Citizen', path: '/admin/search', icon: <Search size={20} /> },
    { name: 'Users', path: '/admin/users', icon: <Users size={20} /> },
    { name: 'Change Requests', path: '/admin/changes', icon: <FileCheck size={20} /> },
    { name: 'Consent Requests', path: '/admin/requests', icon: <FileCheck size={20} /> },
    { name: 'Fraud Alerts', path: '/admin/fraud', icon: <AlertTriangle size={20} /> },
    { name: 'System Logs', path: '/admin/logs', icon: <Activity size={20} /> },
    { name: 'Support Tickets', path: '/admin/support', icon: <MessageSquare size={20} /> },
  ];

  const getRoleLabel = (role: string) => role.replace(/([A-Z])/g, ' $1').trim();

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
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-danger/10 blur-[120px] pointer-events-none" />

        <Navbar title="Admin Control Center" />

        <div className="p-8 relative z-10">
          <Routes>
            <Route path="/" element={
              <div className="space-y-8 animate-in">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div
                    onClick={() => navigate('/admin/users')}
                    className="glass-card rounded-2xl p-6 border-l-4 border-l-primary-500 hover:scale-[1.02] transition-transform duration-300 cursor-pointer"
                  >
                    <p className="text-text-muted text-sm font-medium mb-1">{t('totalusers', 'Total Users')}</p>
                    <h3 className="text-3xl font-bold text-white">{stats.totalCitizens || 0}</h3>
                  </div>
                  <div
                    onClick={() => navigate('/admin/requests')}
                    className="glass-card rounded-2xl p-6 border-l-4 border-l-accent hover:scale-[1.02] transition-transform duration-300 cursor-pointer"
                  >
                    <p className="text-text-muted text-sm font-medium mb-1">{t('consentrequests', 'Consent Requests')}</p>
                    <h3 className="text-3xl font-bold text-white">{stats.totalRequests || 0}</h3>
                  </div>
                  <div
                    onClick={() => navigate('/admin/requests')}
                    className="glass-card rounded-2xl p-6 border-l-4 border-l-success hover:scale-[1.02] transition-transform duration-300 cursor-pointer"
                  >
                    <p className="text-text-muted text-sm font-medium mb-1">{t('activepermissions', 'Active Permissions')}</p>
                    <h3 className="text-3xl font-bold text-white">{stats.activePermissions || 0}</h3>
                  </div>
                  <div
                    onClick={() => navigate('/admin/fraud')}
                    className="glass-card rounded-2xl p-6 border-l-4 border-l-danger hover:scale-[1.02] transition-transform duration-300 cursor-pointer"
                  >
                    <p className="text-text-muted text-sm font-medium mb-1">{t('fraudalerts', 'Fraud Alerts')}</p>
                    <h3 className="text-3xl font-bold text-white">{stats.fraudCases || 0}</h3>
                  </div>
                </div>

                <div className="glass-card rounded-2xl p-8">
                  <h2 className="text-2xl font-semibold text-white mb-6">{t('recentalerts', 'Recent Alerts')}</h2>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-white/10 text-text-muted text-sm uppercase tracking-wider">
                          <th className="pb-3 font-medium">Type</th>
                          <th className="pb-3 font-medium">Duplicate Value</th>
                          <th className="pb-3 font-medium">Date Detected</th>
                          <th className="pb-3 font-medium">Status</th>
                          <th className="pb-3 font-medium text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {alerts.slice(0, 5).map((alert) => (
                          <tr key={alert.id} className="hover:bg-surface-hover/30 transition-colors duration-200">
                            <td className="py-4 text-white font-medium">{alert.duplicateType}</td>
                            <td className="py-4 text-primary-400 font-mono text-sm">{alert.duplicateValue}</td>
                            <td className="py-4 text-text-muted">{new Date(alert.createdAt).toLocaleDateString()}</td>
                            <td className="py-4">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                alert.status === 'Open' ? 'bg-danger/15 text-danger border border-danger/20' : 'bg-success/15 text-success border border-success/20'
                              }`}>
                                {alert.status}
                              </span>
                            </td>
                            <td className="py-4 text-right">
                              {alert.status === 'Open' && (
                                <button
                                  onClick={() => handleResolve(alert.id)}
                                  className="px-3 py-1.5 bg-success/15 hover:bg-success/25 text-success border border-success/25 rounded-lg text-sm transition-all duration-200 hover:scale-[1.02]"
                                >
                                  Resolve
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                        {alerts.length === 0 && (
                          <tr>
                            <td colSpan={5} className="py-8 text-center text-text-muted">No fraud alerts found.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            } />

            <Route path="/users" element={
              <div className="space-y-8 animate-in">
                <div className="glass-card rounded-2xl p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <UserPlus size={24} className="text-primary-400" />
                    <h2 className="text-2xl font-semibold text-white">Create New Account</h2>
                  </div>

                  {createUserStatus && (
                    <div className={`p-4 rounded-xl mb-6 text-sm font-medium ${
                      createUserStatus.includes('success') ? 'bg-success/15 text-success border border-success/20' : 'bg-danger/15 text-danger border border-danger/20'
                    }`}>
                      {createUserStatus}
                    </div>
                  )}

                  <form onSubmit={handleCreateUser} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-text-muted ml-1">Email</label>
                      <input
                        type="email"
                        value={newUser.email}
                        onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                        className="w-full bg-surface-hover/50 border border-white/10 rounded-xl py-2.5 px-4 text-text focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all duration-200"
                        placeholder="user@example.com"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-text-muted ml-1">Password</label>
                      <input
                        type="password"
                        value={newUser.password}
                        onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                        className="w-full bg-surface-hover/50 border border-white/10 rounded-xl py-2.5 px-4 text-text focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all duration-200"
                        placeholder="Strong password"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-text-muted ml-1">Role</label>
                      <select
                        value={newUser.role}
                        onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                        className="w-full bg-surface-hover/50 border border-white/10 rounded-xl py-2.5 px-4 text-text focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all duration-200"
                      >
                        <option value="Citizen">Citizen</option>
                        <option value="Admin">Admin</option>
                        <option value="JobInterviewer">Job Interviewer</option>
                        <option value="BankLoanOfficer">Bank Loan Officer</option>
                        <option value="UniversityAuthority">University Authority</option>
                        <option value="Doctor">Doctor</option>
                        <option value="IntelligenceDepartment">Intelligence Department</option>

                      </select>
                    </div>
                    <button
                      type="submit"
                      className="w-full h-[42px] bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white font-medium rounded-xl transition-all duration-200 hover:scale-[1.02]"
                    >
                      Create Account
                    </button>
                  </form>
                </div>

                <div className="glass-card rounded-2xl p-8">
                  <h2 className="text-2xl font-semibold text-white mb-6">All Users ({users.length})</h2>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-white/10 text-text-muted text-sm uppercase tracking-wider">
                          <th className="pb-3 font-medium">Email</th>
                          <th className="pb-3 font-medium">Citizen ID</th>
                          <th className="pb-3 font-medium">Role</th>
                          <th className="pb-3 font-medium">Status</th>
                          <th className="pb-3 font-medium">Date Joined</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {users.map((u) => (
                          <tr key={u.id} className="hover:bg-surface-hover/30 transition-colors duration-200">
                            <td className="py-4 text-white font-medium">{u.email}</td>
                            <td className="py-4 text-accent font-mono text-sm">{u.citizenProfile?.citizenId || '-'}</td>
                            <td className="py-4 text-primary-400 text-sm">{getRoleLabel(u.role)}</td>
                            <td className="py-4">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                u.isActive ? 'bg-success/15 text-success border border-success/20' : 'bg-danger/15 text-danger border border-danger/20'
                              }`}>
                                {u.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td className="py-4 text-text-muted">{new Date(u.createdAt).toLocaleDateString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            } />

            <Route path="/fraud" element={
              <div className="glass-card rounded-2xl p-8 animate-in">
                <h2 className="text-2xl font-semibold text-white mb-6">All Fraud Alerts</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-white/10 text-text-muted text-sm uppercase tracking-wider">
                        <th className="pb-3 font-medium">Type</th>
                        <th className="pb-3 font-medium">Duplicate Value</th>
                        <th className="pb-3 font-medium">Date Detected</th>
                        <th className="pb-3 font-medium">Status</th>
                        <th className="pb-3 font-medium text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {alerts.map((alert) => (
                        <React.Fragment key={alert.id}>
                          <tr className="hover:bg-surface-hover/30 transition-colors duration-200">
                            <td className="py-4 text-white font-medium">{alert.duplicateType}</td>
                            <td className="py-4 text-primary-400 font-mono text-sm">{alert.duplicateValue}</td>
                            <td className="py-4 text-text-muted">{new Date(alert.createdAt).toLocaleDateString()}</td>
                            <td className="py-4">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                alert.status === 'Open' ? 'bg-danger/15 text-danger border border-danger/20' : 'bg-success/15 text-success border border-success/20'
                              }`}>
                                {alert.status}
                              </span>
                            </td>
                            <td className="py-4 text-right">
                              {alert.status === 'Open' ? (
                                <button
                                  onClick={() => setExpandedAlertId(expandedAlertId === alert.id ? null : alert.id)}
                                  className="px-3 py-1.5 bg-primary-500/10 hover:bg-primary-500/20 text-primary-400 border border-primary-500/25 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer hover:scale-[1.02]"
                                >
                                  {expandedAlertId === alert.id ? 'Hide Case' : 'Investigate Case'}
                                </button>
                              ) : (
                                <span className="text-text-muted text-sm">Resolved</span>
                              )}
                            </td>
                          </tr>
                          {expandedAlertId === alert.id && alert.status === 'Open' && (
                            <tr>
                              <td colSpan={5} className="bg-surface/30 p-6 rounded-b-xl border border-white/5">
                                <div className="space-y-6">
                                  <div className="flex justify-between items-center pb-3 border-b border-white/5">
                                    <div>
                                      <h3 className="text-lg font-semibold text-white">Fraud Investigation Center</h3>
                                      <p className="text-xs text-text-muted mt-0.5">Compare candidate profiles matching duplicate value {alert.duplicateValue}</p>
                                    </div>
                                    <button
                                      onClick={() => handleResolve(alert.id)}
                                      className="px-4 py-2 bg-success/20 hover:bg-success text-success hover:text-white border border-success/30 rounded-xl text-sm font-medium transition-all cursor-pointer"
                                    >
                                      Mark Case as Resolved
                                    </button>
                                  </div>

                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {alert.involvedUsers?.map((u: any, idx: number) => (
                                      <div key={u.id} className="glass-card p-5 border border-white/10 rounded-2xl space-y-4 text-left">
                                        <div className="flex justify-between items-start">
                                          <div>
                                            <p className="text-[10px] text-text-muted uppercase tracking-wider">Candidate {idx + 1}</p>
                                            <h4 className="text-base font-bold text-white mt-1">{u.citizenProfile?.fullName || 'Anonymous Citizen'}</h4>
                                            <p className="text-xs text-text-muted mt-0.5">{u.email}</p>
                                          </div>
                                          <span className={`px-2 py-0.5 text-2xs rounded border font-semibold uppercase tracking-wider ${
                                            u.isActive
                                              ? 'bg-success/10 text-success border-success/20'
                                              : 'bg-danger/10 text-danger border-danger/20'
                                          }`}>
                                            {u.isActive ? 'Active' : 'Suspended'}
                                          </span>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 text-xs py-3 border-y border-white/5">
                                          <div>
                                            <p className="text-text-muted text-3xs uppercase tracking-wider">Citizen ID</p>
                                            <p className="text-white font-mono mt-0.5">{u.citizenProfile?.citizenId || 'N/A'}</p>
                                          </div>
                                          <div>
                                            <p className="text-text-muted text-3xs uppercase tracking-wider">Phone</p>
                                            <p className="text-white mt-0.5">{u.citizenProfile?.phone || 'N/A'}</p>
                                          </div>
                                          <div className="col-span-2">
                                            <p className="text-text-muted text-3xs uppercase tracking-wider">Registered On</p>
                                            <p className="text-white mt-0.5">{new Date(u.createdAt).toLocaleString()}</p>
                                          </div>
                                        </div>

                                        <div className="pt-2">
                                          <button
                                            disabled={loadingToggleStatus === u.id}
                                            onClick={() => handleToggleUserStatus(u.id, u.isActive)}
                                            className={`w-full py-2 border rounded-xl text-xs font-semibold cursor-pointer transition-all flex items-center justify-center gap-2 ${
                                              u.isActive
                                                ? 'bg-danger/10 hover:bg-danger border-danger/30 text-danger hover:text-white'
                                                : 'bg-success/10 hover:bg-success border-success/30 text-success hover:text-white'
                                            }`}
                                          >
                                            {loadingToggleStatus === u.id ? (
                                              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            ) : u.isActive ? (
                                              'Suspend Account'
                                            ) : (
                                              'Activate Account'
                                            )}
                                          </button>
                                        </div>
                                      </div>
                                    ))}
                                    {(!alert.involvedUsers || alert.involvedUsers.length === 0) && (
                                      <p className="col-span-2 text-sm text-text-muted text-center py-4">
                                        No registered candidate details found matching this duplicate case.
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      ))}
                      {alerts.length === 0 && (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-text-muted">No fraud alerts found.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            } />

            <Route path="/requests" element={
              <div className="glass-card rounded-2xl p-8 animate-in">
                <h2 className="text-2xl font-semibold text-white mb-6">Global Consent Requests</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-white/10 text-text-muted text-sm uppercase tracking-wider">
                        <th className="pb-3 font-medium">Requester (Verifier)</th>
                        <th className="pb-3 font-medium">Target Citizen</th>
                        <th className="pb-3 font-medium">Requested Fields</th>
                        <th className="pb-3 font-medium">Date Created</th>
                        <th className="pb-3 font-medium">Ending Time & Date</th>
                        <th className="pb-3 font-medium text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {consentRequests.map((req) => (
                        <tr key={req.id} className="hover:bg-surface-hover/30 transition-colors duration-200">
                          <td className="py-4">
                            <p className="text-white font-medium">{getRoleLabel(req.requester.role)}</p>
                            <p className="text-xs text-text-muted">{req.requester.email}</p>
                          </td>
                          <td className="py-4">
                            <p className="text-white font-medium">{req.target.citizenProfile?.fullName || 'N/A'}</p>
                            <p className="text-xs text-accent font-mono">{req.target.citizenProfile?.citizenId || '-'}</p>
                          </td>
                          <td className="py-4 text-text-muted text-sm">
                            {parseRequestedData(req.requestedData)}
                          </td>
                          <td className="py-4 text-text-muted text-sm">
                            {new Date(req.createdAt).toLocaleString()}
                          </td>
                          <td className="py-4 text-text-muted text-sm">
                            {req.expiryTime ? new Date(req.expiryTime).toLocaleString() : 'N/A'}
                          </td>
                          <td className="py-4 text-right">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              req.status === 'Pending' ? 'bg-warning/15 text-warning border border-warning/20' :
                              req.status === 'Approved' ? 'bg-success/15 text-success border border-success/20' :
                              'bg-danger/15 text-danger border border-danger/20'
                            }`}>
                              {req.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                      {consentRequests.length === 0 && (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-text-muted">No consent requests found.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            } />

            <Route path="/logs" element={
              <div className="glass-card rounded-2xl p-8 animate-in">
                <h2 className="text-2xl font-semibold text-white mb-6">Real-Time Audit System Logs</h2>
                <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-white/10 text-text-muted text-sm uppercase tracking-wider">
                        <th className="pb-3 font-medium">Timestamp</th>
                        <th className="pb-3 font-medium">User Email</th>
                        <th className="pb-3 font-medium">Role</th>
                        <th className="pb-3 font-medium">Action</th>
                        <th className="pb-3 font-medium text-right">Entity</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {auditLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-surface-hover/30 transition-colors duration-200">
                          <td className="py-4 text-text-muted text-sm font-mono">{new Date(log.timestamp).toLocaleString()}</td>
                          <td className="py-4 text-white font-medium">{log.user?.email || 'System / Guest'}</td>
                          <td className="py-4 text-primary-400 text-sm">{log.user?.role ? getRoleLabel(log.user.role) : 'System'}</td>
                          <td className="py-4">
                            <span className="px-2.5 py-1 text-xs rounded-lg bg-surface font-semibold text-white border border-white/5 uppercase tracking-wide">
                              {log.action.replace(/_/g, ' ')}
                            </span>
                          </td>
                          <td className="py-4 text-right text-text-muted text-sm font-mono">{log.entity || '-'}</td>
                        </tr>
                      ))}
                      {auditLogs.length === 0 && (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-text-muted">No audit logs recorded yet.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            } />

            <Route path="/changes" element={<ChangeRequestsView admin />} />

            <Route path="/support" element={<SupportTicketsView />} />

            <Route path="/search" element={
              <div className="space-y-6 animate-in">
                <div className="glass-card rounded-2xl p-8 max-w-2xl mx-auto">
                  <div className="flex items-center space-x-3 mb-6">
                    <Search size={28} className="text-primary-400" />
                    <h2 className="text-2xl font-semibold text-white">Search Citizen Records</h2>
                  </div>

                  <p className="text-text-muted mb-6">
                    Enter a Citizen ID to view their full profile details. As an Administrator, you have direct clearance to inspect all records.
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
            } />

            <Route path="*" element={<Navigate to="/admin" replace />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

const SupportTicketsView = () => {
  const { t, lang } = useTranslation();
  const [supportThreads, setSupportThreads] = useState<any[]>([]);
  const [selectedCitizenId, setSelectedCitizenId] = useState<string | null>(null);
  const [activeThreadMessages, setActiveThreadMessages] = useState<any[]>([]);
  const [newReplyMessage, setNewReplyMessage] = useState('');
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  // Poll support threads list
  useEffect(() => {
    let active = true;
    const fetchThreads = async () => {
      try {
        const res = await api.get('/admin/support-tickets');
        if (active) {
          setSupportThreads(res.data);
        }
      } catch (err) {
        console.error('Failed to fetch support threads:', err);
      }
    };

    fetchThreads();
    const interval = setInterval(fetchThreads, 15000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  // Poll selected thread messages
  useEffect(() => {
    if (!selectedCitizenId) {
      setActiveThreadMessages([]);
      return;
    }

    let active = true;
    const fetchMessages = async () => {
      try {
        const res = await api.get(`/admin/support-tickets/${selectedCitizenId}`);
        if (active) {
          setActiveThreadMessages(res.data);
        }
      } catch (err) {
        console.error('Failed to fetch messages for thread:', err);
      }
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 8000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [selectedCitizenId]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeThreadMessages]);

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReplyMessage.trim() || !selectedCitizenId) return;

    const messageToSend = newReplyMessage;
    setNewReplyMessage('');

    try {
      const res = await api.post(`/admin/support-tickets/${selectedCitizenId}`, { message: messageToSend });
      setActiveThreadMessages(prev => [...prev, res.data]);
    } catch (err) {
      console.error('Failed to send reply:', err);
    }
  };

  const selectedThread = supportThreads.find(t => t.citizenId === selectedCitizenId);

  const toggleTicketStatus = async () => {
    if (!selectedCitizenId || !selectedThread) return;
    const newStatus = selectedThread.supportStatus === 'Closed' ? 'Open' : 'Closed';
    try {
      await api.post(`/admin/support-tickets/${selectedCitizenId}/status`, { status: newStatus });
      setSupportThreads(prev =>
        prev.map(t =>
          t.citizenId === selectedCitizenId
            ? { ...t, supportStatus: newStatus }
            : t
        )
      );
    } catch (err) {
      console.error('Failed to toggle ticket status:', err);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[calc(100vh-12rem)] animate-in">
      {/* Left Pane: Threads List */}
      <div className="lg:col-span-1 glass-card rounded-2xl p-6 flex flex-col overflow-hidden h-full">
        <h3 className="text-xl font-semibold text-white mb-4">{t('supporttickets', 'Support Tickets')}</h3>
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
          {supportThreads.length === 0 ? (
            <div className="text-center py-8 text-text-muted text-sm">
              {lang === 'en' ? 'No support tickets found.' : 'কোনো সহায়তা টিকিট পাওয়া যায়নি।'}
            </div>
          ) : (
            supportThreads.map((thread) => {
              const isSelected = thread.citizenId === selectedCitizenId;
              return (
                <div
                  key={thread.citizenId}
                  onClick={() => setSelectedCitizenId(thread.citizenId)}
                  className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer text-left ${
                    isSelected
                      ? 'bg-primary-500/20 text-white border-primary-500/30 shadow-[inset_0_0_20px_rgba(59,130,246,0.15)]'
                      : 'bg-surface/30 text-text border-white/5 hover:bg-surface-hover/30 hover:border-white/10'
                  }`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <h4 className="font-semibold text-sm truncate text-white">{thread.fullName}</h4>
                    <span className="text-[10px] text-text-muted shrink-0">
                      {thread.lastMessageAt
                        ? new Date(thread.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : ''}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2 mt-0.5">
                    <p className="text-xs text-accent font-mono">{thread.citizenCode || 'No Citizen ID'}</p>
                    {thread.supportStatus === 'Closed' && (
                      <span className="px-1.5 py-0.5 text-[9px] font-semibold bg-danger/15 text-danger border border-danger/20 rounded">
                        {lang === 'en' ? 'Closed' : 'বন্ধ'}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-text-muted truncate mt-2">
                    {thread.lastMessage || 'No messages'}
                  </p>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Right Pane: Chat History */}
      <div className="lg:col-span-2 glass-card rounded-2xl flex flex-col overflow-hidden h-full">
        {selectedCitizenId ? (
          <div className="flex flex-col h-full overflow-hidden">
            {/* Header */}
            <div className="bg-slate-800/40 px-6 py-4 border-b border-white/5 flex items-center justify-between">
              <div className="text-left">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-white text-base">{selectedThread?.fullName || 'Citizen Support Thread'}</h4>
                  {selectedThread?.supportStatus === 'Closed' ? (
                    <span className="px-2 py-0.5 text-xs font-semibold bg-danger/15 text-danger border border-danger/20 rounded-full">{lang === 'en' ? 'Closed' : 'বন্ধ'}</span>
                  ) : (
                    <span className="px-2 py-0.5 text-xs font-semibold bg-success/15 text-success border border-success/20 rounded-full">{lang === 'en' ? 'Open' : 'খোলা'}</span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-accent font-mono">{selectedThread?.citizenCode}</span>
                  <span className="text-xs text-text-muted">•</span>
                  <span className="text-xs text-text-muted">{selectedThread?.email}</span>
                </div>
              </div>
              <div>
                <button
                  onClick={toggleTicketStatus}
                  className={`px-3 py-1.5 border rounded-lg text-xs font-semibold cursor-pointer transition-all hover:scale-[1.02] ${
                    selectedThread?.supportStatus === 'Closed'
                      ? 'bg-success/10 hover:bg-success border-success/30 text-success hover:text-white'
                      : 'bg-danger/10 hover:bg-danger border-danger/30 text-danger hover:text-white'
                  }`}
                >
                  {selectedThread?.supportStatus === 'Closed'
                    ? (lang === 'en' ? 'Reopen Ticket' : 'টিকিট পুনরায় খুলুন')
                    : t('closeticket', 'Close Ticket')}
                </button>
              </div>
            </div>

            {/* Chat list */}
            <div className="flex-1 p-6 overflow-y-auto space-y-4 flex flex-col scrollbar-thin">
              {activeThreadMessages.length === 0 ? (
                <div className="h-full flex items-center justify-center text-text-muted text-sm">
                  {lang === 'en' ? 'No messages in this thread.' : 'এই থ্রেডে কোনো বার্তা নেই।'}
                </div>
              ) : (
                activeThreadMessages.map((msg) => {
                  const isAdmin = msg.sender.role === 'Admin';
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col max-w-[70%] ${isAdmin ? 'self-end items-end' : 'self-start items-start'}`}
                    >
                      <div className={`px-4 py-2.5 rounded-2xl text-sm ${
                        isAdmin
                          ? 'bg-primary-600 text-white rounded-tr-none'
                          : 'bg-white/5 text-white rounded-tl-none border border-white/5'
                      }`}>
                        {msg.message}
                      </div>
                      <span className="text-[10px] text-text-muted mt-1 px-1">
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Form or Closed State */}
            {selectedThread?.supportStatus === 'Closed' ? (
              <div className="p-4 bg-danger/5 border-t border-white/5 flex items-center justify-between gap-3 text-left">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🔒</span>
                  <div>
                    <p className="text-xs font-semibold text-white">
                      {lang === 'en' ? 'This ticket has been marked as resolved.' : 'এই টিকিটটি সমাধান করা হয়েছে।'}
                    </p>
                    <p className="text-[10px] text-text-muted">
                      {lang === 'en'
                        ? 'Reopen this ticket to reply, or wait for citizen to send a new message.'
                        : 'উত্তর দিতে এই টিকিটটি পুনরায় খুলুন, অথবা নাগরিকের নতুন বার্তার জন্য অপেক্ষা করুন।'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={toggleTicketStatus}
                  className="bg-primary-600 hover:bg-primary-500 text-white font-semibold px-4 py-2 rounded-xl text-xs transition-all duration-200"
                >
                  {lang === 'en' ? 'Reopen Ticket' : 'টিকিট পুনরায় খুলুন'}
                </button>
              </div>
            ) : (
              <form
                onSubmit={handleSendReply}
                className="p-4 bg-slate-950/20 border-t border-white/5 flex gap-3"
              >
                <input
                  type="text"
                  value={newReplyMessage}
                  onChange={(e) => setNewReplyMessage(e.target.value)}
                  placeholder={lang === 'en' ? 'Type your reply to citizen...' : 'নাগরিককে আপনার উত্তর লিখুন...'}
                  className="flex-1 bg-surface-hover/30 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                />
                <button
                  type="submit"
                  className="bg-primary-600 hover:bg-primary-500 text-white font-semibold px-6 py-3 rounded-xl text-sm transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shrink-0"
                >
                  {t('send', 'Send')}
                </button>
              </form>
            )}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 text-text-muted">
            <div className="w-16 h-16 rounded-full bg-slate-800/50 flex items-center justify-center border border-white/5 mb-4 text-2xl">
              💬
            </div>
            <h4 className="font-semibold text-white text-base">{lang === 'en' ? 'Select a conversation' : 'একটি কথোপকথন নির্বাচন করুন'}</h4>
            <p className="text-xs text-text-muted mt-1 max-w-sm">
              {lang === 'en'
                ? 'Choose a support ticket thread from the left pane to view message logs and communicate with the citizen.'
                : 'বার্তা দেখতে এবং নাগরিকের সাথে কথা বলতে বাম পাশ থেকে একটি সহায়তা টিকিট থ্রেড নির্বাচন করুন।'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
