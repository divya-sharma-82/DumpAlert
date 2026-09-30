import React, { useState } from 'react';
import { UserAccount, WasteCollectorAccount, AdminAccount, Complaint } from '../../types';
import { MUNICIPAL_AREAS } from '../../data/initialData';
import {
  ShieldCheck,
  Users,
  FileText,
  Truck,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  CheckCircle,
  HelpCircle,
  Search,
  Download,
  Filter,
  ArrowUpDown,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Award,
  Coins,
  Eye,
  TrendingUp,
  Flame,
  Radio
} from 'lucide-react';

interface AdminPortalProps {
  admin: AdminAccount;
  users: UserAccount[];
  collectors: WasteCollectorAccount[];
  complaints: Complaint[];
  onAddUser?: (user: UserAccount) => void;
  onAddCollector?: (collector: WasteCollectorAccount) => void;
}

type AlertLevelFilter = 'ALL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'CLEAR';

export const AdminPortal: React.FC<AdminPortalProps> = ({
  admin,
  users,
  collectors,
  complaints,
}) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'alerts' | 'logers' | 'employees'>('dashboard');

  // Waste Area Alert interactable button state (High, Medium, Low, Clear)
  const [selectedAlertLevel, setSelectedAlertLevel] = useState<AlertLevelFilter>('ALL');

  // Users Logger search & filter state
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [userAreaFilter, setUserAreaFilter] = useState('ALL');

  // Employees search state
  const [collectorSearchQuery, setCollectorSearchQuery] = useState('');

  // 1. Dashboard Totals Required:
  // "Dashboard (shows total numbers of = Users, Complains, Collector, Resolve complains)"
  const totalUsers = users.length;
  const totalComplaints = complaints.length;
  const totalCollectors = collectors.length;
  const totalResolvedComplaints = complaints.filter(
    (c) => c.status === 'Task Completed' || c.status === 'Resolved'
  ).length;

  // 2. Waste Area Alert Computation:
  // Categorize every municipal area based on the number of filed complaints by users:
  // High: 3 or more (Red)
  // Medium: 2 (Orange)
  // Low: 1 (Yellow)
  // Clear: 0 (Green)
  const areaAlertData = MUNICIPAL_AREAS.map((areaName) => {
    const areaComplaints = complaints.filter((c) => c.area === areaName);
    const activeComplaints = areaComplaints.filter((c) => c.status !== 'Resolved' && c.status !== 'Task Completed');
    const assigned = collectors.filter((col) => col.assignedArea === areaName);

    let level: 'High' | 'Medium' | 'Low' | 'Clear' = 'Clear';
    let colorHex = '#10B981'; // green
    let badgeBg = 'bg-emerald-100 text-emerald-800 border-emerald-300';

    if (activeComplaints.length >= 3) {
      level = 'High';
      colorHex = '#EF4444'; // red
      badgeBg = 'bg-rose-100 text-rose-800 border-rose-300';
    } else if (activeComplaints.length === 2) {
      level = 'Medium';
      colorHex = '#F97316'; // orange
      badgeBg = 'bg-orange-100 text-orange-800 border-orange-300';
    } else if (activeComplaints.length === 1) {
      level = 'Low';
      colorHex = '#EAB308'; // yellow
      badgeBg = 'bg-amber-100 text-amber-800 border-amber-300';
    } else {
      level = 'Clear';
      colorHex = '#10B981'; // green
      badgeBg = 'bg-emerald-100 text-emerald-800 border-emerald-300';
    }

    return {
      name: areaName,
      level,
      colorHex,
      badgeBg,
      activeCount: activeComplaints.length,
      totalCount: areaComplaints.length,
      complaints: areaComplaints,
      assignedCollectors: assigned,
    };
  });

  // Counts for each alert level
  const highAlertAreas = areaAlertData.filter((a) => a.level === 'High');
  const mediumAlertAreas = areaAlertData.filter((a) => a.level === 'Medium');
  const lowAlertAreas = areaAlertData.filter((a) => a.level === 'Low');
  const clearAlertAreas = areaAlertData.filter((a) => a.level === 'Clear');

  // Filtered list of areas for display
  const displayedAreas = areaAlertData.filter((a) => {
    if (selectedAlertLevel === 'ALL') return true;
    if (selectedAlertLevel === 'HIGH') return a.level === 'High';
    if (selectedAlertLevel === 'MEDIUM') return a.level === 'Medium';
    if (selectedAlertLevel === 'LOW') return a.level === 'Low';
    if (selectedAlertLevel === 'CLEAR') return a.level === 'Clear';
    return true;
  });

  // Filtered Users for Logger Table
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
      u.id.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
      u.phone.includes(userSearchQuery);
    const matchesArea = userAreaFilter === 'ALL' || u.area === userAreaFilter;
    return matchesSearch && matchesArea;
  });

  // Filtered Employees / Collectors
  const filteredCollectors = collectors.filter((col) => {
    return (
      col.name.toLowerCase().includes(collectorSearchQuery.toLowerCase()) ||
      col.id.toLowerCase().includes(collectorSearchQuery.toLowerCase()) ||
      col.assignedArea.toLowerCase().includes(collectorSearchQuery.toLowerCase()) ||
      col.phone.includes(collectorSearchQuery)
    );
  });

  // Export Users Logger as CSV
  const handleExportUsersCSV = () => {
    const headers = ['User ID', 'Name', 'Age', 'Gender', 'Area', 'Email', 'Phone', 'Complaints Filed', 'Badge Tier'];
    const rows = filteredUsers.map((u) => {
      const badge =
        u.complaintsCount >= 100
          ? 'Gold'
          : u.complaintsCount >= 50
          ? 'Silver'
          : u.complaintsCount >= 25
          ? 'Bronze'
          : 'None';
      return [
        `"${u.id}"`,
        `"${u.name}"`,
        u.age,
        `"${u.gender}"`,
        `"${u.area}"`,
        `"${u.email}"`,
        `"${u.phone}"`,
        u.complaintsCount,
        `"${badge}"`,
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ecosort_users_logger_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Admin Header Banner */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 -mt-10 -mr-10 w-64 h-64 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-purple-950/60 border border-purple-400/30 text-xs font-semibold text-purple-200">
              <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
              Central Municipal Administration • {admin.id}
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Municipal Command & Control
            </h1>
            <p className="text-sm text-purple-200">
              Logged in as Administrator <strong>{admin.name}</strong> ({admin.email})
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="px-3.5 py-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-white flex items-center gap-2">
              <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
              Live City Sensor & Dispatch Stream Active
            </div>
          </div>
        </div>
      </div>

      {/* Primary Navigation Tabs */}
      <div className="flex border-b border-slate-200 bg-white rounded-xl shadow-xs p-1.5 overflow-x-auto gap-1">
        {[
          { id: 'dashboard', label: '1. Dashboard', icon: TrendingUp, desc: 'City Overview' },
          { id: 'alerts', label: '2. Waste Area Alert', icon: AlertOctagon, desc: '4-Color Interactive Map' },
          { id: 'logers', label: '3. Loger (Users)', icon: Users, desc: 'Citizens Table' },
          { id: 'employees', label: '4. Employees', icon: Truck, desc: 'Collectors Table' },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 min-w-[150px] px-3 py-2.5 rounded-lg text-xs font-semibold transition flex flex-col items-center justify-center gap-1 cursor-pointer ${
                isActive
                  ? 'bg-purple-700 text-white shadow-xs font-bold'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <span>{tab.label}</span>
              </div>
              <span className={`text-[10px] ${isActive ? 'text-purple-200' : 'text-slate-400'}`}>
                {tab.desc}
              </span>
            </button>
          );
        })}
      </div>

      {/* =========================================================================
          TAB 1: DASHBOARD
          "Dashboard (shows total numbers of = Users, Complains, Collector, Resolve complains)"
          ========================================================================= */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Exact Required 4 Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. Total Users */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs relative overflow-hidden">
              <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
                <span>Total Users</span>
                <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                  <Users className="w-5 h-5" />
                </div>
              </div>
              <div className="text-3xl font-black text-slate-900 mt-2">{totalUsers}</div>
              <p className="text-xs text-slate-500 mt-1">Registered Citizen Accounts</p>
              <div className="mt-3 text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                <span>Active citizen reporters in {MUNICIPAL_AREAS.length} wards</span>
              </div>
            </div>

            {/* 2. Total Complains */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs relative overflow-hidden">
              <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
                <span>Total Complains</span>
                <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
                  <FileText className="w-5 h-5" />
                </div>
              </div>
              <div className="text-3xl font-black text-slate-900 mt-2">{totalComplaints}</div>
              <p className="text-xs text-slate-500 mt-1">Logged Public Waste Reports</p>
              <div className="mt-3 text-[11px] text-amber-700 font-semibold flex items-center gap-1">
                <span>Strict 48-Hour Resolution SLA</span>
              </div>
            </div>

            {/* 3. Total Collector */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs relative overflow-hidden">
              <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
                <span>Total Collector</span>
                <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                  <Truck className="w-5 h-5" />
                </div>
              </div>
              <div className="text-3xl font-black text-slate-900 mt-2">{totalCollectors}</div>
              <p className="text-xs text-slate-500 mt-1">Active Waste Collectors On Duty</p>
              <div className="mt-3 text-[11px] text-blue-700 font-semibold flex items-center gap-1">
                <span>Earn daily digital coin rewards</span>
              </div>
            </div>

            {/* 4. Total Resolve Complains */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs relative overflow-hidden">
              <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
                <span>Resolve Complains</span>
                <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              </div>
              <div className="text-3xl font-black text-purple-700 mt-2">
                {totalResolvedComplaints}
              </div>
              <p className="text-xs text-slate-500 mt-1">Task Completed with Proof Photo</p>
              <div className="mt-3 text-[11px] text-purple-700 font-semibold flex items-center gap-1">
                <span>
                  {Math.round((totalResolvedComplaints / (totalComplaints || 1)) * 100)}% City Clearance Rate
                </span>
              </div>
            </div>
          </div>

          {/* Quick Summary of Ward Alert Levels */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <AlertOctagon className="w-5 h-5 text-purple-600" />
                  Live Municipal Ward Alert Snapshot
                </h3>
                <p className="text-xs text-slate-500">
                  Color-coded sanitation alert levels based on real citizen complaints.
                </p>
              </div>

              <button
                onClick={() => setActiveTab('alerts')}
                className="text-xs font-bold text-purple-700 hover:text-purple-900 flex items-center gap-1"
              >
                Open Waste Area Alert Tab →
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-xl border border-rose-200 bg-rose-50 text-rose-950">
                <div className="text-[11px] uppercase font-bold text-rose-700">🔴 High Alert (Red)</div>
                <div className="text-2xl font-black mt-1">{highAlertAreas.length} Wards</div>
                <div className="text-[11px] text-rose-800">≥ 3 active complaints</div>
              </div>

              <div className="p-3.5 rounded-xl border border-orange-200 bg-orange-50 text-orange-950">
                <div className="text-[11px] uppercase font-bold text-orange-700">🟠 Medium Alert (Orange)</div>
                <div className="text-2xl font-black mt-1">{mediumAlertAreas.length} Wards</div>
                <div className="text-[11px] text-orange-800">2 active complaints</div>
              </div>

              <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50 text-amber-950">
                <div className="text-[11px] uppercase font-bold text-amber-700">🟡 Low Alert (Yellow)</div>
                <div className="text-2xl font-black mt-1">{lowAlertAreas.length} Wards</div>
                <div className="text-[11px] text-amber-800">1 active complaint</div>
              </div>

              <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-950">
                <div className="text-[11px] uppercase font-bold text-emerald-700">🟢 Clear (Green)</div>
                <div className="text-2xl font-black mt-1">{clearAlertAreas.length} Wards</div>
                <div className="text-[11px] text-emerald-800">0 active complaints</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: WASTE AREA ALERT
          "Waste area alert(show the alter on basis of filed complain by users divided
           into 4 category based on color (High : red, Medium : orange, Low : Yellow, Clear Green)
           color buttons should be interactable which shows the name of areas based on complain reported by user)"
          ========================================================================= */}
      {activeTab === 'alerts' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <AlertOctagon className="w-5 h-5 text-purple-600" />
                Waste Area Alert System (4 Color Categories)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Areas categorized by filed complaints. Click the interactable color buttons below to inspect specific wards.
              </p>
            </div>

            {/* Interactable Color Buttons Required by User:
                "color buttons should be interactable which shows the name of areas based on complain reported by user" */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block">
                Select Alert Color Filter (Interactable Buttons):
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                {/* 1. High: Red */}
                <button
                  type="button"
                  onClick={() => setSelectedAlertLevel('HIGH')}
                  className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center justify-center text-center cursor-pointer ${
                    selectedAlertLevel === 'HIGH'
                      ? 'bg-rose-600 text-white border-rose-700 shadow-md ring-2 ring-rose-400'
                      : 'bg-rose-50 text-rose-900 border-rose-300 hover:bg-rose-100'
                  }`}
                >
                  <span className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-rose-500 border border-white shrink-0" />
                    High (Red)
                  </span>
                  <span className="text-xs font-semibold mt-1">
                    {highAlertAreas.length} {highAlertAreas.length === 1 ? 'Area' : 'Areas'}
                  </span>
                  <span className={`text-[10px] ${selectedAlertLevel === 'HIGH' ? 'text-rose-100' : 'text-rose-700'}`}>
                    ≥3 Complaints
                  </span>
                </button>

                {/* 2. Medium: Orange */}
                <button
                  type="button"
                  onClick={() => setSelectedAlertLevel('MEDIUM')}
                  className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center justify-center text-center cursor-pointer ${
                    selectedAlertLevel === 'MEDIUM'
                      ? 'bg-orange-500 text-white border-orange-600 shadow-md ring-2 ring-orange-300'
                      : 'bg-orange-50 text-orange-900 border-orange-300 hover:bg-orange-100'
                  }`}
                >
                  <span className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-orange-400 border border-white shrink-0" />
                    Medium (Orange)
                  </span>
                  <span className="text-xs font-semibold mt-1">
                    {mediumAlertAreas.length} {mediumAlertAreas.length === 1 ? 'Area' : 'Areas'}
                  </span>
                  <span className={`text-[10px] ${selectedAlertLevel === 'MEDIUM' ? 'text-orange-100' : 'text-orange-700'}`}>
                    2 Complaints
                  </span>
                </button>

                {/* 3. Low: Yellow */}
                <button
                  type="button"
                  onClick={() => setSelectedAlertLevel('LOW')}
                  className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center justify-center text-center cursor-pointer ${
                    selectedAlertLevel === 'LOW'
                      ? 'bg-amber-500 text-white border-amber-600 shadow-md ring-2 ring-amber-300'
                      : 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100'
                  }`}
                >
                  <span className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-yellow-400 border border-white shrink-0" />
                    Low (Yellow)
                  </span>
                  <span className="text-xs font-semibold mt-1">
                    {lowAlertAreas.length} {lowAlertAreas.length === 1 ? 'Area' : 'Areas'}
                  </span>
                  <span className={`text-[10px] ${selectedAlertLevel === 'LOW' ? 'text-amber-100' : 'text-amber-800'}`}>
                    1 Complaint
                  </span>
                </button>

                {/* 4. Clear: Green */}
                <button
                  type="button"
                  onClick={() => setSelectedAlertLevel('CLEAR')}
                  className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center justify-center text-center cursor-pointer ${
                    selectedAlertLevel === 'CLEAR'
                      ? 'bg-emerald-600 text-white border-emerald-700 shadow-md ring-2 ring-emerald-300'
                      : 'bg-emerald-50 text-emerald-900 border-emerald-300 hover:bg-emerald-100'
                  }`}
                >
                  <span className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-emerald-500 border border-white shrink-0" />
                    Clear (Green)
                  </span>
                  <span className="text-xs font-semibold mt-1">
                    {clearAlertAreas.length} {clearAlertAreas.length === 1 ? 'Area' : 'Areas'}
                  </span>
                  <span className={`text-[10px] ${selectedAlertLevel === 'CLEAR' ? 'text-emerald-100' : 'text-emerald-800'}`}>
                    0 Complaints
                  </span>
                </button>

                {/* View All Areas */}
                <button
                  type="button"
                  onClick={() => setSelectedAlertLevel('ALL')}
                  className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center justify-center text-center cursor-pointer ${
                    selectedAlertLevel === 'ALL'
                      ? 'bg-slate-900 text-white border-slate-950 shadow-md'
                      : 'bg-slate-100 text-slate-800 border-slate-200 hover:bg-slate-200'
                  }`}
                >
                  <span className="text-xs font-bold uppercase tracking-wider">Show All Zones</span>
                  <span className="text-xs font-semibold mt-1">{areaAlertData.length} Wards</span>
                  <span className={`text-[10px] ${selectedAlertLevel === 'ALL' ? 'text-slate-300' : 'text-slate-500'}`}>
                    Entire Municipality
                  </span>
                </button>
              </div>
            </div>

            {/* List of Areas Displayed based on Selected Color Button */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900">
                  {selectedAlertLevel === 'ALL'
                    ? `Showing All Municipal Wards (${displayedAreas.length})`
                    : `Showing Areas with ${selectedAlertLevel} Alert (${displayedAreas.length})`}
                </h3>
                <span className="text-xs text-slate-500">
                  Ranked by live citizen complaints
                </span>
              </div>

              {displayedAreas.length === 0 ? (
                <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-xl">
                  No areas found under the <strong>{selectedAlertLevel}</strong> alert category.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {displayedAreas.map((area) => (
                    <div
                      key={area.name}
                      className="p-5 rounded-2xl border bg-white shadow-xs space-y-4 transition hover:shadow-md"
                      style={{ borderLeftWidth: '6px', borderLeftColor: area.colorHex }}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-base font-bold text-slate-900">{area.name}</h4>
                            <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold border ${area.badgeBg}`}>
                              {area.level} Alert
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {area.activeCount} active dumping complaints currently reported by users
                          </p>
                        </div>

                        <div className="text-right">
                          <span
                            className="w-4 h-4 rounded-full inline-block shadow-xs"
                            style={{ backgroundColor: area.colorHex }}
                          />
                        </div>
                      </div>

                      {/* Assigned Collectors for this area */}
                      <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                        <div className="font-bold text-slate-700 flex items-center gap-1.5 mb-1">
                          <Truck className="w-3.5 h-3.5 text-blue-600" />
                          Assigned Waste Collector Personnel:
                        </div>
                        {area.assignedCollectors.length === 0 ? (
                          <div className="text-slate-400 text-[11px]">
                            ⚠️ No permanent collector assigned yet. Roving truck dispatched on alert.
                          </div>
                        ) : (
                          <div className="space-y-1">
                            {area.assignedCollectors.map((col) => (
                              <div key={col.id} className="flex justify-between items-center text-slate-800">
                                <span>{col.name} ({col.id})</span>
                                <a href={`tel:${col.phone}`} className="text-blue-600 hover:underline font-mono text-[11px]">
                                  {col.phone}
                                </a>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Recent User Complaints in this area */}
                      <div>
                        <div className="text-[11px] font-bold text-slate-500 mb-1.5 flex items-center justify-between">
                          <span>Reported User Complains in this Area ({area.complaints.length}):</span>
                        </div>

                        {area.complaints.length === 0 ? (
                          <div className="text-[11px] text-emerald-700 font-semibold bg-emerald-50 p-2 rounded">
                            ✓ No complaints on record. Area is clean and clear.
                          </div>
                        ) : (
                          <div className="space-y-1.5 max-h-36 overflow-y-auto">
                            {area.complaints.map((comp) => (
                              <div
                                key={comp.id}
                                className="p-2 bg-slate-50 rounded-lg text-xs flex items-center justify-between gap-2 border border-slate-100"
                              >
                                <div className="truncate">
                                  <span className="font-mono font-bold text-[10px] text-slate-700 bg-white px-1.5 py-0.5 rounded border border-slate-200 mr-1.5">
                                    {comp.id}
                                  </span>
                                  <span className="font-semibold text-slate-800">{comp.landmark}: </span>
                                  <span className="text-slate-500">{comp.description}</span>
                                </div>
                                <span
                                  className={`text-[10px] px-2 py-0.5 rounded font-bold shrink-0 ${
                                    comp.status === 'Resolved' || comp.status === 'Task Completed'
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : 'bg-amber-100 text-amber-800'
                                  }`}
                                >
                                  {comp.status}
                                </span>
                              </div>
                            ))}
                          </div>
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

      {/* =========================================================================
          TAB 3: LOGER (Users table with ID and details)
          "Loger (users I'd and details in form of table)"
          ========================================================================= */}
      {activeTab === 'logers' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Users className="w-5 h-5 text-purple-600" />
                  Citizens Logger Table ({filteredUsers.length} Users)
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Complete directory of registered citizen accounts, unique user IDs, and filed complaint activity.
                </p>
              </div>

              <button
                type="button"
                onClick={handleExportUsersCSV}
                className="px-4 py-2 bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer"
              >
                <Download className="w-4 h-4" /> Export Users CSV
              </button>
            </div>

            {/* Filter & Search Bar */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by User ID, Name, Phone, or Email..."
                  value={userSearchQuery}
                  onChange={(e) => setUserSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white outline-none"
                />
              </div>

              <select
                value={userAreaFilter}
                onChange={(e) => setUserAreaFilter(e.target.value)}
                className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none"
              >
                <option value="ALL">All Residential Wards</option>
                {MUNICIPAL_AREAS.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>

            {/* Users Table */}
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3 px-4">User Unique ID</th>
                    <th className="py-3 px-4">Name</th>
                    <th className="py-3 px-4">Age / Gender</th>
                    <th className="py-3 px-4">Residential Area</th>
                    <th className="py-3 px-4">E-mail ID</th>
                    <th className="py-3 px-4">Phone Number</th>
                    <th className="py-3 px-4 text-center">Complains Filed</th>
                    <th className="py-3 px-4 text-center">Reward Tier Badge</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-400">
                        No users found matching query.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => {
                      const badgeLabel =
                        u.complaintsCount >= 100
                          ? '🥇 Gold'
                          : u.complaintsCount >= 50
                          ? '🥈 Silver'
                          : u.complaintsCount >= 25
                          ? '🥉 Bronze'
                          : 'Scout';

                      const badgeStyle =
                        u.complaintsCount >= 100
                          ? 'bg-yellow-100 text-yellow-900 border-yellow-300'
                          : u.complaintsCount >= 50
                          ? 'bg-slate-200 text-slate-800 border-slate-300'
                          : u.complaintsCount >= 25
                          ? 'bg-amber-100 text-amber-900 border-amber-300'
                          : 'bg-slate-100 text-slate-600 border-slate-200';

                      return (
                        <tr key={u.id} className="hover:bg-slate-50/80 transition">
                          <td className="py-3 px-4 font-mono font-bold text-purple-700">{u.id}</td>
                          <td className="py-3 px-4 font-bold text-slate-900">{u.name}</td>
                          <td className="py-3 px-4 text-slate-600">
                            {u.age} yrs • {u.gender}
                          </td>
                          <td className="py-3 px-4 font-medium text-slate-800">{u.area}</td>
                          <td className="py-3 px-4 text-slate-600 font-mono text-[11px]">{u.email}</td>
                          <td className="py-3 px-4 text-slate-600 font-mono">{u.phone}</td>
                          <td className="py-3 px-4 text-center font-black text-slate-900">
                            {u.complaintsCount}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${badgeStyle}`}>
                              {badgeLabel}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 4: EMPLOYEES (Collectors table)
          "Employees( collector details in form of table)"
          ========================================================================= */}
      {activeTab === 'employees' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Truck className="w-5 h-5 text-purple-600" />
                  Municipal Waste Collector Employees ({filteredCollectors.length})
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Official municipal collector workforce roster with operational area assignments and daily progress metrics.
                </p>
              </div>

              <div className="text-xs text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
                Total Fleet: <strong>{collectors.length} active collectors</strong>
              </div>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search by Collector ID, Name, Phone, or Assigned Area..."
                value={collectorSearchQuery}
                onChange={(e) => setCollectorSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white outline-none"
              />
            </div>

            {/* Collectors Table */}
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Collector Unique ID</th>
                    <th className="py-3 px-4">Name</th>
                    <th className="py-3 px-4">Gender</th>
                    <th className="py-3 px-4">Phone Number</th>
                    <th className="py-3 px-4">Email ID</th>
                    <th className="py-3 px-4">Name of Area Assigned</th>
                    <th className="py-3 px-4 text-center">Daily Clearance Target</th>
                    <th className="py-3 px-4 text-center">Digital Coins Earned</th>
                    <th className="py-3 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredCollectors.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-8 text-center text-slate-400">
                        No collectors found matching query.
                      </td>
                    </tr>
                  ) : (
                    filteredCollectors.map((col) => {
                      const percent = Math.min(
                        100,
                        Math.round((col.dailyResolvedCount / (col.dailyTargetTotal || 5)) * 100)
                      );
                      const isTargetMet = percent >= 70;

                      return (
                        <tr key={col.id} className="hover:bg-slate-50/80 transition">
                          <td className="py-3 px-4 font-mono font-bold text-blue-700">{col.id}</td>
                          <td className="py-3 px-4 font-bold text-slate-900">{col.name}</td>
                          <td className="py-3 px-4 text-slate-600">{col.gender}</td>
                          <td className="py-3 px-4 text-slate-600 font-mono">{col.phone}</td>
                          <td className="py-3 px-4 text-slate-600 font-mono text-[11px]">{col.email}</td>
                          <td className="py-3 px-4 font-semibold text-slate-800">
                            <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-800 border border-blue-200">
                              {col.assignedArea}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <div className="font-bold text-slate-900">
                              {col.dailyResolvedCount} / {col.dailyTargetTotal} ({percent}%)
                            </div>
                            <span
                              className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                                isTargetMet ? 'text-emerald-700' : 'text-amber-700'
                              }`}
                            >
                              {isTargetMet ? '✓ ≥70% met' : 'in progress'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className="font-black text-amber-700 flex items-center justify-center gap-1">
                              🪙 {col.coins}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                              On Duty
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
