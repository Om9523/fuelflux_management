export type InvoiceStatus = 'paid' | 'pending' | 'overdue';

export interface InvoiceTransaction {
  id: string;
  date: string;
  vehiclePlate: string;
  fuelType: 'petrol' | 'diesel' | 'cng';
  liters: number;
  rate: number;
  amount: number;
}

export interface PaymentRecord {
  id: string;
  date: string;
  amount: number;
  paymentMode: 'cash' | 'card' | 'bank_transfer' | 'upi';
  referenceNumber: string;
}

export interface EmailHistoryRecord {
  id: string;
  sentAt: string;
  recipient: string;
  status: 'delivered' | 'failed' | 'opened';
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  billingPeriodStart: string; // ISO date string
  billingPeriodEnd: string; // ISO date string
  dueDate: string; // ISO date string
  createdAt: string; // ISO date string
  amount: number; // Subtotal
  gstAmount: number; // GST total
  totalAmount: number; // total = amount + gstAmount
  status: InvoiceStatus;
  transactions: InvoiceTransaction[];
  payments: PaymentRecord[];
  emailHistory: EmailHistoryRecord[];
}

export interface CorporateCustomer {
  id: string;
  name: string;
  gstin: string;
  email: string;
  phone: string;
  address: string;
  activeContractsCount: number;
}

export interface PumpGstDetails {
  gstin: string;
  legalName: string;
  tradeName: string;
  address: string;
}

export interface InvoiceSettings {
  prefix: string;
  nextNumber: number;
  terms: string;
  logoUrl: string | null;
}

export interface BillingSchedule {
  cycle: 'weekly' | 'fortnightly' | 'monthly';
  dayOfMonth: number; // 1-28 for monthly
  dayOfWeek: number; // 0-6 for weekly (Sunday = 0)
}

export interface EmailSettings {
  autoSend: boolean;
  ccEmails: string[];
  subjectTemplate: string;
  bodyTemplate: string;
}

export interface BillingConfig {
  pumpGstDetails: PumpGstDetails;
  invoiceSettings: InvoiceSettings;
  billingSchedule: BillingSchedule;
  emailSettings: EmailSettings;
}

export interface CorporateBillingStats {
  totalInvoices: number;
  pendingAmount: number;
  paidThisMonth: number;
  overdueAmount: number;
}
