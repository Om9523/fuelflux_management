import {
  Invoice,
  CorporateCustomer,
  BillingConfig,
  PaymentRecord,
  CorporateBillingStats
} from '../types/corporateBilling';
import { authService } from '@/services/auth.service';

const getApi = () => authService.getApi();

const mapInvoice = (inv: any): Invoice => ({
  id: inv.id,
  invoiceNumber: inv.invoice_number,
  customerId: inv.customer_id,
  customerName: inv.customer_name || 'Unknown Customer',
  billingPeriodStart: inv.cycle_start,
  billingPeriodEnd: inv.cycle_end,
  dueDate: inv.due_date || inv.cycle_end,
  createdAt: inv.generated_at || inv.created_at,
  amount: inv.taxable_amount || inv.total_amount, // Subtotal
  gstAmount: inv.total_tax || (inv.cgst_amount + inv.sgst_amount + inv.igst_amount) || 0,
  totalAmount: inv.rounded_amount || inv.total_amount,
  status: inv.status as any, // 'paid' | 'pending' | 'overdue' | 'disputed'
  transactions: (inv.transactions || []).map((t: any) => ({
    id: t.id,
    date: t.created_at,
    vehiclePlate: t.vehicle_plate || '—',
    fuelType: t.fuel_type || 'diesel',
    liters: t.liters || 0,
    rate: t.rate || 0,
    amount: t.amount || 0,
  })),
  payments: inv.paid_at ? [{
    id: 'p_1',
    date: inv.paid_at,
    amount: inv.rounded_amount || inv.total_amount,
    paymentMode: (inv.payment_method || 'bank_transfer').toLowerCase() as any,
    referenceNumber: inv.payment_reference || '—',
  }] : [],
  emailHistory: inv.email_sent_at ? [{
    id: 'e_1',
    sentAt: inv.email_sent_at,
    recipient: inv.email_sent_to || '—',
    status: 'delivered',
  }] : [],
});

export const corporateBillingService = {
  fetchBillingStats: async (pumpId: string): Promise<CorporateBillingStats> => {
    const r = await getApi().get(`/corporate-billing/stats?pump_id=${pumpId}`);
    const data = r.data;
    return {
      totalInvoices: data.total_invoices || 0,
      pendingAmount: data.pending_amount || 0,
      paidThisMonth: data.paid_this_month || 0,
      overdueAmount: data.overdue_amount || 0,
    };
  },

  fetchInvoices: async (
    pumpId: string,
    filters?: { customerId?: string; status?: string; month?: string; search?: string }
  ): Promise<Invoice[]> => {
    let url = `/corporate-billing/invoices?pump_id=${pumpId}`;
    if (filters?.status && filters.status !== 'all') {
      url += `&status=${filters.status}`;
    }
    if (filters?.customerId && filters.customerId !== 'all') {
      url += `&customer_id=${filters.customerId}`;
    }

    const r = await getApi().get(url);
    let invoices = (r.data || []).map(mapInvoice);

    if (filters) {
      if (filters.month && filters.month !== 'all') {
        invoices = invoices.filter((i: Invoice) => {
          const invDate = new Date(i.createdAt);
          const filterYearMonth = filters.month; // e.g. "2026-07"
          const dateString = invDate.toISOString().substring(0, 7); // "YYYY-MM"
          return dateString === filterYearMonth;
        });
      }
      if (filters.search) {
        const query = filters.search.toLowerCase();
        invoices = invoices.filter(
          (i: Invoice) =>
            i.invoiceNumber.toLowerCase().includes(query) ||
            i.customerName.toLowerCase().includes(query)
        );
      }
    }

    return invoices;
  },

  fetchInvoiceDetail: async (pumpId: string, invoiceId: string): Promise<Invoice | null> => {
    const invoices = await corporateBillingService.fetchInvoices(pumpId);
    const invoice = invoices.find(i => i.id === invoiceId);
    return invoice || null;
  },

  recordPayment: async (
    pumpId: string,
    invoiceId: string,
    payload: Omit<PaymentRecord, 'id'>
  ): Promise<Invoice> => {
    const r = await getApi().patch(`/corporate-billing/invoices/${invoiceId}/mark-paid`, {
      payment_method: payload.paymentMode === 'bank_transfer' ? 'Bank Transfer' : payload.paymentMode.toUpperCase(),
      payment_reference: payload.referenceNumber,
    });
    return mapInvoice(r.data);
  },

  sendInvoiceEmail: async (pumpId: string, invoiceId: string): Promise<Invoice> => {
    const r = await getApi().post(`/corporate-billing/invoices/${invoiceId}/send-email`, {});
    return mapInvoice(r.data);
  },

  fetchBillingConfig: async (pumpId: string): Promise<BillingConfig> => {
    const r = await getApi().get(`/corporate-billing/config?pump_id=${pumpId}`);
    const config = r.data;

    return {
      pumpGstDetails: {
        gstin: config.gstin || '',
        legalName: config.pump_name || '',
        tradeName: config.pump_name || '',
        address: config.pump_address || '',
      },
      invoiceSettings: {
        prefix: config.invoice_prefix || 'INV',
        nextNumber: (config.last_invoice_number || 0) + 1,
        terms: 'Payment is due within 15 days of invoice date.',
        logoUrl: null,
      },
      billingSchedule: {
        cycle: 'monthly',
        dayOfMonth: config.billing_day || 1,
        dayOfWeek: 1,
      },
      emailSettings: {
        autoSend: !!config.cc_email,
        ccEmails: config.cc_email ? [config.cc_email] : [],
        subjectTemplate: config.default_email_subject || 'Invoice for your Udhaar Account',
        bodyTemplate: 'Please find attached your invoice.',
      },
    };
  },

  updateBillingConfig: async (pumpId: string, config: BillingConfig): Promise<BillingConfig> => {
    // Check if configuration already exists in the backend
    const checkRes = await getApi().get(`/corporate-billing/config?pump_id=${pumpId}`);
    const exists = !!(checkRes.data.id || checkRes.data._id);

    const payload = {
      pump_id: pumpId,
      pump_name: config.pumpGstDetails.legalName,
      pump_address: config.pumpGstDetails.address,
      gstin: config.pumpGstDetails.gstin,
      state_code: config.pumpGstDetails.gstin ? config.pumpGstDetails.gstin.substring(0, 2) : '27',
      default_fuel_gst_rate: 0.18, // default standard tax
      default_supply_type: 'intrastate',
      invoice_prefix: config.invoiceSettings.prefix,
      last_invoice_number: config.invoiceSettings.nextNumber - 1,
      billing_day: config.billingSchedule.dayOfMonth,
      default_email_subject: config.emailSettings.subjectTemplate,
      cc_email: config.emailSettings.ccEmails[0] || null,
    };

    if (exists) {
      await getApi().put(`/corporate-billing/config?pump_id=${pumpId}`, payload);
    } else {
      await getApi().post('/corporate-billing/config', payload);
    }

    return config;
  },

  fetchCorporateCustomers: async (pumpId: string): Promise<CorporateCustomer[]> => {
    const r = await getApi().get(`/udhaar/customers?pump_id=${pumpId}`);
    return (r.data || []).map((c: any) => ({
      id: c.id,
      name: c.name,
      gstin: c.gstin || '',
      email: c.email || '',
      phone: c.phone || '',
      address: c.address || '',
      activeContractsCount: c.is_active ? 1 : 0,
    }));
  },
};
