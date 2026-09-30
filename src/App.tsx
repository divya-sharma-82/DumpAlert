import React, { useState, useEffect } from 'react';
import { UserRole, UserAccount, WasteCollectorAccount, AdminAccount, Complaint } from './types';
import {
  INITIAL_USERS,
  INITIAL_COLLECTORS,
  INITIAL_ADMIN,
  INITIAL_COMPLAINTS,
} from './data/initialData';
import { Navbar } from './components/Navbar';
import { AuthModal } from './components/AuthModal';
import { UserPortal } from './components/UserPortal/UserPortal';
import { CollectorPortal } from './components/CollectorPortal/CollectorPortal';
import { AdminPortal } from './components/AdminPortal/AdminPortal';
import { RotateCcw, Sparkles } from 'lucide-react';

const STORAGE_KEYS = {
  ROLE: 'ecosort_role_v2',
  CURRENT_USER_ID: 'ecosort_current_uid_v2',
  USERS: 'ecosort_users_v2',
  COLLECTORS: 'ecosort_collectors_v2',
  COMPLAINTS: 'ecosort_complaints_v2',
};

export default function App() {
  // 1. Initialize State with LocalStorage Persistence
  const [currentRole, setCurrentRole] = useState<UserRole>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ROLE);
    return (saved as UserRole) || 'user';
  });

  const [users, setUsers] = useState<UserAccount[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USERS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_USERS;
  });

  const [collectors, setCollectors] = useState<WasteCollectorAccount[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.COLLECTORS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_COLLECTORS;
  });

  const [complaints, setComplaints] = useState<Complaint[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.COMPLAINTS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_COMPLAINTS;
  });

  const [admin] = useState<AdminAccount>(INITIAL_ADMIN);

  // Current active logged-in user
  const [currentUser, setCurrentUser] = useState<
    UserAccount | WasteCollectorAccount | AdminAccount | null
  >(() => {
    const savedRole = localStorage.getItem(STORAGE_KEYS.ROLE) || 'user';
    const savedUid = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID);

    if (savedRole === 'admin') return INITIAL_ADMIN;
    if (savedRole === 'collector') {
      const match = INITIAL_COLLECTORS.find((c) => c.id === savedUid);
      return match || INITIAL_COLLECTORS[0];
    }
    const match = INITIAL_USERS.find((u) => u.id === savedUid);
    return match || INITIAL_USERS[0];
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync state to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ROLE, currentRole);
  }, [currentRole]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.COLLECTORS, JSON.stringify(collectors));
  }, [collectors]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.COMPLAINTS, JSON.stringify(complaints));
  }, [complaints]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, currentUser.id);
    }
  }, [currentUser]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 4000);
  };

  // Switch role seamlessly
  const handleSwitchRole = (newRole: UserRole) => {
    setCurrentRole(newRole);
    if (newRole === 'admin') {
      setCurrentUser(admin);
    } else if (newRole === 'collector') {
      setCurrentUser(collectors[0]);
    } else {
      setCurrentUser(users[0]);
    }
  };

  const handleLoginSuccess = (
    role: UserRole,
    account: UserAccount | WasteCollectorAccount | AdminAccount
  ) => {
    setCurrentRole(role);
    setCurrentUser(account);
    showToast(`Signed in successfully as ${account.name} (${role.toUpperCase()})`);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setIsAuthModalOpen(true);
  };

  // Citizen Complaint Submission
  const handleSubmitComplaint = (
    newComplaintData: Omit<Complaint, 'id' | 'status' | 'filedAt' | 'deadlineAt'>
  ) => {
    const newId = `CMP-${Math.floor(10000 + Math.random() * 90000)}`;
    const now = new Date();
    const deadline = new Date(now.getTime() + 48 * 3600 * 1000); // 48-Hour SLA

    const newComplaint: Complaint = {
      ...newComplaintData,
      id: newId,
      status: 'Pending',
      filedAt: now.toISOString(),
      deadlineAt: deadline.toISOString(),
    };

    setComplaints((prev) => [newComplaint, ...prev]);

    // Increment user's complaint count for Badge progression (25 Bronze, 50 Silver, 100 Gold)
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === newComplaintData.userId) {
          const updatedCount = u.complaintsCount + 1;
          const updatedUser = { ...u, complaintsCount: updatedCount };
          if (currentUser && currentUser.id === u.id) {
            setCurrentUser(updatedUser);
          }
          return updatedUser;
        }
        return u;
      })
    );

    showToast(`Complaint ${newId} logged with 48h SLA! Your report count increased.`);
  };

  // Citizen Profile Update
  const handleUpdateProfile = (updatedFields: Partial<UserAccount>) => {
    if (!currentUser || currentRole !== 'user') return;

    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === currentUser.id) {
          const updated = { ...u, ...updatedFields };
          setCurrentUser(updated);
          return updated;
        }
        return u;
      })
    );
    showToast('Your citizen profile details have been saved.');
  };

  // Collector starts task
  const handleStartComplaint = (complaintId: string) => {
    setComplaints((prev) =>
      prev.map((c) => (c.id === complaintId ? { ...c, status: 'In Progress' } : c))
    );
    showToast(`Task ${complaintId} marked In Progress.`);
  };

  // Collector resolves task with photo verification
  const handleResolveComplaint = (
    complaintId: string,
    proofPicture: string,
    notes: string
  ) => {
    const resolvedAt = new Date().toISOString();

    setComplaints((prev) =>
      prev.map((c) => {
        if (c.id === complaintId) {
          return {
            ...c,
            status: 'Task Completed',
            resolvedAt,
            collectorProofPicture: proofPicture,
            notes,
          };
        }
        return c;
      })
    );

    // Update Collector's daily resolved progress & check 70% coin reward rule
    if (currentUser && currentRole === 'collector') {
      setCollectors((prev) =>
        prev.map((col) => {
          if (col.id === currentUser.id) {
            const newResolvedCount = (col.dailyResolvedCount || 0) + 1;
            const target = col.dailyTargetTotal || 5;
            const progressRatio = newResolvedCount / target;

            // If >= 70% progress, award +1 Digital Coin
            let newCoins = col.coins;
            const todayStr = new Date().toISOString().slice(0, 10);
            let updatedCoinAwardDate = col.lastDailyCoinAwardDate;

            if (progressRatio >= 0.7 && col.lastDailyCoinAwardDate !== todayStr) {
              newCoins += 1;
              updatedCoinAwardDate = todayStr;
              showToast('🎉 70% Daily Goal Achieved! +1 Digital Coin awarded to your wallet!');
            } else {
              showToast(`Task ${complaintId} resolved with photo proof! Progress updated.`);
            }

            const updatedCollector = {
              ...col,
              dailyResolvedCount: newResolvedCount,
              coins: newCoins,
              lastDailyCoinAwardDate: updatedCoinAwardDate,
            };
            setCurrentUser(updatedCollector);
            return updatedCollector;
          }
          return col;
        })
      );
    }
  };

  // Citizen acknowledges completion
  const handleAcknowledgeCompletion = (complaintId: string) => {
    setComplaints((prev) =>
      prev.map((c) => (c.id === complaintId ? { ...c, status: 'Resolved' } : c))
    );
    showToast(`Complaint ${complaintId} confirmed and closed.`);
  };

  // Collector converts digital coins to cash
  const handleConvertCoinsToCash = (amountCoins: number, cashAmount: number) => {
    if (!currentUser || currentRole !== 'collector') return;

    setCollectors((prev) =>
      prev.map((col) => {
        if (col.id === currentUser.id) {
          const updated = {
            ...col,
            coins: Math.max(0, col.coins - amountCoins),
          };
          setCurrentUser(updated);
          return updated;
        }
        return col;
      })
    );
    showToast(`Converted ${amountCoins} Digital Coins into ₹${cashAmount} ($${cashAmount / 10})!`);
  };

  // Register New User
  const handleRegisterUser = (newUser: UserAccount) => {
    setUsers((prev) => [newUser, ...prev]);
    showToast(`User account created: ${newUser.id}`);
  };

  // Register New Collector
  const handleRegisterCollector = (newCollector: WasteCollectorAccount) => {
    setCollectors((prev) => [newCollector, ...prev]);
    showToast(`Collector account created: ${newCollector.id}`);
  };

  // Reset to initial demo data
  const handleResetDemoData = () => {
    if (window.confirm('Reset all demo data (Users, Collectors, Complaints) back to initial municipal defaults?')) {
      setUsers(INITIAL_USERS);
      setCollectors(INITIAL_COLLECTORS);
      setComplaints(INITIAL_COMPLAINTS);
      setCurrentRole('user');
      setCurrentUser(INITIAL_USERS[0]);
      localStorage.clear();
      showToast('All municipal records reset to default test dataset.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col text-slate-900 font-sans">
      {/* Top Navbar */}
      <Navbar
        currentRole={currentRole}
        currentUser={currentUser}
        onSwitchRole={handleSwitchRole}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Toast Alert */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-2xl border border-slate-700 flex items-center gap-2 animate-in slide-in-from-bottom-5">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Dynamic Portal Rendering based on Role */}
        {currentRole === 'user' && currentUser && 'area' in currentUser && (
          <UserPortal
            user={currentUser as UserAccount}
            allComplaints={complaints}
            collectors={collectors}
            onSubmitComplaint={handleSubmitComplaint}
            onUpdateProfile={handleUpdateProfile}
            onAcknowledgeCompletion={handleAcknowledgeCompletion}
          />
        )}

        {currentRole === 'collector' && currentUser && 'assignedArea' in currentUser && (
          <CollectorPortal
            collector={currentUser as WasteCollectorAccount}
            allComplaints={complaints}
            onStartComplaint={handleStartComplaint}
            onResolveComplaint={handleResolveComplaint}
            onConvertCoinsToCash={handleConvertCoinsToCash}
          />
        )}

        {currentRole === 'admin' && (
          <AdminPortal
            admin={admin}
            users={users}
            collectors={collectors}
            complaints={complaints}
          />
        )}
      </main>

      {/* Footer & Reset Data Controls */}
      <footer className="border-t border-slate-200 bg-white py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            <strong>EcoSort Municipal Management Platform</strong> • Citizens • Collectors • Administration
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleResetDemoData}
              className="text-slate-500 hover:text-slate-800 flex items-center gap-1 font-medium transition cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset Demo Data
            </button>
            <span className="text-slate-300">|</span>
            <span>48h SLA Guaranteed</span>
          </div>
        </div>
      </footer>

      {/* Auth & Registration Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        users={users}
        collectors={collectors}
        admin={admin}
        onRegisterUser={handleRegisterUser}
        onRegisterCollector={handleRegisterCollector}
      />
    </div>
  );
}
