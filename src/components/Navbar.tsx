import React from 'react';
import { UserRole, UserAccount, WasteCollectorAccount, AdminAccount } from '../types';
import { ShieldCheck, Truck, User, LogOut, ArrowRightLeft, Sparkles, Building2 } from 'lucide-react';

interface NavbarProps {
  currentRole: UserRole;
  currentUser: UserAccount | WasteCollectorAccount | AdminAccount | null;
  onSwitchRole: (role: UserRole) => void;
  onOpenAuth: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRole,
  currentUser,
  onSwitchRole,
  onOpenAuth,
  onLogout,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-xs">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg text-slate-900 tracking-tight">EcoSort Municipal</span>
                <span className="text-xs px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {currentRole === 'user' ? 'Citizen Portal' : currentRole === 'collector' ? 'Collector Field' : 'Admin Command'}
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">Unified Municipal Waste Management & Tracking System</p>
            </div>
          </div>

          {/* Quick Demo Switcher */}
          <div className="hidden md:flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200">
            <span className="text-xs text-slate-500 font-medium px-2 flex items-center gap-1">
              <ArrowRightLeft className="w-3.5 h-3.5" /> Portal:
            </span>
            <button
              type="button"
              onClick={() => onSwitchRole('user')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                currentRole === 'user'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Citizen
            </button>
            <button
              type="button"
              onClick={() => onSwitchRole('collector')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                currentRole === 'collector'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Collector
            </button>
            <button
              type="button"
              onClick={() => onSwitchRole('admin')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                currentRole === 'admin'
                  ? 'bg-white text-purple-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Admin
            </button>
          </div>

          {/* User profile & actions */}
          <div className="flex items-center space-x-3">
            {currentUser ? (
              <div className="flex items-center space-x-2">
                <div className="text-right hidden sm:block">
                  <div className="text-xs font-semibold text-slate-900 flex items-center justify-end gap-1">
                    <span>{currentUser.name}</span>
                    <span className="text-[10px] px-1.5 py-0.2 bg-slate-100 border border-slate-200 rounded font-mono text-slate-600">
                      {currentUser.id}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {'area' in currentUser ? currentUser.area : 'assignedArea' in currentUser ? currentUser.assignedArea : 'Municipal HQ'}
                  </div>
                </div>

                <div className="w-8 h-8 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center text-slate-700 font-bold text-xs">
                  {currentUser.name.charAt(0)}
                </div>

                <button
                  type="button"
                  onClick={onOpenAuth}
                  title="Switch User / Account"
                  className="p-1.5 text-slate-500 hover:text-slate-700 rounded-md hover:bg-slate-100"
                >
                  <ArrowRightLeft className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={onLogout}
                  title="Log out"
                  className="p-1.5 text-rose-600 hover:text-rose-700 rounded-md hover:bg-rose-50"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={onOpenAuth}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition"
              >
                <User className="w-3.5 h-3.5" />
                Sign In / Switch
              </button>
            )}
          </div>
        </div>

        {/* Mobile quick portal switcher */}
        <div className="flex md:hidden items-center justify-around py-2 border-t border-slate-100 text-xs">
          <button
            type="button"
            onClick={() => onSwitchRole('user')}
            className={`font-semibold pb-1 border-b-2 ${currentRole === 'user' ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-slate-500'}`}
          >
            Citizen
          </button>
          <button
            type="button"
            onClick={() => onSwitchRole('collector')}
            className={`font-semibold pb-1 border-b-2 ${currentRole === 'collector' ? 'border-blue-600 text-blue-700' : 'border-transparent text-slate-500'}`}
          >
            Collector
          </button>
          <button
            type="button"
            onClick={() => onSwitchRole('admin')}
            className={`font-semibold pb-1 border-b-2 ${currentRole === 'admin' ? 'border-purple-600 text-purple-700' : 'border-transparent text-slate-500'}`}
          >
            Admin
          </button>
        </div>
      </div>
    </header>
  );
};
