import {
  Invoice,
  CorporateCustomer,
  BillingConfig,
  PaymentRecord,
  EmailHistoryRecord,
  CorporateBillingStats
} from '../types/corporateBilling';
import {
  mockInvoices,
  mockCorporateCustomers,
  mockDefaultBillingConfig
} from '../mock/corporateBilling';

const INVOICES_KEY = 'fuelflux_billing_invoices';
const CUSTOMERS_KEY = 'fuelflux_billing_customers';
const CONFIG_KEY = 'fuelflux_billing_config';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const getStoredInvoices = (): Invoice[] => {
  if (typeof window === 'undefined') return mockInvoices;
  const stored = localStorage.getItem(INVOICES_KEY);
  if (!stored) {
    localStorage.setItem(INVOICES_KEY, JSON.stringify(mockInvoices));
    return mockInvoices;
  }
  return JSON.parse(stored);
};

const setStoredInvoices = (invoices: Invoice[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(INVOICES_KEY, JSON.stringify(invoices));
  }
};

const getStoredCustomers = (): CorporateCustomer[] => {
  if (typeof window === 'undefined') return mockCorporateCustomers;
  const stored = localStorage.getItem(CUSTOMERS_KEY);
  if (!stored) {
    localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(mockCorporateCustomers));
    return mockCorporateCustomers;
  }
  return JSON.parse(stored);
};

const getStoredConfig = (): BillingConfig => {
  if (typeof window === 'undefined') return mockDefaultBillingConfig;
  const stored = localStorage.getItem(CONFIG_KEY);
  if (!stored) {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(mockDefaultBillingConfig));
    return mockDefaultBillingConfig;
  }
  return JSON.parse(stored);
};

const setStoredConfig = (config: BillingConfig) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
  }
};

// Sync invoice statuses based on due dates and payments
const syncInvoiceStatuses = (invoices: Invoice[]): Invoice[] => {
  const now = new Date();
  return invoices.map(inv => {
    // If total paid equals or exceeds totalAmount, status is 'paid'
    const totalPaid = inv.payments.reduce((acc, p) => acc + p.amount, 0);
    if (totalPaid >= inv.totalAmount) {
      return { ...inv, status: 'paid' };
    }
    
    // Otherwise, check if overdue
    const dueDate = new Date(inv.dueDate);
    if (dueDate < now) {
      return { ...inv, status: 'overdue' };
    }
    
    return { ...inv, status: 'pending' };
  });
};

export const corporateBillingService = {
  fetchBillingStats: async (pumpId: string): Promise<CorporateBillingStats> => {
    await sleep(400);
    const invoices = syncInvoiceStatuses(getStoredInvoices());
    
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const pendingAmount = invoices
      .filter(i => i.status !== 'paid')
      .reduce((acc, i) => acc + (i.totalAmount - i.payments.reduce((sum, p) => sum + p.amount, 0)), 0);

    const paidThisMonth = invoices
      .filter(i => i.status === 'paid')
      .flatMap(i => i.payments)
      .filter(p => {
        const pDate = new Date(p.date);
        return pDate.getMonth() === currentMonth && pDate.getFullYear() === currentYear;
      })
      .reduce((acc, p) => acc + p.amount, 0);

    const overdueAmount = invoices
      .filter(i => i.status === 'overdue')
      .reduce((acc, i) => acc + (i.totalAmount - i.payments.reduce((sum, p) => sum + p.amount, 0)), 0);

    return {
      totalInvoices: invoices.length,
      pendingAmount,
      paidThisMonth,
      overdueAmount,
    };
  },

  fetchInvoices: async (
    pumpId: string,
    filters?: { customerId?: string; status?: string; month?: string; search?: string }
  ): Promise<Invoice[]> => {
    await sleep(500);
    let invoices = syncInvoiceStatuses(getStoredInvoices());

    if (filters) {
      if (filters.customerId && filters.customerId !== 'all') {
        invoices = invoices.filter(i => i.customerId === filters.customerId);
      }
      if (filters.status && filters.status !== 'all') {
        invoices = invoices.filter(i => i.status === filters.status);
      }
      if (filters.month && filters.month !== 'all') {
        invoices = invoices.filter(i => {
          const invDate = new Date(i.createdAt);
          const filterYearMonth = filters.month; // e.g. "2026-07"
          const dateString = invDate.toISOString().substring(0, 7); // "YYYY-MM"
          return dateString === filterYearMonth;
        });
      }
      if (filters.search) {
        const query = filters.search.toLowerCase();
        invoices = invoices.filter(
          i =>
            i.invoiceNumber.toLowerCase().includes(query) ||
            i.customerName.toLowerCase().includes(query)
        );
      }
    }

    return invoices;
  },

  fetchInvoiceDetail: async (pumpId: string, invoiceId: string): Promise<Invoice | null> => {
    await sleep(400);
    const invoices = syncInvoiceStatuses(getStoredInvoices());
    const invoice = invoices.find(i => i.id === invoiceId);
    return invoice || null;
  },

  recordPayment: async (
    pumpId: string,
    invoiceId: string,
    payload: Omit<PaymentRecord, 'id'>
  ): Promise<Invoice> => {
    await sleep(800);
    const invoices = getStoredInvoices();
    const invIdx = invoices.findIndex(i => i.id === invoiceId);
    if (invIdx === -1) throw new Error('Invoice not found');

    const invoice = invoices[invIdx];
    const newPayment: PaymentRecord = {
      ...payload,
      id: 'pay_' + Math.random().toString(36).substr(2, 9),
    };

    const updatedInvoice = {
      ...invoice,
      payments: [...invoice.payments, newPayment],
    };

    invoices[invIdx] = updatedInvoice;
    
    // Status syncing is automatically handled
    const synced = syncInvoiceStatuses(invoices);
    setStoredInvoices(synced);

    return synced.find(i => i.id === invoiceId)!;
  },

  sendInvoiceEmail: async (pumpId: string, invoiceId: string): Promise<Invoice> => {
    await sleep(600);
    const invoices = getStoredInvoices();
    const invIdx = invoices.findIndex(i => i.id === invoiceId);
    if (invIdx === -1) throw new Error('Invoice not found');

    const invoice = invoices[invIdx];
    const customers = getStoredCustomers();
    const customer = customers.find(c => c.id === invoice.customerId);
    const emailRecipient = customer ? customer.email : 'customer@billing.com';

    const newEmailLog: EmailHistoryRecord = {
      id: 'e_' + Math.random().toString(36).substr(2, 9),
      sentAt: new Date().toISOString(),
      recipient: emailRecipient,
      status: 'delivered',
    };

    const updatedInvoice = {
      ...invoice,
      emailHistory: [newEmailLog, ...invoice.emailHistory],
    };

    invoices[invIdx] = updatedInvoice;
    setStoredInvoices(invoices);

    return updatedInvoice;
  },

  fetchBillingConfig: async (pumpId: string): Promise<BillingConfig> => {
    await sleep(300);
    return getStoredConfig();
  },

  updateBillingConfig: async (pumpId: string, config: BillingConfig): Promise<BillingConfig> => {
    await sleep(600);
    setStoredConfig(config);
    return config;
  },

  fetchCorporateCustomers: async (pumpId: string): Promise<CorporateCustomer[]> => {
    await sleep(300);
    return getStoredCustomers();
  },
};
