import React, { useState } from 'react';
import { UserAccount, Complaint, WasteCollectorAccount } from '../../types';
import { MUNICIPAL_AREAS } from '../../data/initialData';
import {
  FileText,
  Award,
  User as UserIcon,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Upload,
  Camera,
  Shield,
  Phone,
  Mail,
  Edit3,
  Calendar,
  ExternalLink,
  Sparkles,
  Info,
  ChevronRight,
  Trash2,
  BellRing
} from 'lucide-react';

interface UserPortalProps {
  user: UserAccount;
  allComplaints: Complaint[];
  collectors: WasteCollectorAccount[];
  onSubmitComplaint: (complaint: Omit<Complaint, 'id' | 'status' | 'filedAt' | 'deadlineAt'>) => void;
  onUpdateProfile: (updated: Partial<UserAccount>) => void;
  onAcknowledgeCompletion: (complaintId: string) => void;
}

export const UserPortal: React.FC<UserPortalProps> = ({
  user,
  allComplaints,
  collectors,
  onSubmitComplaint,
  onUpdateProfile,
  onAcknowledgeCompletion,
}) => {
  const [activeTab, setActiveTab] = useState<'report' | 'rewards' | 'profile' | 'tracking' | 'area'>('report');

  // Report Box Form State
  const [complaintArea, setComplaintArea] = useState<string>(user.area || MUNICIPAL_AREAS[0]);
  const [landmark, setLandmark] = useState('');
  const [description, setDescription] = useState('');
  const [pictureUrl, setPictureUrl] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccessId, setSubmitSuccessId] = useState<string | null>(null);

  // Profile Edit Modal State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState(user.name);
  const [editAge, setEditAge] = useState(user.age);
  const [editArea, setEditArea] = useState(user.area);
  const [editEmail, setEditEmail] = useState(user.email);
  const [editPhone, setEditPhone] = useState(user.phone);
  const [editGender, setEditGender] = useState<'Male' | 'Female' | 'Other'>(user.gender);

  // Filter complaints filed by this user
  const userComplaints = allComplaints.filter((c) => c.userId === user.id);

  // Find notifications: complaints recently marked as "Task Completed"
  const completedNotifications = userComplaints.filter(
    (c) => c.status === 'Task Completed'
  );

  // Sample photo presets for quick reporting
  const samplePhotos = [
    {
      title: 'Overflowing Bins',
      url: 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&w=600&q=80',
    },
    {
      title: 'Scattered Plastic',
      url: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=600&q=80',
    },
    {
      title: 'Vegetable / Food Waste',
      url: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=600&q=80',
    },
    {
      title: 'Industrial Scrap',
      url: 'https://images.unsplash.com/photo-1582408921715-18e7806365c1?auto=format&fit=crop&w=600&q=80',
    },
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPictureUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || !landmark.trim()) return;

    setIsSubmitting(true);

    // Find assigned collector for this area
    const assignedCollector = collectors.find((col) => col.assignedArea === complaintArea);

    setTimeout(() => {
      onSubmitComplaint({
        userId: user.id,
        userName: user.name,
        userPhone: user.phone,
        area: complaintArea,
        landmark: landmark.trim(),
        description: description.trim(),
        pictureUrl: pictureUrl || samplePhotos[0].url,
        collectorId: assignedCollector?.id,
        collectorName: assignedCollector?.name,
      });

      setIsSubmitting(false);
      setSubmitSuccessId(`CMP-${Math.floor(10000 + Math.random() * 90000)}`);
      setDescription('');
      setLandmark('');
      setPictureUrl('');
    }, 400);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      name: editName,
      age: Number(editAge),
      area: editArea,
      email: editEmail,
      phone: editPhone,
      gender: editGender,
    });
    setIsEditingProfile(false);
  };

  // Helper for 48h countdown calculation
  const getRemainingTime = (deadlineAt: string, filedAt: string, status: string) => {
    if (status === 'Task Completed' || status === 'Resolved') {
      return { text: 'Resolved within 48h SLA', isExpired: false, percent: 100 };
    }
    const now = new Date().getTime();
    const deadline = new Date(deadlineAt).getTime();
    const start = new Date(filedAt).getTime();
    const totalDuration = 48 * 3600 * 1000;
    const diff = deadline - now;

    if (diff <= 0) {
      return { text: 'SLA Breached (Action Escalated)', isExpired: true, percent: 100 };
    }

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const elapsed = now - start;
    const percent = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));

    return {
      text: `${hours}h ${minutes}m remaining`,
      isExpired: false,
      percent,
    };
  };

  // Collectors in user's area
  const userAreaCollectors = collectors.filter((c) => c.assignedArea === user.area);
  const userAreaComplaints = allComplaints.filter((c) => c.area === user.area);
  const activeDumpingSpots = userAreaComplaints.filter((c) => c.status !== 'Resolved' && c.status !== 'Task Completed').length;

  return (
    <div className="space-y-6">
      {/* Citizen Banner with Summary */}
      <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 -mt-10 -mr-10 w-64 h-64 bg-emerald-600/30 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-900/60 border border-emerald-500/40 text-xs font-semibold text-emerald-200">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              Verified Citizen Profile • {user.id}
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Welcome, {user.name}
            </h1>
            <p className="text-sm text-emerald-100 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-300 shrink-0" />
              <span>{user.area}</span>
              <span className="opacity-60">•</span>
              <span>{user.complaintsCount} Complaints Filed</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Badge Indicator */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 rounded-xl flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-400/20 text-amber-300">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-wider text-emerald-200 font-semibold">Tier Badge</div>
                <div className="text-sm font-bold text-white">
                  {user.complaintsCount >= 100
                    ? '🥇 Gold Eco-Warrior'
                    : user.complaintsCount >= 50
                    ? '🥈 Silver Guardian'
                    : user.complaintsCount >= 25
                    ? '🥉 Bronze Steward'
                    : '🌱 Eco Scout'}
                </div>
              </div>
            </div>

            <button
              onClick={() => setActiveTab('report')}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-2.5 rounded-xl shadow-md transition flex items-center gap-2 text-sm cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              File New Report
            </button>
          </div>
        </div>
      </div>

      {/* Completion Notification Banner (when collector finishes task) */}
      {completedNotifications.length > 0 && (
        <div className="bg-emerald-50 border-2 border-emerald-400 rounded-2xl p-4 shadow-sm animate-pulse-subtle">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-emerald-600 text-white rounded-xl shadow-sm mt-0.5">
                <BellRing className="w-5 h-5 animate-bounce" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-emerald-950 flex items-center gap-2">
                  <span>Task Completed Notification!</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-800 font-semibold">
                    {completedNotifications.length} Cleared
                  </span>
                </h4>
                <p className="text-xs text-emerald-800 mt-1">
                  Waste collector has resolved your reported site and uploaded on-site verification proof!
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {completedNotifications.map((comp) => (
                    <button
                      key={comp.id}
                      onClick={() => setActiveTab('tracking')}
                      className="text-xs font-semibold px-2.5 py-1 bg-white border border-emerald-300 text-emerald-900 rounded-lg hover:bg-emerald-100 flex items-center gap-1.5 transition"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      View {comp.id} Verification Photo
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('tracking')}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-900 bg-white px-3 py-1.5 rounded-lg border border-emerald-200 shrink-0"
            >
              Go to Tracking →
            </button>
          </div>
        </div>
      )}

      {/* Primary Navigation Tabs */}
      <div className="flex border-b border-slate-200 bg-white rounded-xl shadow-xs p-1.5 overflow-x-auto gap-1">
        {[
          { id: 'report', label: '1. Report Box', icon: FileText, desc: 'File Complaint' },
          { id: 'rewards', label: '2. Score / Reward', icon: Award, desc: 'Badges & Points' },
          { id: 'profile', label: '3. Profile', icon: UserIcon, desc: 'Details & History' },
          { id: 'tracking', label: '4. Tracking / Completed', icon: Clock, desc: '48h SLA & Proof' },
          { id: 'area', label: '5. Area Details', icon: MapPin, desc: 'Dumping & Collectors' },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 min-w-[140px] px-3 py-2.5 rounded-lg text-xs font-semibold transition flex flex-col items-center justify-center gap-1 cursor-pointer ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-xs font-bold'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <span>{tab.label}</span>
              </div>
              <span className={`text-[10px] ${isActive ? 'text-emerald-100' : 'text-slate-400'}`}>
                {tab.desc}
              </span>
            </button>
          );
        })}
      </div>

      {/* =========================================================================
          TAB 1: REPORT BOX (Complain, Area, Picture Submission)
          ========================================================================= */}
      {activeTab === 'report' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-600" />
                Submit Public Waste Complaint
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Report dumping spots or overflow. Municipal collectors are bound by a strict 48-hour resolution SLA.
              </p>
            </div>

            {submitSuccessId && (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-start justify-between gap-3 animate-in fade-in">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold">Complaint Logged Successfully!</h4>
                    <p className="text-xs text-emerald-800 mt-0.5">
                      Assigned Reference ID: <strong className="font-mono">{submitSuccessId}</strong>. You earned civic points towards your reward tier!
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSubmitSuccessId(null)}
                  className="text-xs font-semibold text-emerald-700 hover:underline shrink-0"
                >
                  Dismiss
                </button>
              </div>
            )}

            <form onSubmit={handleReportSubmit} className="space-y-4">
              {/* Area Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  1. Waste Area / Municipal Ward <span className="text-rose-500">*</span>
                </label>
                <select
                  value={complaintArea}
                  onChange={(e) => setComplaintArea(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                  required
                >
                  {MUNICIPAL_AREAS.map((a) => (
                    <option key={a} value={a}>
                      {a} {a === user.area ? '(Your Registered Home Ward)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Landmark */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  2. Exact Location / Landmark Details <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  placeholder="e.g. Near Community Park Gate 2, beside electric transformer pole"
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                />
              </div>

              {/* Complain Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  3. Complain Details & Waste Type <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the complaint in detail: estimated volume, type of waste (wet/dry/plastic/chemical), odor, blocked walkways, etc."
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none resize-none"
                />
              </div>

              {/* Picture Submission Option */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  4. Picture Submission Option <span className="text-slate-400 font-normal">(Upload from Device or Select Sample Photo)</span>
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                  {/* File Upload Box */}
                  <label className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer bg-slate-50 hover:bg-emerald-50/50 transition">
                    <Upload className="w-6 h-6 text-emerald-600 mb-1" />
                    <span className="text-xs font-bold text-slate-700">Choose Image File</span>
                    <span className="text-[11px] text-slate-400">PNG, JPG up to 10MB</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>

                  {/* Camera / Quick Presets */}
                  <div className="border border-slate-200 rounded-xl p-3 bg-slate-50">
                    <div className="text-[11px] font-bold text-slate-600 mb-2 flex items-center gap-1">
                      <Camera className="w-3.5 h-3.5 text-slate-500" />
                      Quick Sample Incident Photos:
                    </div>
                    <div className="grid grid-cols-2 gap-1.5">
                      {samplePhotos.map((photo) => (
                        <button
                          key={photo.title}
                          type="button"
                          onClick={() => setPictureUrl(photo.url)}
                          className={`text-[10px] p-1.5 rounded-lg border text-left truncate transition ${
                            pictureUrl === photo.url
                              ? 'bg-emerald-600 text-white border-emerald-600 font-bold'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {photo.title}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Picture Preview */}
                {pictureUrl && (
                  <div className="relative rounded-xl overflow-hidden border border-slate-200 max-h-56 bg-slate-100 group">
                    <img
                      src={pictureUrl}
                      alt="Complaint attachment"
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => setPictureUrl('')}
                        className="px-3 py-1.5 bg-rose-600 text-white rounded-lg text-xs font-bold flex items-center gap-1 hover:bg-rose-700"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Remove Photo
                      </button>
                    </div>
                    <div className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-xs text-white text-[11px] px-2 py-0.5 rounded font-medium">
                      Attachment Preview Ready
                    </div>
                  </div>
                )}
              </div>

              {/* Submit CTA */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  <FileText className="w-4 h-4" />
                  {isSubmitting ? 'Logging Complaint...' : 'Submit Complaint (Initiates 48h Resolution)'}
                </button>
              </div>
            </form>
          </div>

          {/* Sidebar Guidelines */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-600" />
                48-Hour Municipal SLA
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Every complaint logged is auto-assigned to the official waste collector responsible for your ward. Municipal law requires resolution within <strong>48 hours</strong> with verified cleanup photos.
              </p>

              <div className="mt-4 p-3 bg-emerald-50 rounded-xl border border-emerald-100 text-xs text-emerald-800 space-y-1.5">
                <div className="font-bold flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-emerald-600" />
                  Rewards for Reporting
                </div>
                <p className="text-[11px]">
                  Filing active complaints earns you points towards Bronze (25), Silver (50), and Gold (100) civic awards.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                <UserIcon className="w-4 h-4 text-blue-600" />
                Filing as Citizen
              </h3>
              <div className="space-y-2 text-xs text-slate-600">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-400">Unique ID:</span>
                  <span className="font-mono font-bold text-slate-900">{user.id}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-400">Name:</span>
                  <span className="font-medium text-slate-900">{user.name}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-400">Phone:</span>
                  <span className="font-medium text-slate-900">{user.phone}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Ward:</span>
                  <span className="font-medium text-slate-900">{user.area}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: SCORE / REWARD (Based on amount of complains filed: 25=Bronze, 50=Silver, 100=Gold)
          ========================================================================= */}
      {activeTab === 'rewards' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-500" />
                  Citizen Civic Rewards & Recognition Badges
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Reward badges awarded based on the total number of complaints filed to keep our municipal wards clean.
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200 px-4 py-2 rounded-xl flex items-center gap-3">
                <div className="text-right">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Total Complains Filed</div>
                  <div className="text-xl font-black text-slate-900">{user.complaintsCount}</div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                  {user.complaintsCount}
                </div>
              </div>
            </div>

            {/* Badges Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              {/* Bronze Badge (25 complaints) */}
              <div
                className={`relative rounded-2xl p-6 border-2 transition-all ${
                  user.complaintsCount >= 25
                    ? 'bg-gradient-to-b from-amber-50/80 to-amber-100/40 border-amber-400 shadow-sm'
                    : 'bg-slate-50 border-slate-200 opacity-70'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-amber-600 text-white flex items-center justify-center shadow-md text-2xl font-black">
                    🥉
                  </div>
                  <span
                    className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${
                      user.complaintsCount >= 25
                        ? 'bg-amber-200 text-amber-900 border border-amber-300'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {user.complaintsCount >= 25 ? 'Unlocked ✓' : 'Requires 25 Reports'}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900">Bronze Eco Steward</h3>
                <p className="text-xs text-slate-600 mt-1 mb-4">
                  Awarded for filing <strong>25 verified complaints</strong>. Demonstrates active community civic responsibility.
                </p>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold text-slate-700">
                    <span>Progress:</span>
                    <span>{Math.min(user.complaintsCount, 25)} / 25</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-amber-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, (user.complaintsCount / 25) * 100)}%` }}
                    />
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-amber-200/60 text-[11px] text-slate-500 space-y-1">
                  <div>• Official Municipal Digital Certificate</div>
                  <div>• Priority Collector Queue Notification</div>
                </div>
              </div>

              {/* Silver Badge (50 complaints) */}
              <div
                className={`relative rounded-2xl p-6 border-2 transition-all ${
                  user.complaintsCount >= 50
                    ? 'bg-gradient-to-b from-slate-100/90 to-blue-50/60 border-slate-400 shadow-sm'
                    : 'bg-slate-50 border-slate-200 opacity-70'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-slate-400 text-white flex items-center justify-center shadow-md text-2xl font-black">
                    🥈
                  </div>
                  <span
                    className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${
                      user.complaintsCount >= 50
                        ? 'bg-slate-300 text-slate-900 border border-slate-400'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {user.complaintsCount >= 50 ? 'Unlocked ✓' : 'Requires 50 Reports'}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900">Silver Guardian</h3>
                <p className="text-xs text-slate-600 mt-1 mb-4">
                  Awarded for filing <strong>50 verified complaints</strong>. Recognized as a core neighborhood environmental guardian.
                </p>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold text-slate-700">
                    <span>Progress:</span>
                    <span>{Math.min(user.complaintsCount, 50)} / 50</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-slate-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, (user.complaintsCount / 50) * 100)}%` }}
                    />
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-200 text-[11px] text-slate-500 space-y-1">
                  <div>• Silver Municipal Badge on Profile</div>
                  <div>• Access to Ward Cleanliness Council</div>
                </div>
              </div>

              {/* Gold Badge (100 complaints) */}
              <div
                className={`relative rounded-2xl p-6 border-2 transition-all ${
                  user.complaintsCount >= 100
                    ? 'bg-gradient-to-b from-yellow-50/90 to-amber-100/60 border-yellow-500 shadow-md'
                    : 'bg-slate-50 border-slate-200 opacity-70'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-yellow-400 to-amber-600 text-white flex items-center justify-center shadow-lg text-2xl font-black">
                    🥇
                  </div>
                  <span
                    className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${
                      user.complaintsCount >= 100
                        ? 'bg-yellow-300 text-yellow-950 border border-yellow-400'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {user.complaintsCount >= 100 ? 'Unlocked ✓' : 'Requires 100 Reports'}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900">Gold Champion</h3>
                <p className="text-xs text-slate-600 mt-1 mb-4">
                  Awarded for filing <strong>100 verified complaints</strong>. Premier civic contributor with direct municipal helpline access.
                </p>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold text-slate-700">
                    <span>Progress:</span>
                    <span>{Math.min(user.complaintsCount, 100)} / 100</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-yellow-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, (user.complaintsCount / 100) * 100)}%` }}
                    />
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-yellow-200 text-[11px] text-slate-500 space-y-1">
                  <div>• Gold Star on all public reports</div>
                  <div>• Annual Mayor’s Green Champion Dinner Invitation</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: PROFILE (User details with EDIT option & complain history)
          ========================================================================= */}
      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* User Details with Edit Option */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <UserIcon className="w-5 h-5 text-emerald-600" />
                  User Details
                </h3>
                <p className="text-xs text-slate-500">Citizen identification & contact</p>
              </div>

              {!isEditingProfile && (
                <button
                  type="button"
                  onClick={() => setIsEditingProfile(true)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" /> Edit Profile
                </button>
              )}
            </div>

            {isEditingProfile ? (
              /* Edit Profile Form */
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-lg outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Age</label>
                    <input
                      type="number"
                      required
                      min={16}
                      max={100}
                      value={editAge}
                      onChange={(e) => setEditAge(Number(e.target.value))}
                      className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-lg outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Gender</label>
                    <select
                      value={editGender}
                      onChange={(e) => setEditGender(e.target.value as any)}
                      className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-lg outline-none bg-white"
                    >
                      <option value="Female">Female</option>
                      <option value="Male">Male</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Assigned Residential Area</label>
                  <select
                    value={editArea}
                    onChange={(e) => setEditArea(e.target.value)}
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
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email ID</label>
                  <input
                    type="email"
                    required
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-lg outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-lg outline-none"
                  />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsEditingProfile(false)}
                    className="w-1/2 py-2 px-3 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="w-1/2 py-2 px-3 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            ) : (
              /* Display Profile */
              <div className="space-y-4">
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                    Generated Unique ID
                  </div>
                  <div className="text-lg font-mono font-black text-emerald-950">{user.id}</div>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Full Name</span>
                    <span className="font-semibold text-slate-900 text-sm">{user.name}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-slate-400 block text-[11px]">Age</span>
                      <span className="font-semibold text-slate-900">{user.age} yrs</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Gender</span>
                      <span className="font-semibold text-slate-900">{user.gender}</span>
                    </div>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[11px]">Residential Area / Ward</span>
                    <span className="font-semibold text-slate-900">{user.area}</span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[11px]">E-mail ID</span>
                    <span className="font-semibold text-slate-900">{user.email}</span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[11px]">Phone Number</span>
                    <span className="font-semibold text-slate-900">{user.phone}</span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[11px]">Total Complains Filed</span>
                    <span className="font-semibold text-slate-900">{user.complaintsCount} complaints</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Complain History */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-emerald-600" />
                  Complain History ({userComplaints.length})
                </h3>
                <p className="text-xs text-slate-500">Historical records of complaints filed by your account</p>
              </div>

              <button
                type="button"
                onClick={() => setActiveTab('report')}
                className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg hover:bg-emerald-100 transition"
              >
                + File Another
              </button>
            </div>

            {userComplaints.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <FileText className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                <p className="text-sm font-semibold">No complaints filed yet.</p>
                <p className="text-xs text-slate-500 mt-1">Submit your first report to earn civic badges!</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {userComplaints.map((c) => (
                  <div key={c.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                      {c.pictureUrl ? (
                        <img
                          src={c.pictureUrl}
                          alt="thumbnail"
                          className="w-16 h-16 rounded-xl object-cover border border-slate-200 shrink-0"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 shrink-0">
                          <FileText className="w-6 h-6" />
                        </div>
                      )}

                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                            {c.id}
                          </span>
                          <span
                            className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                              c.status === 'Resolved' || c.status === 'Task Completed'
                                ? 'bg-emerald-100 text-emerald-800'
                                : c.status === 'In Progress'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {c.status}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-800 line-clamp-1">{c.landmark}</h4>
                        <p className="text-xs text-slate-500 line-clamp-2">{c.description}</p>
                        <div className="text-[11px] text-slate-400 flex items-center gap-2">
                          <span>Filed: {new Date(c.filedAt).toLocaleDateString()}</span>
                          <span>•</span>
                          <span>Collector: {c.collectorName || 'Assigning...'}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => setActiveTab('tracking')}
                      className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 shrink-0 self-end sm:self-center"
                    >
                      Track Progress →
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 4: TRACKING / COMPLETED (Track progress within 48h, notify on 'task completed')
          ========================================================================= */}
      {activeTab === 'tracking' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-emerald-600" />
                Live 48-Hour SLA Tracking & Verification Proof
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Every filed complaint has a strict 48-hour resolution clock. When the collector clears it, photo proof is posted here.
              </p>
            </div>

            {userComplaints.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <Clock className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                <p className="text-sm font-semibold">No complaints currently tracked.</p>
                <button
                  type="button"
                  onClick={() => setActiveTab('report')}
                  className="mt-3 text-xs font-bold px-4 py-2 bg-emerald-600 text-white rounded-xl shadow-xs"
                >
                  File a Complaint
                </button>
              </div>
            ) : (
              <div className="space-y-6 mt-6">
                {userComplaints.map((c) => {
                  const timer = getRemainingTime(c.deadlineAt, c.filedAt, c.status);
                  const isTaskCompleted = c.status === 'Task Completed' || c.status === 'Resolved';

                  return (
                    <div
                      key={c.id}
                      className={`rounded-2xl border p-5 transition ${
                        isTaskCompleted
                          ? 'border-emerald-300 bg-emerald-50/40'
                          : timer.isExpired
                          ? 'border-rose-300 bg-rose-50/30'
                          : 'border-slate-200 bg-white'
                      }`}
                    >
                      {/* Top Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200/80">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono text-sm font-black text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg">
                              {c.id}
                            </span>
                            <span
                              className={`text-xs px-3 py-1 rounded-full font-bold ${
                                isTaskCompleted
                                  ? 'bg-emerald-600 text-white'
                                  : c.status === 'In Progress'
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-amber-500 text-white'
                              }`}
                            >
                              {c.status}
                            </span>

                            {isTaskCompleted && (
                              <span className="text-xs px-2.5 py-0.5 rounded-md bg-emerald-100 border border-emerald-300 text-emerald-900 font-bold flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                Collector Cleared: Task Completed
                              </span>
                            )}
                          </div>

                          <h3 className="text-sm font-bold text-slate-900 mt-2">{c.landmark}</h3>
                          <p className="text-xs text-slate-500">{c.area} • Filed: {new Date(c.filedAt).toLocaleString()}</p>
                        </div>

                        {/* 48h Countdown Badge */}
                        <div
                          className={`px-4 py-2.5 rounded-xl border text-right sm:min-w-[180px] ${
                            isTaskCompleted
                              ? 'bg-emerald-100/80 border-emerald-300 text-emerald-900'
                              : timer.isExpired
                              ? 'bg-rose-100 border-rose-300 text-rose-900'
                              : 'bg-amber-50 border-amber-300 text-amber-900'
                          }`}
                        >
                          <div className="text-[10px] font-bold uppercase tracking-wider">
                            48h SLA Status
                          </div>
                          <div className="text-sm font-black flex items-center justify-end gap-1.5">
                            <Clock className="w-4 h-4" />
                            {timer.text}
                          </div>
                        </div>
                      </div>

                      {/* SLA Progress Bar */}
                      {!isTaskCompleted && (
                        <div className="py-3">
                          <div className="flex justify-between text-[11px] font-semibold text-slate-500 mb-1">
                            <span>SLA Elapsed Time</span>
                            <span>{Math.round(timer.percent)}% of 48h window</span>
                          </div>
                          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${
                                timer.isExpired ? 'bg-rose-500' : 'bg-emerald-500'
                              }`}
                              style={{ width: `${timer.percent}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Notification Highlight for Completed Task */}
                      {c.status === 'Task Completed' && (
                        <div className="mt-4 p-4 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-950 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-emerald-600 text-white rounded-xl">
                              <BellRing className="w-5 h-5" />
                            </div>
                            <div>
                              <div className="text-xs font-bold">Collector Notification: "task completed"</div>
                              <div className="text-xs text-emerald-800">
                                Collector <strong>{c.collectorName}</strong> has cleared this location. Verified photo attached below.
                              </div>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => onAcknowledgeCompletion(c.id)}
                            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition shrink-0 cursor-pointer"
                          >
                            Mark As Verified & Close
                          </button>
                        </div>
                      )}

                      {/* Photos Comparison Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        {/* Before Photo */}
                        <div className="rounded-xl border border-slate-200 overflow-hidden bg-white p-3">
                          <div className="text-xs font-bold text-slate-700 mb-2 flex items-center justify-between">
                            <span>📸 Citizen Report Photo (Before)</span>
                            <span className="text-[10px] text-slate-400">By You</span>
                          </div>
                          {c.pictureUrl ? (
                            <img
                              src={c.pictureUrl}
                              alt="Before cleanup"
                              className="w-full h-44 object-cover rounded-lg"
                            />
                          ) : (
                            <div className="w-full h-44 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 text-xs">
                              No Photo Submitted
                            </div>
                          )}
                          <p className="text-xs text-slate-600 mt-2 italic">"{c.description}"</p>
                        </div>

                        {/* After Photo (Collector Proof) */}
                        <div className="rounded-xl border border-slate-200 overflow-hidden bg-white p-3">
                          <div className="text-xs font-bold text-slate-700 mb-2 flex items-center justify-between">
                            <span>✅ Collector Verification Photo (After)</span>
                            <span className="text-[10px] text-emerald-700 font-bold">
                              {c.collectorProofPicture ? 'Verified on Site' : 'Pending Clearance'}
                            </span>
                          </div>
                          {c.collectorProofPicture ? (
                            <img
                              src={c.collectorProofPicture}
                              alt="Cleaned site proof"
                              className="w-full h-44 object-cover rounded-lg border border-emerald-300"
                            />
                          ) : (
                            <div className="w-full h-44 bg-slate-50 border border-dashed border-slate-200 rounded-lg flex flex-col items-center justify-center text-slate-400 text-xs p-4 text-center">
                              <Camera className="w-8 h-8 text-slate-300 mb-1" />
                              <span>Awaiting collector cleanup proof upload</span>
                              <span className="text-[10px] text-slate-400 mt-1">Collector will photograph cleared ground</span>
                            </div>
                          )}
                          {c.notes && (
                            <p className="text-xs text-emerald-900 mt-2 bg-emerald-50 p-2 rounded border border-emerald-200">
                              <strong>Collector Note:</strong> {c.notes}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Assigned Collector Details */}
                      <div className="mt-4 pt-3 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-600">
                        <div className="flex items-center gap-2">
                          <span className="text-slate-400">Assigned Collector:</span>
                          <span className="font-bold text-slate-900">{c.collectorName || 'Field Team Dispatching'}</span>
                        </div>
                        {c.resolvedAt && (
                          <div className="text-[11px] text-emerald-700 font-semibold">
                            Completed: {new Date(c.resolvedAt).toLocaleString()}
                          </div>
                        )}
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
          TAB 5: AREA DETAILS (Show dumping of their area and collector names of their area)
          ========================================================================= */}
      {activeTab === 'area' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-emerald-600" />
                Area Details & Municipal Sanitation Status: {user.area}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Local dumping activity overview and dedicated waste collector team assigned to your zone.
              </p>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-[11px] uppercase font-bold text-slate-400">Active Dumping Reports</div>
                <div className="text-2xl font-black text-rose-600 mt-1">{activeDumpingSpots} spots</div>
                <div className="text-xs text-slate-500 mt-1">Pending or undergoing clearance</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-[11px] uppercase font-bold text-slate-400">Total Ward Reports</div>
                <div className="text-2xl font-black text-slate-900 mt-1">{userAreaComplaints.length}</div>
                <div className="text-xs text-slate-500 mt-1">Total complaints registered in this ward</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-[11px] uppercase font-bold text-slate-400">Assigned Ward Collectors</div>
                <div className="text-2xl font-black text-emerald-600 mt-1">{userAreaCollectors.length} Personnel</div>
                <div className="text-xs text-slate-500 mt-1">Dedicated municipal staff on duty</div>
              </div>
            </div>

            {/* Collector Contact Section */}
            <div>
              <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                <UserIcon className="w-4 h-4 text-emerald-600" />
                Assigned Waste Collectors for {user.area}
              </h3>

              {userAreaCollectors.length === 0 ? (
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-500">
                  Municipal roving vehicle assigned. Regular morning rounds: 06:30 AM – 10:00 AM.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {userAreaCollectors.map((col) => (
                    <div
                      key={col.id}
                      className="p-4 rounded-xl border border-slate-200 bg-white hover:border-emerald-300 transition shadow-xs flex items-start justify-between"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-slate-900">{col.name}</h4>
                          <span className="font-mono text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                            {col.id}
                          </span>
                        </div>
                        <div className="text-xs text-slate-600 flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          <span>{col.phone}</span>
                        </div>
                        <div className="text-xs text-slate-600 flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          <span>{col.email}</span>
                        </div>
                        <div className="text-[11px] text-emerald-700 font-semibold pt-1">
                          Assigned: {col.assignedArea}
                        </div>
                      </div>

                      <a
                        href={`tel:${col.phone}`}
                        className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold hover:bg-emerald-100 transition"
                      >
                        Call Collector
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Dumping Spots in this Area */}
            <div>
              <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-500" />
                Active Reported Dumping Spots in {user.area}
              </h3>

              {userAreaComplaints.length === 0 ? (
                <div className="p-6 text-center text-slate-400 bg-slate-50 rounded-xl">
                  No dumping issues currently reported in your ward! Clean & Green.
                </div>
              ) : (
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                  {userAreaComplaints.map((c) => (
                    <div key={c.id} className="p-3.5 bg-white flex items-center justify-between text-xs">
                      <div>
                        <div className="font-bold text-slate-900">{c.landmark}</div>
                        <div className="text-slate-500">{c.description}</div>
                      </div>
                      <span
                        className={`px-2.5 py-1 rounded-full font-bold text-[11px] shrink-0 ${
                          c.status === 'Resolved' || c.status === 'Task Completed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {c.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
