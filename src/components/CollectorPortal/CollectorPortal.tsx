import React, { useState } from 'react';
import { WasteCollectorAccount, Complaint } from '../../types';
import {
  Truck,
  CheckCircle2,
  Clock,
  User,
  MapPin,
  AlertCircle,
  Coins,
  Upload,
  Camera,
  ArrowRight,
  TrendingUp,
  Award,
  DollarSign,
  Phone,
  Mail,
  ShieldCheck,
  Check,
  Calendar,
  Image as ImageIcon
} from 'lucide-react';

interface CollectorPortalProps {
  collector: WasteCollectorAccount;
  allComplaints: Complaint[];
  onStartComplaint: (complaintId: string) => void;
  onResolveComplaint: (complaintId: string, proofPicture: string, notes: string) => void;
  onConvertCoinsToCash: (amountCoins: number, cashAmount: number) => void;
}

export const CollectorPortal: React.FC<CollectorPortalProps> = ({
  collector,
  allComplaints,
  onStartComplaint,
  onResolveComplaint,
  onConvertCoinsToCash,
}) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'progress' | 'profile'>('dashboard');

  // Resolution modal state
  const [resolvingComplaint, setResolvingComplaint] = useState<Complaint | null>(null);
  const [proofPictureUrl, setProofPictureUrl] = useState<string>('');
  const [resolutionNotes, setResolutionNotes] = useState<string>('');
  const [isSubmittingResolution, setIsSubmittingResolution] = useState(false);

  // Cash Conversion Modal State
  const [isConvertModalOpen, setIsConvertModalOpen] = useState(false);
  const [convertCoinAmount, setConvertCoinAmount] = useState(collector.coins);
  const [cashoutSuccessMessage, setCashoutSuccessMessage] = useState<string | null>(null);

  // Filter complaints for this collector's assigned area or directly assigned
  const collectorComplaints = allComplaints.filter(
    (c) => c.collectorId === collector.id || c.area === collector.assignedArea
  );

  const pendingComplaints = collectorComplaints.filter((c) => c.status === 'Pending');
  const inProgressComplaints = collectorComplaints.filter((c) => c.status === 'In Progress');
  const completedComplaints = collectorComplaints.filter(
    (c) => c.status === 'Task Completed' || c.status === 'Resolved'
  );

  // Calculate Progress percentage based on daily target
  const dailyTarget = collector.dailyTargetTotal || 5;
  const dailyResolved = collector.dailyResolvedCount || completedComplaints.length;
  const progressPercent = Math.min(100, Math.round((dailyResolved / dailyTarget) * 100));
  const isTargetMet = progressPercent >= 70; // 70% threshold required to award digital coin

  // Sample clean verification photos for realistic one-click proof upload
  const sampleCleanPhotos = [
    {
      title: 'Cleaned Sidewalk & Curb',
      url: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=600&q=80',
    },
    {
      title: 'Cleared Bin Enclosure',
      url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80',
    },
    {
      title: 'Sanitized Park Periphery',
      url: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=600&q=80',
    },
  ];

  const handleProofUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProofPictureUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleConfirmResolve = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolvingComplaint) return;
    if (!proofPictureUrl) {
      alert('Proof picture of the cleared place is required before completing the task.');
      return;
    }

    setIsSubmittingResolution(true);
    setTimeout(() => {
      onResolveComplaint(
        resolvingComplaint.id,
        proofPictureUrl,
        resolutionNotes || 'Waste cleared and carted away to processing transfer center.'
      );
      setIsSubmittingResolution(false);
      setResolvingComplaint(null);
      setProofPictureUrl('');
      setResolutionNotes('');
    }, 400);
  };

  const handleCashoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cashValue = convertCoinAmount * 100; // 1 coin = ₹100 / $10 eq
    onConvertCoinsToCash(convertCoinAmount, cashValue);
    setCashoutSuccessMessage(`Transferred ₹${cashValue} ($${cashValue / 10}) to your registered collector bank account!`);
    setTimeout(() => {
      setIsConvertModalOpen(false);
      setCashoutSuccessMessage(null);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      {/* Collector Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 -mt-10 -mr-10 w-64 h-64 bg-blue-600/30 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-blue-950/60 border border-blue-400/30 text-xs font-semibold text-blue-200">
              <Truck className="w-3.5 h-3.5 text-blue-400" />
              Assigned Field Staff • {collector.id}
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              {collector.name}
            </h1>
            <p className="text-sm text-blue-100 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-300 shrink-0" />
              <span>Assigned Ward: <strong>{collector.assignedArea}</strong></span>
              <span className="opacity-60">•</span>
              <span>Daily Target: {dailyResolved}/{dailyTarget} Tasks ({progressPercent}%)</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Coins Indicator */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 rounded-xl flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-400/20 text-amber-300">
                <Coins className="w-6 h-6" />
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-blue-200 font-semibold">Digital Coins</div>
                <div className="text-base font-black text-amber-300 flex items-center gap-1">
                  🪙 {collector.coins} Coins
                </div>
              </div>
            </div>

            <button
              onClick={() => setActiveTab('progress')}
              className="bg-blue-500 hover:bg-blue-400 text-slate-950 font-bold px-4 py-2.5 rounded-xl shadow-md transition flex items-center gap-2 text-sm cursor-pointer"
            >
              <TrendingUp className="w-4 h-4" />
              View Action Queue
            </button>
          </div>
        </div>
      </div>

      {/* Primary Navigation Tabs */}
      <div className="flex border-b border-slate-200 bg-white rounded-xl shadow-xs p-1.5 overflow-x-auto gap-1">
        {[
          { id: 'dashboard', label: '1. Dashboard', icon: Truck, desc: 'Pending & Resolved' },
          { id: 'progress', label: '2. Personal Progress', icon: TrendingUp, desc: 'Resolve & Verification Proof' },
          { id: 'profile', label: '3. Profile & Rewards', icon: User, desc: '70% Goal & Cash Payout' },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 min-w-[150px] px-3 py-2.5 rounded-lg text-xs font-semibold transition flex flex-col items-center justify-center gap-1 cursor-pointer ${
                isActive
                  ? 'bg-blue-600 text-white shadow-xs font-bold'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <span>{tab.label}</span>
              </div>
              <span className={`text-[10px] ${isActive ? 'text-blue-100' : 'text-slate-400'}`}>
                {tab.desc}
              </span>
            </button>
          );
        })}
      </div>

      {/* =========================================================================
          TAB 1: DASHBOARD (Shows pending and completed/resolve complain)
          ========================================================================= */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Workload Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
                <span>Total Assigned</span>
                <Truck className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-3xl font-black text-slate-900 mt-2">
                {collectorComplaints.length}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Complaints within {collector.assignedArea}
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-amber-200 bg-amber-50/40 p-5 shadow-xs">
              <div className="flex items-center justify-between text-amber-700 text-xs font-bold">
                <span>Pending Action</span>
                <Clock className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-3xl font-black text-amber-700 mt-2">
                {pendingComplaints.length}
              </div>
              <p className="text-[11px] text-amber-800 mt-1">
                Requires pickup within 48h SLA
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-blue-200 bg-blue-50/40 p-5 shadow-xs">
              <div className="flex items-center justify-between text-blue-700 text-xs font-bold">
                <span>In Progress</span>
                <TrendingUp className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-3xl font-black text-blue-700 mt-2">
                {inProgressComplaints.length}
              </div>
              <p className="text-[11px] text-blue-800 mt-1">
                Currently dispatched on route
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-emerald-200 bg-emerald-50/40 p-5 shadow-xs">
              <div className="flex items-center justify-between text-emerald-700 text-xs font-bold">
                <span>Completed / Resolved</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-3xl font-black text-emerald-700 mt-2">
                {completedComplaints.length}
              </div>
              <p className="text-[11px] text-emerald-800 mt-1">
                Verified with clearance photographs
              </p>
            </div>
          </div>

          {/* Quick Action Queue Banner */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-amber-500" />
                  Urgent Pending Complains Awaiting Action ({pendingComplaints.length})
                </h3>
                <p className="text-xs text-slate-500">Respond and clear complaints to boost your daily 70% progress bar.</p>
              </div>

              <button
                onClick={() => setActiveTab('progress')}
                className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                Go to Personal Progress →
              </button>
            </div>

            {pendingComplaints.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                <p className="text-sm font-bold text-slate-700">All caught up!</p>
                <p className="text-xs text-slate-500">No pending unassigned complaints in {collector.assignedArea}.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 mt-2">
                {pendingComplaints.map((c) => (
                  <div key={c.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                      {c.pictureUrl && (
                        <img
                          src={c.pictureUrl}
                          alt="site"
                          className="w-14 h-14 rounded-lg object-cover border border-slate-200 shrink-0"
                        />
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                            {c.id}
                          </span>
                          <span className="text-xs font-bold text-slate-800">{c.landmark}</span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1 line-clamp-1">{c.description}</p>
                        <div className="text-[11px] text-slate-400 mt-1">
                          Reported by: {c.userName} ({c.userPhone})
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => onStartComplaint(c.id)}
                        className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold hover:bg-blue-100 transition"
                      >
                        Start Task
                      </button>
                      <button
                        onClick={() => {
                          setResolvingComplaint(c);
                          setActiveTab('progress');
                        }}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition"
                      >
                        Resolve & Upload Photo
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: PERSONAL PROGRESS
          (Shows complains that can be viewed by collector & able to see details.
           After resolving, collector uploads photo of place to verify, and progress bar goes up)
          ========================================================================= */}
      {activeTab === 'progress' && (
        <div className="space-y-6">
          {/* Daily Progress Bar Tracker */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  Daily Clearance Progress Meter
                </h3>
                <p className="text-xs text-slate-500">
                  Target: <strong>{dailyTarget} tasks/day</strong>. Reach <strong>70%</strong> progress bar to earn +1 Digital Coin today!
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`text-xs px-3 py-1 rounded-full font-bold ${
                    isTargetMet
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-amber-100 text-amber-800 border border-amber-300'
                  }`}
                >
                  {isTargetMet ? '✓ 70% Daily Goal Met (+1 Coin Earned)' : `${70 - progressPercent}% needed for Daily Coin`}
                </span>
              </div>
            </div>

            {/* Dynamic Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold text-slate-700">
                <span>Daily Cleared: {dailyResolved} of {dailyTarget} Complaints</span>
                <span className="text-blue-600">{progressPercent}%</span>
              </div>

              <div className="w-full bg-slate-200 h-3.5 rounded-full overflow-hidden relative">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    progressPercent >= 70 ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : 'bg-blue-600'
                  }`}
                  style={{ width: `${progressPercent}%` }}
                />
                {/* 70% Marker Line */}
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-slate-900/60 z-10"
                  style={{ left: '70%' }}
                  title="70% Reward Threshold"
                />
              </div>

              <div className="flex justify-between text-[11px] text-slate-400">
                <span>0%</span>
                <span className="text-slate-600 font-bold">▲ 70% Reward Target</span>
                <span>100%</span>
              </div>
            </div>
          </div>

          {/* Complaints List with Verification Photo Upload Action */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Truck className="w-5 h-5 text-blue-600" />
                Assigned Complain Feed ({collectorComplaints.length})
              </h3>
              <p className="text-xs text-slate-500">
                Inspect details, initiate work, and upload place verification photos to complete the resolution.
              </p>
            </div>

            {collectorComplaints.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <p>No complaints currently assigned to this zone.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {collectorComplaints.map((c) => {
                  const isCompleted = c.status === 'Task Completed' || c.status === 'Resolved';
                  return (
                    <div
                      key={c.id}
                      className={`p-5 rounded-2xl border transition-all ${
                        isCompleted
                          ? 'bg-slate-50 border-slate-200'
                          : 'bg-white border-blue-200 shadow-xs'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-slate-100">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                              {c.id}
                            </span>
                            <span
                              className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                                isCompleted
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : c.status === 'In Progress'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {c.status}
                            </span>
                            <span className="text-xs font-bold text-slate-600">
                              {c.area}
                            </span>
                          </div>

                          <h4 className="text-sm font-bold text-slate-900 mt-2">{c.landmark}</h4>
                          <p className="text-xs text-slate-600 mt-0.5">{c.description}</p>
                        </div>

                        {/* Actions */}
                        {!isCompleted && (
                          <div className="flex items-center gap-2 shrink-0">
                            {c.status === 'Pending' && (
                              <button
                                onClick={() => onStartComplaint(c.id)}
                                className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold hover:bg-blue-100 transition"
                              >
                                Mark In Progress
                              </button>
                            )}

                            <button
                              onClick={() => setResolvingComplaint(c)}
                              className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                            >
                              <Camera className="w-3.5 h-3.5" />
                              Resolve & Upload Proof
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Citizen & Location Metadata */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 py-3 text-xs text-slate-600 bg-slate-50/80 p-2.5 rounded-xl mt-3">
                        <div>
                          <span className="text-slate-400 block text-[11px]">Complainant:</span>
                          <span className="font-semibold text-slate-800">{c.userName}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[11px]">Citizen Contact:</span>
                          <a href={`tel:${c.userPhone}`} className="font-semibold text-blue-600 hover:underline">
                            {c.userPhone}
                          </a>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[11px]">Reported:</span>
                          <span className="text-slate-800">{new Date(c.filedAt).toLocaleString()}</span>
                        </div>
                      </div>

                      {/* Photo verification view */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                        <div>
                          <div className="text-[11px] font-bold text-slate-500 mb-1">Citizen's Waste Report Photo:</div>
                          {c.pictureUrl ? (
                            <img
                              src={c.pictureUrl}
                              alt="Citizen's photo"
                              className="w-full h-36 object-cover rounded-lg border border-slate-200"
                            />
                          ) : (
                            <div className="w-full h-36 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 text-xs">
                              No photo attached
                            </div>
                          )}
                        </div>

                        <div>
                          <div className="text-[11px] font-bold text-slate-500 mb-1">
                            Collector Verification Photo (Proof of Cleanup):
                          </div>
                          {c.collectorProofPicture ? (
                            <div className="relative">
                              <img
                                src={c.collectorProofPicture}
                                alt="Cleaned site proof"
                                className="w-full h-36 object-cover rounded-lg border-2 border-emerald-500"
                              />
                              <div className="absolute top-2 right-2 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow">
                                Verified Cleaned ✓
                              </div>
                            </div>
                          ) : (
                            <div className="w-full h-36 bg-slate-50 border border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center text-slate-400 text-xs p-3 text-center">
                              <Camera className="w-6 h-6 text-slate-300 mb-1" />
                              <span>Place verification photo required to resolve</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: PROFILE & REWARDS
          (Shows collector details, reward section that increments by one on daily basis
           after completing 70% progress bar daily, then end of month digital coins converted to cash)
          ========================================================================= */}
      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Collector Details Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600" />
                Waste Collector Details
              </h3>
              <p className="text-xs text-slate-500">Official Municipal Sanitation ID</p>
            </div>

            <div className="p-3 bg-blue-50 rounded-xl border border-blue-200">
              <div className="text-[10px] font-bold uppercase tracking-wider text-blue-800">
                Collector Unique Identification
              </div>
              <div className="text-lg font-mono font-black text-blue-950">{collector.id}</div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">Full Name</span>
                <span className="font-semibold text-slate-900 text-sm">{collector.name}</span>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px]">Gender</span>
                <span className="font-semibold text-slate-900">{collector.gender}</span>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px]">Assigned Ward / Operational Area</span>
                <span className="font-semibold text-slate-900">{collector.assignedArea}</span>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px]">Email ID</span>
                <span className="font-semibold text-slate-900">{collector.email}</span>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px]">Phone Number</span>
                <span className="font-semibold text-slate-900">{collector.phone}</span>
              </div>
            </div>
          </div>

          {/* Reward & Digital Coins to Cash Section */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
            <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Coins className="w-5 h-5 text-amber-500" />
                  Collector Daily Rewards & Coin-to-Cash Program
                </h3>
                <p className="text-xs text-slate-500">
                  Earn +1 Digital Coin every day by achieving ≥ 70% daily progress bar. Cash out at end of month!
                </p>
              </div>

              <div className="bg-amber-50 border border-amber-200 px-4 py-2 rounded-xl flex items-center gap-3">
                <div className="text-right">
                  <div className="text-[10px] uppercase font-bold text-amber-700">Digital Coin Wallet</div>
                  <div className="text-xl font-black text-amber-900">{collector.coins} Coins</div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                  🪙
                </div>
              </div>
            </div>

            {/* Daily Rule Explanation Box */}
            <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 text-xs text-blue-900 space-y-2">
              <div className="font-bold flex items-center gap-1.5 text-sm">
                <Award className="w-4 h-4 text-blue-700" />
                Municipal Rule: Daily Progress Increment
              </div>
              <p className="leading-relaxed">
                When you clear at least <strong>70% of your daily assigned complaints</strong> with photo verification, your account increments by <strong>+1 Digital Coin on a daily basis</strong>.
              </p>
              <div className="flex items-center gap-2 pt-1 font-semibold text-blue-800">
                <span>Today's Status:</span>
                <span
                  className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                    isTargetMet ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {isTargetMet ? '✓ 70% Milestone Met (Coin Incremented)' : `Current: ${progressPercent}% (Need 70%)`}
                </span>
              </div>
            </div>

            {/* End of Month Cash Conversion Card */}
            <div className="p-5 rounded-2xl border-2 border-emerald-300 bg-emerald-50/50 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-center md:text-left">
                <div className="text-xs uppercase font-bold tracking-wider text-emerald-800">
                  End of Month Digital Coins Cashout
                </div>
                <h4 className="text-lg font-bold text-slate-900">
                  Convert Accumulated Coins into Direct Cash
                </h4>
                <p className="text-xs text-slate-600">
                  1 Digital Coin = <strong>₹100 (approx. $10)</strong> municipal performance bonus.
                  Your current balance of <strong>{collector.coins} coins</strong> is worth <strong>₹{collector.coins * 100}</strong>.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setConvertCoinAmount(collector.coins);
                  setIsConvertModalOpen(true);
                }}
                disabled={collector.coins <= 0}
                className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition flex items-center gap-2 shrink-0 disabled:opacity-50 cursor-pointer"
              >
                <DollarSign className="w-4 h-4" />
                Convert Coins to Cash
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: UPLOAD PICTURE OF PLACE TO BE VERIFIED & RESOLVE
          ========================================================================= */}
      {resolvingComplaint && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-emerald-50">
              <div>
                <h3 className="text-base font-bold text-emerald-950 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  Resolve Complain: {resolvingComplaint.id}
                </h3>
                <p className="text-xs text-emerald-800">
                  Must upload picture of the cleared place to be verified
                </p>
              </div>
              <button
                type="button"
                onClick={() => setResolvingComplaint(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmResolve} className="p-6 space-y-4">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700">
                <div><strong>Location:</strong> {resolvingComplaint.landmark} ({resolvingComplaint.area})</div>
                <div className="text-slate-500 mt-1"><strong>Issue:</strong> {resolvingComplaint.description}</div>
              </div>

              {/* Upload picture of cleared place */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Upload Verification Picture (Cleaned Site) <span className="text-rose-500">*</span>
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-2">
                  <label className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-xl p-3 flex flex-col items-center justify-center text-center cursor-pointer bg-slate-50 transition">
                    <Upload className="w-5 h-5 text-emerald-600 mb-1" />
                    <span className="text-xs font-bold text-slate-700">Choose Verification Photo</span>
                    <span className="text-[10px] text-slate-400">Camera / Gallery</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleProofUpload}
                      className="hidden"
                    />
                  </label>

                  <div className="border border-slate-200 rounded-xl p-2.5 bg-slate-50 text-[10px]">
                    <div className="font-bold text-slate-600 mb-1.5">Or Choose Clean Site Sample:</div>
                    <div className="space-y-1">
                      {sampleCleanPhotos.map((photo) => (
                        <button
                          key={photo.title}
                          type="button"
                          onClick={() => setProofPictureUrl(photo.url)}
                          className={`w-full text-left p-1 rounded border text-[10px] truncate ${
                            proofPictureUrl === photo.url
                              ? 'bg-emerald-600 text-white font-bold'
                              : 'bg-white text-slate-700 border-slate-200'
                          }`}
                        >
                          {photo.title}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {proofPictureUrl && (
                  <div className="relative rounded-xl overflow-hidden border border-emerald-300 max-h-48 bg-slate-100">
                    <img
                      src={proofPictureUrl}
                      alt="Verification preview"
                      className="w-full h-40 object-cover"
                    />
                    <div className="absolute top-2 right-2 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow">
                      Verification Photo Attached ✓
                    </div>
                  </div>
                )}
              </div>

              {/* Completion Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Sanitation Clearance Notes
                </label>
                <input
                  type="text"
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder="e.g. Swept debris, disinfected curb, transported to transfer yard"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl outline-none"
                />
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setResolvingComplaint(null)}
                  className="w-1/3 py-2 px-3 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingResolution || !proofPictureUrl}
                  className="w-2/3 py-2 px-3 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  {isSubmittingResolution ? 'Saving Clearance...' : 'Verify & Mark Task Completed'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: CONVERT DIGITAL COINS TO CASH
          ========================================================================= */}
      {isConvertModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-amber-50">
              <div className="flex items-center gap-2">
                <Coins className="w-5 h-5 text-amber-600" />
                <h3 className="text-base font-bold text-slate-900">Convert Digital Coins to Cash</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsConvertModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCashoutSubmit} className="p-6 space-y-4">
              {cashoutSuccessMessage ? (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-bold text-center">
                  {cashoutSuccessMessage}
                </div>
              ) : (
                <>
                  <div className="text-xs text-slate-600 leading-relaxed">
                    At the end of the month, municipal waste collectors can convert their earned daily reward coins directly into bank payouts or cash vouchers.
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Available Digital Coins:</span>
                      <strong className="text-amber-800 font-bold">🪙 {collector.coins} Coins</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Conversion Rate:</span>
                      <span className="font-semibold text-slate-800">1 Coin = ₹100 ($10 USD)</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Coins to Convert (Max: {collector.coins})
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={collector.coins}
                      value={convertCoinAmount}
                      onChange={(e) => setConvertCoinAmount(Math.min(collector.coins, Math.max(1, Number(e.target.value))))}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl outline-none"
                    />
                  </div>

                  <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-center">
                    <div className="text-[11px] text-emerald-800 font-semibold uppercase">Total Payout Amount</div>
                    <div className="text-2xl font-black text-emerald-950 mt-1">
                      ₹{convertCoinAmount * 100} <span className="text-xs font-medium text-emerald-700">(${convertCoinAmount * 10})</span>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsConvertModalOpen(false)}
                      className="w-1/3 py-2 px-3 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={convertCoinAmount <= 0 || convertCoinAmount > collector.coins}
                      className="w-2/3 py-2 px-3 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs disabled:opacity-50 cursor-pointer"
                    >
                      Authorize Cash Payout
                    </button>
                  </div>
                </>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
