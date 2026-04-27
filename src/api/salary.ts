import apiClient from './client';
import type {
  Salary,
  CreateSalaryRequest,
  UpdateSalaryRequest,
} from '@/types';

export async function getSalariesByWallet(walletId: string): Promise<Salary[]> {
  const response = await apiClient.get<Salary[]>(`/salary/wallet/${walletId}`);
  return response.data;
}

export async function getSalary(id: string): Promise<Salary> {
  const response = await apiClient.get<Salary>(`/salary/${id}`);
  return response.data;
}

export async function createSalary(data: CreateSalaryRequest): Promise<void> {
  await apiClient.post('/salary', data);
}

export async function updateSalary(data: UpdateSalaryRequest): Promise<void> {
  await apiClient.put('/salary', data);
}

export async function deleteSalary(id: string): Promise<void> {
  await apiClient.delete(`/salary/${id}`);
}
