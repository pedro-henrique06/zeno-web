import apiClient from './client';
import type {
  Home,
  CreateHomeRequest,
  UpdateHomeRequest,
  HomeMember,
  HomeWallet,
  HomeExpense,
  CreateExpenseRequest,
  SplitResult,
  BudgetAlert,
} from '@/types';

export async function getHomes(): Promise<Home[]> {
  const response = await apiClient.get<Home[]>('/home');
  return response.data;
}

export async function getHome(id: string): Promise<Home> {
  const response = await apiClient.get<Home>(`/home/${id}`);
  return response.data;
}

export async function createHome(data: CreateHomeRequest): Promise<Home> {
  const response = await apiClient.post<Home>('/home', data);
  return response.data;
}

export async function updateHome(data: UpdateHomeRequest): Promise<void> {
  await apiClient.put(`/home/${data.id}`, data);
}

export async function deleteHome(id: string): Promise<void> {
  await apiClient.delete(`/home/${id}`);
}

export async function getHomeMembers(homeId: string): Promise<HomeMember[]> {
  const response = await apiClient.get<HomeMember[]>(`/home/${homeId}/members`);
  return response.data;
}
3
export async function addMember(
  homeId: string,
  memberUserId: string,
): Promise<void> {
  await apiClient.post(`/home/${homeId}/members/${memberUserId}`);
}

export async function removeMember(
  homeId: string,
  memberUserId: string,
): Promise<void> {
  await apiClient.delete(`/home/${homeId}/members/${memberUserId}`);
}

export async function linkWallet(
  homeId: string,
  walletId: string,
): Promise<void> {
  await apiClient.post(`/home/${homeId}/wallets/${walletId}`);
}

export async function unlinkWallet(
  homeId: string,
  walletId: string,
): Promise<void> {
  await apiClient.delete(`/home/${homeId}/wallets/${walletId}`);
}

export async function getHomeWallets(homeId: string): Promise<HomeWallet[]> {
  const response = await apiClient.get<HomeWallet[]>(`/home/${homeId}/wallets`);
  return response.data;
}

export async function getExpenses(
  homeId: string,
  month: number,
  year: number,
): Promise<HomeExpense[]> {
  const response = await apiClient.get<HomeExpense[]>(`/home/${homeId}/expenses`, {
    params: { month, year },
  });
  return response.data;
}

export async function createExpense(data: CreateExpenseRequest): Promise<void> {
  await apiClient.post(`/home/${data.homeId}/expenses`, data);
}

export async function deleteExpense(expenseId: string): Promise<void> {
  await apiClient.delete(`/home/expenses/${expenseId}`);
}

export async function getSplit(
  homeId: string,
  month: number,
  year: number,
): Promise<SplitResult[]> {
  const response = await apiClient.get<SplitResult[]>(
    `/home/${homeId}/split`,
    { params: { month, year } },
  );
  return response.data;
}

export async function getBudgetAlert(
  homeId: string,
  month: number,
  year: number,
): Promise<BudgetAlert> {
  const response = await apiClient.get<BudgetAlert>(
    `/home/${homeId}/budget-alert`,
    { params: { month, year } },
  );
  return response.data;
}
