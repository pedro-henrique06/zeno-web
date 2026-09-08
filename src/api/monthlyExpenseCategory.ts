import apiClient, { unwrap } from './client';
import type {
  MonthlyExpenseCategory,
  CreateMonthlyExpenseCategoryRequest,
  UpdateMonthlyExpenseCategoryRequest,
} from '@/types';

export async function getMonthlyExpenseCategories(): Promise<MonthlyExpenseCategory[]> {
  return unwrap(apiClient.get('/monthly-expense-categories'));
}

export async function createMonthlyExpenseCategory(
  data: CreateMonthlyExpenseCategoryRequest,
): Promise<MonthlyExpenseCategory> {
  return unwrap(apiClient.post('/monthly-expense-categories', data));
}

export async function updateMonthlyExpenseCategory(data: UpdateMonthlyExpenseCategoryRequest): Promise<void> {
  await apiClient.put('/monthly-expense-categories', data);
}

export async function deleteMonthlyExpenseCategory(id: string): Promise<void> {
  await apiClient.delete(`/monthly-expense-categories/${id}`);
}
