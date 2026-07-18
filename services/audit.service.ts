import { api } from '@/lib/api';
import { AuditLog, FraudAlert } from '@/lib/mock-db';

export const auditService = {
  async getAuditLogs(): Promise<AuditLog[]> {
    const res = await api.get('/admin/audit-logs');
    return res.data.auditLogs;
  },

  async getFraudAlerts(): Promise<FraudAlert[]> {
    const res = await api.get('/admin/fraud-alerts');
    return res.data.fraudAlerts;
  },

  async resolveFraudAlert(id: string, status: FraudAlert['status']): Promise<FraudAlert> {
    const res = await api.patch(`/admin/fraud-alerts/${id}`, { status });
    return res.data.alert;
  },
};
