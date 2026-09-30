import { UserAccount, WasteCollectorAccount, AdminAccount, Complaint } from '../types';

export const INITIAL_USERS: UserAccount[] = [
  {
    id: 'USR-8419',
    name: 'Ananya Sharma',
    age: 29,
    area: 'Green Valley Ward 4',
    email: 'ananya.sharma@example.com',
    phone: '9876541230',
    gender: 'Female',
    password: 'password123',
    complaintsCount: 26, // Unlocked Bronze badge (>= 25)
  },
  {
    id: 'USR-5192',
    name: 'Rohan Mehta',
    age: 34,
    area: 'Central Market Sector 12',
    email: 'rohan.mehta@example.com',
    phone: '9823456789',
    gender: 'Male',
    password: 'password123',
    complaintsCount: 54, // Unlocked Silver badge (>= 50)
  },
  {
    id: 'USR-3104',
    name: 'Pooja Iyer',
    age: 41,
    area: 'Riverside Enclave',
    email: 'pooja.iyer@example.com',
    phone: '9811223344',
    gender: 'Female',
    password: 'password123',
    complaintsCount: 12,
  },
  {
    id: 'USR-9021',
    name: 'Vikram Das',
    age: 48,
    area: 'North Industrial Area',
    email: 'vikram.das@example.com',
    phone: '9899001122',
    gender: 'Male',
    password: 'password123',
    complaintsCount: 104, // Unlocked Gold badge (>= 100)
  },
];

export const INITIAL_COLLECTORS: WasteCollectorAccount[] = [
  {
    id: 'COL-3081',
    name: 'Rajesh Kumar',
    gender: 'Male',
    phone: '9845123456',
    email: 'rajesh.collector@ecosort.org',
    assignedArea: 'Green Valley Ward 4',
    password: 'password123',
    dailyTargetTotal: 6,
    dailyResolvedCount: 5, // 83% progress (> 70% threshold!)
    coins: 18,
  },
  {
    id: 'COL-7140',
    name: 'Sunita Devi',
    gender: 'Female',
    phone: '9871239870',
    email: 'sunita.collector@ecosort.org',
    assignedArea: 'Central Market Sector 12',
    password: 'password123',
    dailyTargetTotal: 8,
    dailyResolvedCount: 4, // 50% progress
    coins: 12,
  },
  {
    id: 'COL-4522',
    name: 'Amit Patel',
    gender: 'Male',
    phone: '9812345678',
    email: 'amit.collector@ecosort.org',
    assignedArea: 'North Industrial Area',
    password: 'password123',
    dailyTargetTotal: 5,
    dailyResolvedCount: 4, // 80% progress
    coins: 24,
  },
  {
    id: 'COL-6893',
    name: 'Kavita Nair',
    gender: 'Female',
    phone: '9833445566',
    email: 'kavita.collector@ecosort.org',
    assignedArea: 'Riverside Enclave',
    password: 'password123',
    dailyTargetTotal: 4,
    dailyResolvedCount: 3, // 75% progress
    coins: 15,
  },
];

export const INITIAL_ADMIN: AdminAccount = {
  id: 'ADM-001',
  name: 'Chief Municipal Officer',
  email: 'admin@ecosort.org',
  phone: '9876543210',
  password: 'admin',
};

const now = new Date();
const hoursAgo = (h: number) => new Date(now.getTime() - h * 3600 * 1000).toISOString();
const hoursAhead = (h: number) => new Date(now.getTime() + h * 3600 * 1000).toISOString();

export const INITIAL_COMPLAINTS: Complaint[] = [
  {
    id: 'CMP-84920',
    userId: 'USR-8419',
    userName: 'Ananya Sharma',
    userPhone: '9876541230',
    area: 'Green Valley Ward 4',
    landmark: 'Behind Community Park Gate 2',
    description: 'Heavy overflow of household wet waste and plastic containers blocking the pedestrian footpath.',
    pictureUrl: 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&w=600&q=80',
    status: 'In Progress',
    filedAt: hoursAgo(12),
    deadlineAt: hoursAhead(36), // 48h SLA
    collectorId: 'COL-3081',
    collectorName: 'Rajesh Kumar',
  },
  {
    id: 'CMP-71204',
    userId: 'USR-8419',
    userName: 'Ananya Sharma',
    userPhone: '9876541230',
    area: 'Green Valley Ward 4',
    landmark: 'Opposite Primary Health Clinic',
    description: 'Dumped carton packaging, broken furniture and plastic wrappers accumulated over the weekend.',
    pictureUrl: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=600&q=80',
    status: 'Task Completed',
    filedAt: hoursAgo(28),
    deadlineAt: hoursAhead(20),
    collectorId: 'COL-3081',
    collectorName: 'Rajesh Kumar',
    resolvedAt: hoursAgo(3),
    collectorProofPicture: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=600&q=80',
    notes: 'Cleared 4 cubic yards of debris. Sanitized the footpath with lime powder.',
  },
  {
    id: 'CMP-93102',
    userId: 'USR-5192',
    userName: 'Rohan Mehta',
    userPhone: '9823456789',
    area: 'Central Market Sector 12',
    landmark: 'Vegetable Wholesale Lane 3',
    description: 'Rotten vegetable waste and wooden crates left uncollected attracting stray animals.',
    pictureUrl: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=600&q=80',
    status: 'Pending',
    filedAt: hoursAgo(6),
    deadlineAt: hoursAhead(42),
    collectorId: 'COL-7140',
    collectorName: 'Sunita Devi',
  },
  {
    id: 'CMP-60481',
    userId: 'USR-9021',
    userName: 'Vikram Das',
    userPhone: '9899001122',
    area: 'North Industrial Area',
    landmark: 'Bay 7 Chemical Transit Corner',
    description: 'Hazardous metal scraps, empty paint drums, and chemical sludge bags dumped illegally.',
    pictureUrl: 'https://images.unsplash.com/photo-1582408921715-18e7806365c1?auto=format&fit=crop&w=600&q=80',
    status: 'Pending',
    filedAt: hoursAgo(18),
    deadlineAt: hoursAhead(30),
    collectorId: 'COL-4522',
    collectorName: 'Amit Patel',
  },
  {
    id: 'CMP-45129',
    userId: 'USR-3104',
    userName: 'Pooja Iyer',
    userPhone: '9811223344',
    area: 'Riverside Enclave',
    landmark: 'Promenade Boat Jetty Steps',
    description: 'Plastic beverage bottles and food wrappers scattered across the riverside garden steps.',
    pictureUrl: 'https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?auto=format&fit=crop&w=600&q=80',
    status: 'Resolved',
    filedAt: hoursAgo(36),
    deadlineAt: hoursAhead(12),
    collectorId: 'COL-6893',
    collectorName: 'Kavita Nair',
    resolvedAt: hoursAgo(14),
    collectorProofPicture: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80',
    notes: 'Full shoreline sweep completed with 6 bags of recyclables diverted.',
  },
];

export const MUNICIPAL_AREAS = [
  'Green Valley Ward 4',
  'Central Market Sector 12',
  'North Industrial Area',
  'Riverside Enclave',
  'Sunset Heights Colony',
  'Metro Hub Sector 7',
];
