import { api } from '@/lib/api';
import { PaymentRecord } from '@/lib/mock-db';

export const paymentsService = {
  async getPayments(): Promise<PaymentRecord[]> {
    const res = await api.get('/admin/payments');
    return res.data.payments;
  },

  async refundPayment(id: string, actionBy: string): Promise<PaymentRecord> {
    const res = await api.patch(`/admin/payments/${id}`, { status: 'refunded', actionBy });
    return res.data.payment;
  },
};
