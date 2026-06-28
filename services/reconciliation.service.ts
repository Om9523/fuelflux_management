import { authService } from '@/services/auth.service';

export interface ReconciliationResult {
  pump_id: string;
  expected_amount: number;
  actual_amount: number;
  mismatch_amount: number;
  status: 'matched' | 'mismatch';
  remarks: string;
  message: string;
}

export const reconcileShiftAuto = async (pumpId: string, shiftDate: string) => {
  const response = await authService.getApi().post(
    `/reconciliation/shift`,
    null,
    {
      params: {
        pump_id: pumpId,
        shift_date: shiftDate,
      },
    }
  );
  return response.data;
};

export const reconcileManual = async (payload: {
  pump_id: string;
  expected_amount: number;
  actual_amount: number;
  remarks?: string;
}): Promise<ReconciliationResult> => {
  const response = await authService.getApi().post(
    `/reconciliation/manual`,
    null,
    {
      params: {
        pump_id: payload.pump_id,
        expected_amount: payload.expected_amount,
        actual_amount: payload.actual_amount,
        remarks: payload.remarks || '',
      },
    }
  );
  return response.data;
};
