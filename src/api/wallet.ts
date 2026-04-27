import apiClient from './client';
import type {
  Wallet,
  CreateWalletRequest,
  UpdateWalletRequest,
} from '@/types';

export async function getWallets(): Promise<Wallet[]> {
  const response = await apiClient.get<Wallet[]>('/wallet');
  return response.data;
}

export async function getWallet(id: string): Promise<Wallet> {
  const response = await apiClient.get<Wallet>(`/wallet/${id}`);
  return response.data;
}

export async function createWallet(data: CreateWalletRequest): Promise<Wallet> {
  const response = await apiClient.post<Wallet>('/wallet', data);
  return response.data;
}

export async function updateWallet(data: UpdateWalletRequest): Promise<void> {
  await apiClient.put('/wallet', data);
}

export async function deleteWallet(id: string): Promise<void> {
  await apiClient.delete(`/wallet/${id}`);
}
