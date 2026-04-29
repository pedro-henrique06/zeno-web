import apiClient from './client';
import type {
  Account,
  CreateAccountRequest,
  UpdateAccountRequest,
} from '@/types';

export async function getAccounts(): Promise<Account[]> {
  const response = await apiClient.get<Account[]>('/account');
  return response.data;
}

export async function getAccountsByWallet(walletId: string): Promise<Account[]> {
  const response = await apiClient.get<Account[]>(`/account/wallet/${walletId}`);
  return response.data;
}

export async function getAccountById(id: string): Promise<Account> {
  const response = await apiClient.get<Account>(`/account/${id}`);
  return response.data;
}

export async function createAccount(data: CreateAccountRequest): Promise<Account> {
  const response = await apiClient.post<Account>('/account', data);
  return response.data;
}

export async function updateAccount(data: UpdateAccountRequest): Promise<void> {
  await apiClient.put('/account', data);
}

export async function deleteAccount(id: string): Promise<void> {
  await apiClient.delete(`/account/${id}`);
}