/**
 * shift.service.ts
 * Real API — replaces the old mock-based shift service.
 */

import { employeeService } from '@/services/employee.service';
import { ShiftDetails } from '@/types/employee';

export const shiftService = {
  async getShiftDetails(): Promise<ShiftDetails> {
    return employeeService.getShift();
  },
};