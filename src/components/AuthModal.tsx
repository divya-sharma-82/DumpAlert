import React, { useState } from 'react';
import { UserRole, UserAccount, WasteCollectorAccount, AdminAccount } from '../types';
import { MUNICIPAL_AREAS } from '../data/initialData';
import { X, User, Truck, ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (role: UserRole, account: UserAccount | WasteCollectorAccount | AdminAccount) => void;
  users: UserAccount[];
  collectors: WasteCollectorAccount[];
  admin: AdminAccount;
  onRegisterUser: (user: UserAccount) => void;
  onRegisterCollector: (collector: WasteCollectorAccount) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  users,
  collectors,
  admin,
  onRegisterUser,
  onRegisterCollector,
}) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>('user');
  const [isRegistering, setIsRegistering] = useState(false);

  // Login form state
  const [loginIdentifier, setLoginIdentifier] = useState(''); // email or phone
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // User registration state
  const [userName, setUserName] = useState('');
  const [userAge, setUserAge] = useState(25);
  const [userArea, setUserArea] = useState(MUNICIPAL_AREAS[0]);
  const [userEmail, setUserEmail] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [userGender, setUserGender] = useState<'Male' | 'Female' | 'Other'>('Female');
  const [userPassword, setUserPassword] = useState('');

  // Collector registration state
  const [collectorName, setCollectorName] = useState('');
  const [collectorGender, setCollectorGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [collectorPhone, setCollectorPhone] = useState('');
  const [collectorEmail, setCollectorEmail] = useState('');
  const [collectorArea, setCollectorArea] = useState(MUNICIPAL_AREAS[0]);
  const [collectorPassword, setCollectorPassword] = useState('');

  if (!isOpen) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    const query = loginIdentifier.trim().toLowerCase();

    if (selectedRole === 'admin') {
      if ((query === admin.email.toLowerCase() || query === admin.phone) && (loginPassword === admin.password || loginPassword === 'admin')) {
        onLoginSuccess('admin', admin);
        onClose();
        return;
      }
      setLoginError('Invalid Admin credentials. Try admin@ecosort.org / admin');
      return;
    }

    if (selectedRole === 'collector') {
      const match = collectors.find(
        (c) => (c.email.toLowerCase() === query || c.phone === query)
      );
      if (match) {
        onLoginSuccess('collector', match);
        onClose();
        return;
      }
      setLoginError('No collector account found matching email or phone number.');
      return;
    }

    if (selectedRole === 'user') {
      const match = users.find(
        (u) => (u.email.toLowerCase() === query || u.phone === query)
      );
      if (match) {
        onLoginSuccess('user', match);
        onClose();
        return;
      }
      setLoginError('No citizen account found matching email or phone number.');
      return;
    }
  };

  const handleRegisterUser = (e: React.FormEvent) => {
    e.preventDefault();
    const newId = `USR-${Math.floor(1000 + Math.random() * 9000)}`;
    const newUser: UserAccount = {
      id: newId,
      name: userName,
      age: Number(userAge),
      area: userArea,
      email: userEmail,
      phone: userPhone,
      gender: userGender,
      password: userPassword || 'password123',
      complaintsCount: 0,
    };
    onRegisterUser(newUser);
    onLoginSuccess('user', newUser);
    onClose();
  };

  const handleRegisterCollector = (e: React.FormEvent) => {
    e.preventDefault();
    const newId = `COL-${Math.floor(1000 + Math.random() * 9000)}`;
    const newCollector: WasteCollectorAccount = {
      id: newId,
      name: collectorName,
      gender: collectorGender,
      phone: collectorPhone,
      email: collectorEmail,
      assignedArea: collectorArea,
      password: collectorPassword || 'password123',
      dailyTargetTotal: 5,
      dailyResolvedCount: 0,
      coins: 0,
    };
    onRegisterCollector(newCollector);
    onLoginSuccess('collector', newCollector);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {isRegistering ? 'Register New Profile' : 'Access Portal Account'}
            </h3>
            <p className="text-xs text-slate-500">Sign in with Email or Phone Number</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Role Selector Tabs */}
        <div className="px-6 pt-4 pb-2">
          <div className="grid grid-cols-3 gap-2 p-1 bg-slate-100 rounded-xl">
            <button
              type="button"
              onClick={() => {
                setSelectedRole('user');
                setLoginError('');
              }}
              className={`flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-lg transition ${
                selectedRole === 'user'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <User className="w-3.5 h-3.5 text-emerald-600" />
              Citizen
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedRole('collector');
                setLoginError('');
              }}
              className={`flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-lg transition ${
                selectedRole === 'collector'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Truck className="w-3.5 h-3.5 text-blue-600" />
              Collector
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedRole('admin');
                setIsRegistering(false);
                setLoginError('');
              }}
              className={`flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-lg transition ${
                selectedRole === 'admin'
                  ? 'bg-white text-purple-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
              Admin
            </button>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6 pt-2">
          {loginError && (
            <div className="mb-4 p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
              {loginError}
            </div>
          )}

          {!isRegistering ? (
            /* Login Form */
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email ID or Phone Number
                </label>
                <input
                  type="text"
                  required
                  value={loginIdentifier}
                  onChange={(e) => setLoginIdentifier(e.target.value)}
                  placeholder={
                    selectedRole === 'admin'
                      ? 'admin@ecosort.org or 9876543210'
                      : selectedRole === 'collector'
                      ? 'rajesh.collector@ecosort.org or 9845123456'
                      : 'ananya.sharma@example.com or 9876541230'
                  }
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition shadow-xs flex items-center justify-center gap-1.5"
              >
                Sign In to {selectedRole === 'user' ? 'Citizen Portal' : selectedRole === 'collector' ? 'Collector Portal' : 'Admin Console'}
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              {/* 1-Click Demo Profiles */}
              <div className="mt-4 pt-4 border-t border-slate-100">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                  1-Click Instant Demo Profiles
                </span>
                <div className="flex flex-wrap gap-2">
                  {selectedRole === 'user' &&
                    users.slice(0, 3).map((u) => (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() => {
                          onLoginSuccess('user', u);
                          onClose();
                        }}
                        className="text-xs bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 border border-slate-200 px-2.5 py-1 rounded-md text-slate-700 transition flex items-center gap-1"
                      >
                        <User className="w-3 h-3 text-emerald-600" />
                        {u.name} ({u.id})
                      </button>
                    ))}

                  {selectedRole === 'collector' &&
                    collectors.slice(0, 3).map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => {
                          onLoginSuccess('collector', c);
                          onClose();
                        }}
                        className="text-xs bg-slate-100 hover:bg-blue-50 hover:text-blue-700 border border-slate-200 px-2.5 py-1 rounded-md text-slate-700 transition flex items-center gap-1"
                      >
                        <Truck className="w-3 h-3 text-blue-600" />
                        {c.name} ({c.id})
                      </button>
                    ))}

                  {selectedRole === 'admin' && (
                    <button
                      type="button"
                      onClick={() => {
                        onLoginSuccess('admin', admin);
                        onClose();
                      }}
                      className="text-xs bg-purple-50 text-purple-700 border border-purple-200 px-3 py-1.5 rounded-md transition font-semibold flex items-center gap-1"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                      Login as Chief Admin (ADM-001)
                    </button>
                  )}
                </div>
              </div>

              {selectedRole !== 'admin' && (
                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => setIsRegistering(true)}
                    className="text-xs text-emerald-700 hover:underline font-semibold"
                  >
                    Don't have an account? Register new {selectedRole === 'user' ? 'Citizen' : 'Collector'}
                  </button>
                </div>
              )}
            </form>
          ) : selectedRole === 'user' ? (
            /* Citizen Registration Form */
            <form onSubmit={handleRegisterUser} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="e.g. Priya Sen"
                    className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-lg outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Age</label>
                  <input
                    type="number"
                    min="16"
                    max="100"
                    required
                    value={userAge}
                    onChange={(e) => setUserAge(Number(e.target.value))}
                    className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-lg outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Gender</label>
                  <select
                    value={userGender}
                    onChange={(e) => setUserGender(e.target.value as any)}
                    className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-lg outline-none bg-white"
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Area / Ward</label>
                  <select
                    value={userArea}
                    onChange={(e) => setUserArea(e.target.value)}
                    className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-lg outline-none bg-white"
                  >
                    {MUNICIPAL_AREAS.map((a) => (
                      <option key={a} value={a}>
                        {a}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email ID</label>
                  <input
                    type="email"
                    required
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    placeholder="name@email.com"
                    className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-lg outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={userPhone}
                    onChange={(e) => setUserPhone(e.target.value)}
                    placeholder="10-digit number"
                    className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-lg outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={userPassword}
                  onChange={(e) => setUserPassword(e.target.value)}
                  placeholder="Set password"
                  className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-lg outline-none"
                />
              </div>

              <div className="p-2.5 bg-emerald-50 rounded-lg border border-emerald-200 text-xs text-emerald-800">
                ✨ A unique citizen identifier (e.g. <code>USR-XXXX</code>) will be generated automatically.
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsRegistering(false)}
                  className="w-1/3 py-2 px-3 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg"
                >
                  Back to Login
                </button>
                <button
                  type="submit"
                  className="w-2/3 py-2 px-3 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs"
                >
                  Create Citizen Account
                </button>
              </div>
            </form>
          ) : (
            /* Collector Registration Form */
            <form onSubmit={handleRegisterCollector} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Collector Name</label>
                  <input
                    type="text"
                    required
                    value={collectorName}
                    onChange={(e) => setCollectorName(e.target.value)}
                    placeholder="e.g. Sunil Verma"
                    className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-lg outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Gender</label>
                  <select
                    value={collectorGender}
                    onChange={(e) => setCollectorGender(e.target.value as any)}
                    className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-lg outline-none bg-white"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={collectorPhone}
                    onChange={(e) => setCollectorPhone(e.target.value)}
                    placeholder="10-digit number"
                    className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-lg outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email ID</label>
                  <input
                    type="email"
                    required
                    value={collectorEmail}
                    onChange={(e) => setCollectorEmail(e.target.value)}
                    placeholder="collector@ecosort.org"
                    className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-lg outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Assigned Operational Area</label>
                <select
                  value={collectorArea}
                  onChange={(e) => setCollectorArea(e.target.value)}
                  className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-lg outline-none bg-white"
                >
                  {MUNICIPAL_AREAS.map((a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={collectorPassword}
                  onChange={(e) => setCollectorPassword(e.target.value)}
                  placeholder="Set password"
                  className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-lg outline-none"
                />
              </div>

              <div className="p-2.5 bg-blue-50 rounded-lg border border-blue-200 text-xs text-blue-800">
                🚛 A unique collector badge ID (e.g. <code>COL-XXXX</code>) will be issued.
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsRegistering(false)}
                  className="w-1/3 py-2 px-3 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg"
                >
                  Back to Login
                </button>
                <button
                  type="submit"
                  className="w-2/3 py-2 px-3 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs"
                >
                  Register Collector Account
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
