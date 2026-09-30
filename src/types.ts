export type UserRole = 'user' | 'collector' | 'admin';

export interface UserAccount {
  id: string; // e.g. USR-4821
  name: string;
  age: number;
  area: string;
  email: string;
  phone: string;
  gender: 'Male' | 'Female' | 'Other';
  password?: string;
  complaintsCount: number;
}

export interface WasteCollectorAccount {
  id: string; // e.g. COL-8214
  name: string;
  gender: 'Male' | 'Female' | 'Other';
  phone: string;
  email: string;
  assignedArea: string;
  password?: string;
  dailyTargetTotal: number;
  dailyResolvedCount: number;
  coins: number;
  lastDailyCoinAwardDate?: string;
}

export interface AdminAccount {
  id: string;
  name: string;
  email: string;
  phone: string;
  password?: string;
}

export type ComplaintStatus = 'Pending' | 'In Progress' | 'Task Completed' | 'Resolved';

export interface Complaint {
  id: string; // e.g. CMP-1082
  userId: string;
  userName: string;
  userPhone: string;
  area: string;
  landmark: string;
  description: string;
  pictureUrl?: string; // base64 or photo URL
  status: ComplaintStatus;
  filedAt: string; // ISO string
  deadlineAt: string; // 48h from filedAt
  collectorId?: string;
  collectorName?: string;
  resolvedAt?: string;
  collectorProofPicture?: string; // uploaded photo of cleaned site
  notes?: string;
}

export interface AreaDetail {
  name: string;
  dumpingSpotsCount: number;
  assignedCollectors: { id: string; name: string; phone: string }[];
  alertLevel: 'High' | 'Medium' | 'Low' | 'Clear';
  complaintCount: number;
}
