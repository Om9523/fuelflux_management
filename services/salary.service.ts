/**
 * salary.service.ts — Real API, replaces mock-based service
 */
import backendApi from '@/lib/backendApi';
import { SalarySlip } from '@/types/employee';

export const salaryService = {
  async getSalarySummary(): Promise<SalarySlip[]> {
    const res = await backendApi.get('/employee/salary');
    return res.data.data ?? [];
  },
};