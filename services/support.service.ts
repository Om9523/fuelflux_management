import { api } from '@/lib/api';
import { SupportTicket } from '@/lib/mock-db';

export const supportService = {
  async getTickets(): Promise<SupportTicket[]> {
    const res = await api.get('/admin/support/tickets');
    return res.data.tickets;
  },

  async replyToTicket(
    id: string,
    message: string,
    status?: SupportTicket['status'],
    senderName?: string
  ): Promise<SupportTicket> {
    const res = await api.post(`/admin/support/tickets/${id}`, {
      message,
      status,
      senderName,
    });
    return res.data.ticket;
  },
};
