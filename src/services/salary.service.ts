import { api } from '@/lib/api';
import { SalaryRecord } from '@/lib/mock-db';

export const salaryService = {
  async getSalarySummary(): Promise<SalaryRecord[]> {
    const res = await api.get('/employee/salary');
    return res.data.records;
  },
};
