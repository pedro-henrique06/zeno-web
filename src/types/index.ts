export type EntryType = 0 | 1;
export const EntryType = { Credit: 0, Debit: 1 } as const;

export type Category = 0 | 1 | 2 | 3 | 4 | 5 | 6;
export const Category = {
  None: 0,
  Restaurant: 1,
  Grocery: 2,
  Entertainment: 3,
  Utilities: 4,
  Transportation: 5,
  Salary: 6,
} as const;

export const CategoryKeys: Record<Category, string> = {
  [0]: 'none',
  [1]: 'restaurant',
  [2]: 'grocery',
  [3]: 'entertainment',
  [4]: 'utilities',
  [5]: 'transportation',
  [6]: 'salary',
};

export const CategoryLabels: Record<Category, string> = {
  [0]: 'Nenhuma',
  [1]: 'Restaurante',
  [2]: 'Mercado',
  [3]: 'Entretenimento',
  [4]: 'Serviços',
  [5]: 'Transporte',
  [6]: 'Salário',
};

export type SplitMode = 0 | 1;
export const SplitMode = { ByTotalBalance: 0, ByIndividualAccounts: 1 } as const;

export const SplitModeLabels: Record<SplitMode, string> = {
  [0]: 'Por Saldo Total',
  [1]: 'Por Contas Individuais',
};

export type HomeRole = 0 | 1;
export const HomeRole = { Admin: 0, Member: 1 } as const;

export const HomeRoleKeys: Record<HomeRole, string> = {
  [0]: 'admin',
  [1]: 'member',
};

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
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
  token: string;
}

export interface Wallet {
  id: string;
  name: string;
  description: string;
  balance: number;
  userId: string;
  currency: string;
  createdAt: string;
}

export interface CreateWalletRequest {
  name: string;
  description: string;
  currency: string;
}

export interface UpdateWalletRequest {
  id: string;
  name: string;
  description: string;
  currency: string;
}

export interface Account {
  id: string;
  name: string;
  bank: string;
  type: string;
  balance: number;
  walletId: string;
  createdAt: string;
}

export interface CreateAccountRequest {
  name: string;
  bank: string;
  type: string;
  walletId: string;
}

export interface UpdateAccountRequest {
  id: string;
  name: string;
  bank: string;
  type: string;
}

export const AccountTypes = {
  Checking: 'checking',
  Savings: 'savings',
  Investment: 'investment',
  Credit: 'credit',
  Other: 'other',
} as const;

export const AccountTypeLabels: Record<string, string> = {
  checking: 'Conta Corrente',
  savings: 'Poupança',
  investment: 'Investimento',
  credit: 'Cartão de Crédito',
  other: 'Outros',
};

export interface Entry {
  id: string;
  title: string;
  value: number;
  type: EntryType;
  description: string;
  category: Category;
  date: string;
  walletId: string;
}

export interface CreateEntryRequest {
  title: string;
  value: number;
  type: EntryType;
  description: string;
  category: Category;
  date: string;
  walletId: string;
}

export interface UpdateEntryRequest {
  id: string;
  title: string;
  value: number;
  type: EntryType;
  description: string;
  category: Category;
  date: string;
  walletId: string;
}

export interface Salary {
  id: string;
  accountId: string;
  userId: string;
  amount: number;
  description: string;
  dayOfMonth: number;
  active: boolean;
  createdAt: string;
  lastProcessedAt: string | null;
}

export interface CreateSalaryRequest {
  accountId: string;
  amount: number;
  description: string;
  dayOfMonth: number;
  active: boolean;
}

export interface UpdateSalaryRequest {
  id: string;
  accountId: string;
  amount: number;
  description: string;
  dayOfMonth: number;
  active: boolean;
}

export interface Home {
  id: string;
  name: string;
  description: string;
  splitMode: SplitMode;
  createdAt: string;
}

export interface CreateHomeRequest {
  name: string;
  description: string;
  splitMode: SplitMode;
}

export interface UpdateHomeRequest {
  id: string;
  name: string;
  description: string;
  splitMode: SplitMode;
}

export interface HomeMember {
  homeId: string;
  userId: string;
  role: HomeRole;
  joinedAt: string;
  userName?: string;
  userEmail?: string;
}

export interface HomeWallet {
  homeId: string;
  walletId: string;
}

export interface HomeExpense {
  id: string;
  homeId: string;
  title: string;
  value: number;
  category: Category;
  month: number;
  year: number;
  createdAt: string;
}

export interface CreateExpenseRequest {
  homeId: string;
  title: string;
  value: number;
  category: Category;
  month: number;
  year: number;
}

export interface SplitResult {
  walletId: string;
  userId: string;
  userName: string;
  walletName: string;
  walletIncome: number;
  salaryAmount: number;
  salaryWeight: number;
  totalIncome: number;
  totalSalary: number;
  percentage: number;
  amountToPay: number;
}

export interface BudgetAlert {
  homeId: string;
  month: number;
  year: number;
  totalIncome: number;
  totalExpenses: number;
  maxNeedsLimit: number;
  needsUsagePercentage: number;
  wantsLimit: number;
  savingsLimit: number;
  isOverBudget: boolean;
  alertMessage: string;
}
