export type EntryKind = 0 | 1 | 2 | 3 | 4;
export const EntryKind = {
  Entrada: 0,
  Saida: 1,
  Diario: 2,
  Economia: 3,
  Cartao: 4,
} as const;

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  confirmPassword?: string;
  phone?: string;
  document?: string;
  birthDate?: string;
}

export interface AuthResponse {
  userId: string;
  name: string;
  email: string;
  phone?: string;
  document?: string;
  birthDate?: string;
  oAuthProvider: string;
  token: string;
  refreshToken?: string;
}

export interface UserProfile {
  userId: string;
  name: string;
  email: string;
  phone?: string;
  document?: string;
  birthDate?: string;
  oAuthProvider: string;
  hasPassword: boolean;
  dailyBudget?: number;
}

export interface UpdateProfileRequest {
  name: string;
  email: string;
  phone?: string;
  document?: string;
  birthDate?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

export interface UpdateDailyBudgetRequest {
  dailyBudget: number;
}

export interface Tag {
  id: string;
  userId: string;
  name: string;
  createdAt: string;
}

export interface CreateTagRequest {
  name: string;
}

export interface UpdateTagRequest {
  id: string;
  name: string;
}

export interface Entry {
  id: string;
  userId: string;
  title: string;
  value: number;
  kind: EntryKind;
  description: string;
  tagId: string | null;
  date: string;
  isRecurring: boolean;
}

export interface CreateEntryRequest {
  title: string;
  value: number;
  kind: EntryKind;
  description?: string;
  tagId?: string | null;
  date: string;
  isRecurring: boolean;
}

export interface UpdateEntryRequest extends CreateEntryRequest {
  id: string;
}

export interface BalanceDay {
  day: number;
  entrada: number;
  saida: number;
  diario: number;
  economia: number;
  cartao: number;
  balance: number;
  isProjected: boolean;
  isToday: boolean;
}

export interface BalancesResponse {
  month: number;
  year: number;
  days: BalanceDay[];
}

export interface BalancesHorizonResponse {
  year: number;
  months: BalancesResponse[];
}

export interface Movements {
  entrada: number;
  saida: number;
  diario: number;
  economia: number;
  cartao: number;
}

export interface SummaryResponse {
  performance: number;
  economizedPercent: number;
  costOfLiving: number;
  dailyAverageReal: number;
  dailyBudget: number;
  daysElapsed: number;
  daysRemaining: number;
  daysInMonth: number;
  movements: Movements;
}

export interface EconomizedMonth {
  month: number;
  economizedPercent: number;
  economia: number;
  entrada: number;
}

export interface EconomizedHorizonResponse {
  year: number;
  economizedPercent: number;
  economia: number;
  entrada: number;
  months: EconomizedMonth[];
}

export interface PerformanceMonth {
  month: number;
  performance: number;
}

export interface PerformanceHorizonResponse {
  year: number;
  months: PerformanceMonth[];
}

export interface PagedResponse<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  errors: string[];
}
