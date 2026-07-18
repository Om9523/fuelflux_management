import {
  Invoice,
  CorporateCustomer,
  BillingConfig,
  InvoiceTransaction,
  PaymentRecord,
  EmailHistoryRecord
} from '../types/corporateBilling';

export const mockCorporateCustomers: CorporateCustomer[] = [
  {
    id: 'cust_1',
    name: 'Sharma Logistics & Transport',
    gstin: '27AABCS4819M1Z9',
    email: 'billing@sharmatransport.com',
    phone: '9822019283',
    address: '404 Logistics Hub, Sector 12, Kalamboli, Navi Mumbai, Maharashtra - 410218',
    activeContractsCount: 3,
  },
  {
    id: 'cust_2',
    name: 'Metropolitan Bus Service Corp',
    gstin: '27AAACM1928A2Z2',
    email: 'accounts@metrobus.org',
    phone: '2227189283',
    address: 'Depot 3, Opp Railway Station, Thane West, Maharashtra - 400601',
    activeContractsCount: 1,
  },
  {
    id: 'cust_3',
    name: 'Patel Earthmovers & Infrastructure',
    gstin: '27AABCP8837R1Z4',
    email: 'payments@patelinfra.in',
    phone: '9920198234',
    address: 'Patel House, S.V. Road, Andheri West, Mumbai, Maharashtra - 400058',
    activeContractsCount: 2,
  },
  {
    id: 'cust_4',
    name: 'Blue Dart Express Courier Ltd',
    gstin: '27AAACB0981H3Z1',
    email: 'finance.mumbai@bluedart.com',
    phone: '8877112233',
    address: 'Blue Dart Centre, Sahar Cargo Road, Andheri East, Mumbai, Maharashtra - 400099',
    activeContractsCount: 5,
  },
  {
    id: 'cust_5',
    name: 'Vikas Travels Agency',
    gstin: '27AADCV8822K1Z0',
    email: 'vikas@vikastravels.co.in',
    phone: '9167198273',
    address: 'Office No. 12, Shopping Plaza, Vashi Sector 17, Navi Mumbai, Maharashtra - 400703',
    activeContractsCount: 2,
  },
];

export const mockDefaultBillingConfig: BillingConfig = {
  pumpGstDetails: {
    gstin: '27AAGCF7829A1ZX',
    legalName: 'Flux Fuel Station Operations Pvt Ltd',
    tradeName: 'FuelFlux Express Petrol Pump',
    address: 'Plot No. 101, Sion-Panvel Highway, Vashi, Navi Mumbai, Maharashtra - 400703',
  },
  invoiceSettings: {
    prefix: 'FF/INV/',
    nextNumber: 1042,
    terms: '1. Payment due within 15 days of invoice date.\n2. Interest of 18% p.a. applicable on late payments.\n3. All disputes subject to local jurisdiction.',
    logoUrl: '/logo.png',
  },
  billingSchedule: {
    cycle: 'fortnightly',
    dayOfMonth: 15,
    dayOfWeek: 1, // Monday
  },
  emailSettings: {
    autoSend: true,
    ccEmails: ['audit@fuelflux.com', 'operations@fuelflux.com'],
    subjectTemplate: 'FuelFlux Invoice {invoice_number} for {billing_period}',
    bodyTemplate: 'Dear Customer,\n\nPlease find attached the invoice {invoice_number} for the billing period {billing_period}.\n\nTotal Due Amount: INR {total_amount}\nDue Date: {due_date}\n\nFor queries, reply to this email.\n\nBest Regards,\nFuelFlux Billing Team',
  },
};

const getPastISOString = (days: number): string => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().split('T')[0];
};

const getFutureISOString = (days: number): string => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
};

export const mockInvoices: Invoice[] = [
  {
    id: 'inv_1',
    invoiceNumber: 'FF/INV/1031',
    customerId: 'cust_1',
    customerName: 'Sharma Logistics & Transport',
    billingPeriodStart: getPastISOString(45),
    billingPeriodEnd: getPastISOString(30),
    dueDate: getPastISOString(15),
    createdAt: getPastISOString(30),
    amount: 150000,
    gstAmount: 27000, // 18%
    totalAmount: 177000,
    status: 'paid',
    transactions: [
      { id: 't_1', date: getPastISOString(44), vehiclePlate: 'MH12QW9921', fuelType: 'diesel', liters: 500, rate: 90, amount: 45000 },
      { id: 't_2', date: getPastISOString(40), vehiclePlate: 'MH12QW9922', fuelType: 'diesel', liters: 600, rate: 90, amount: 54000 },
      { id: 't_3', date: getPastISOString(35), vehiclePlate: 'MH12QW9921', fuelType: 'diesel', liters: 566.67, rate: 90, amount: 51000 },
    ],
    payments: [
      { id: 'p_1', date: getPastISOString(20), amount: 177000, paymentMode: 'bank_transfer', referenceNumber: 'TXN889201882' },
    ],
    emailHistory: [
      { id: 'e_1', sentAt: getPastISOString(30) + 'T09:30:00Z', recipient: 'billing@sharmatransport.com', status: 'opened' },
    ],
  },
  {
    id: 'inv_2',
    invoiceNumber: 'FF/INV/1032',
    customerId: 'cust_2',
    customerName: 'Metropolitan Bus Service Corp',
    billingPeriodStart: getPastISOString(35),
    billingPeriodEnd: getPastISOString(20),
    dueDate: getPastISOString(5),
    createdAt: getPastISOString(20),
    amount: 320000,
    gstAmount: 57600,
    totalAmount: 377600,
    status: 'overdue',
    transactions: [
      { id: 't_4', date: getPastISOString(34), vehiclePlate: 'MH04GP1204', fuelType: 'cng', liters: 1200, rate: 80, amount: 96000 },
      { id: 't_5', date: getPastISOString(28), vehiclePlate: 'MH04GP1205', fuelType: 'cng', liters: 1400, rate: 80, amount: 112000 },
      { id: 't_6', date: getPastISOString(22), vehiclePlate: 'MH04GP1204', fuelType: 'cng', liters: 1400, rate: 80, amount: 112000 },
    ],
    payments: [],
    emailHistory: [
      { id: 'e_2', sentAt: getPastISOString(20) + 'T10:00:00Z', recipient: 'accounts@metrobus.org', status: 'delivered' },
      { id: 'e_3', sentAt: getPastISOString(5) + 'T18:00:00Z', recipient: 'accounts@metrobus.org', status: 'opened' }, // overdue reminder
    ],
  },
  {
    id: 'inv_3',
    invoiceNumber: 'FF/INV/1033',
    customerId: 'cust_3',
    customerName: 'Patel Earthmovers & Infrastructure',
    billingPeriodStart: getPastISOString(30),
    billingPeriodEnd: getPastISOString(15),
    dueDate: getPastISOString(0),
    createdAt: getPastISOString(15),
    amount: 95000,
    gstAmount: 17100,
    totalAmount: 112100,
    status: 'paid',
    transactions: [
      { id: 't_7', date: getPastISOString(29), vehiclePlate: 'MH43AA9911', fuelType: 'diesel', liters: 600, rate: 95, amount: 57000 },
      { id: 't_8', date: getPastISOString(20), vehiclePlate: 'MH43AA9912', fuelType: 'diesel', liters: 400, rate: 95, amount: 38000 },
    ],
    payments: [
      { id: 'p_2', date: getPastISOString(1) + 'T14:20:00Z', amount: 112100, paymentMode: 'upi', referenceNumber: 'UPI293810293' },
    ],
    emailHistory: [
      { id: 'e_4', sentAt: getPastISOString(15) + 'T09:00:00Z', recipient: 'payments@patelinfra.in', status: 'opened' },
    ],
  },
  {
    id: 'inv_4',
    invoiceNumber: 'FF/INV/1034',
    customerId: 'cust_4',
    customerName: 'Blue Dart Express Courier Ltd',
    billingPeriodStart: getPastISOString(15),
    billingPeriodEnd: getPastISOString(0),
    dueDate: getFutureISOString(15),
    createdAt: getPastISOString(0),
    amount: 540000,
    gstAmount: 97200,
    totalAmount: 637200,
    status: 'pending',
    transactions: [
      { id: 't_9', date: getPastISOString(14), vehiclePlate: 'MH02BD1101', fuelType: 'petrol', liters: 2000, rate: 100, amount: 200000 },
      { id: 't_10', date: getPastISOString(10), vehiclePlate: 'MH02BD1102', fuelType: 'petrol', liters: 1800, rate: 100, amount: 180000 },
      { id: 't_11', date: getPastISOString(5), vehiclePlate: 'MH02BD1103', fuelType: 'petrol', liters: 1600, rate: 100, amount: 160000 },
    ],
    payments: [],
    emailHistory: [
      { id: 'e_5', sentAt: getPastISOString(0) + 'T11:00:00Z', recipient: 'finance.mumbai@bluedart.com', status: 'opened' },
    ],
  },
  {
    id: 'inv_5',
    invoiceNumber: 'FF/INV/1035',
    customerId: 'cust_5',
    customerName: 'Vikas Travels Agency',
    billingPeriodStart: getPastISOString(15),
    billingPeriodEnd: getPastISOString(0),
    dueDate: getFutureISOString(15),
    createdAt: getPastISOString(0),
    amount: 88000,
    gstAmount: 15840,
    totalAmount: 103840,
    status: 'pending',
    transactions: [
      { id: 't_12', date: getPastISOString(12), vehiclePlate: 'MH46V1001', fuelType: 'diesel', liters: 500, rate: 92, amount: 46000 },
      { id: 't_13', date: getPastISOString(4), vehiclePlate: 'MH46V1002', fuelType: 'diesel', liters: 456.52, rate: 92, amount: 42000 },
    ],
    payments: [],
    emailHistory: [
      { id: 'e_6', sentAt: getPastISOString(0) + 'T11:15:00Z', recipient: 'vikas@vikastravels.co.in', status: 'delivered' },
    ],
  },
  {
    id: 'inv_6',
    invoiceNumber: 'FF/INV/1036',
    customerId: 'cust_1',
    customerName: 'Sharma Logistics & Transport',
    billingPeriodStart: getPastISOString(15),
    billingPeriodEnd: getPastISOString(0),
    dueDate: getFutureISOString(15),
    createdAt: getPastISOString(0),
    amount: 120000,
    gstAmount: 21600,
    totalAmount: 141600,
    status: 'pending',
    transactions: [
      { id: 't_14', date: getPastISOString(13), vehiclePlate: 'MH12QW9921', fuelType: 'diesel', liters: 666.67, rate: 90, amount: 60000 },
      { id: 't_15', date: getPastISOString(7), vehiclePlate: 'MH12QW9922', fuelType: 'diesel', liters: 666.67, rate: 90, amount: 60000 },
    ],
    payments: [],
    emailHistory: [
      { id: 'e_7', sentAt: getPastISOString(0) + 'T12:00:00Z', recipient: 'billing@sharmatransport.com', status: 'opened' },
    ],
  },
  {
    id: 'inv_7',
    invoiceNumber: 'FF/INV/1037',
    customerId: 'cust_3',
    customerName: 'Patel Earthmovers & Infrastructure',
    billingPeriodStart: getPastISOString(50),
    billingPeriodEnd: getPastISOString(35),
    dueDate: getPastISOString(20),
    createdAt: getPastISOString(35),
    amount: 110000,
    gstAmount: 19800,
    totalAmount: 129800,
    status: 'paid',
    transactions: [
      { id: 't_16', date: getPastISOString(48), vehiclePlate: 'MH43AA9911', fuelType: 'diesel', liters: 1157.89, rate: 95, amount: 110000 },
    ],
    payments: [
      { id: 'p_3', date: getPastISOString(25), amount: 129800, paymentMode: 'bank_transfer', referenceNumber: 'TXN77823901' },
    ],
    emailHistory: [
      { id: 'e_8', sentAt: getPastISOString(35) + 'T14:00:00Z', recipient: 'payments@patelinfra.in', status: 'opened' },
    ],
  },
  {
    id: 'inv_8',
    invoiceNumber: 'FF/INV/1038',
    customerId: 'cust_2',
    customerName: 'Metropolitan Bus Service Corp',
    billingPeriodStart: getPastISOString(65),
    billingPeriodEnd: getPastISOString(50),
    dueDate: getPastISOString(35),
    createdAt: getPastISOString(50),
    amount: 280000,
    gstAmount: 50400,
    totalAmount: 330400,
    status: 'paid',
    transactions: [
      { id: 't_17', date: getPastISOString(60), vehiclePlate: 'MH04GP1204', fuelType: 'cng', liters: 3500, rate: 80, amount: 280000 },
    ],
    payments: [
      { id: 'p_4', date: getPastISOString(36), amount: 330400, paymentMode: 'bank_transfer', referenceNumber: 'TXN889201991' },
    ],
    emailHistory: [
      { id: 'e_9', sentAt: getPastISOString(50) + 'T09:15:00Z', recipient: 'accounts@metrobus.org', status: 'opened' },
    ],
  },
  {
    id: 'inv_9',
    invoiceNumber: 'FF/INV/1039',
    customerId: 'cust_4',
    customerName: 'Blue Dart Express Courier Ltd',
    billingPeriodStart: getPastISOString(60),
    billingPeriodEnd: getPastISOString(45),
    dueDate: getPastISOString(30),
    createdAt: getPastISOString(45),
    amount: 480000,
    gstAmount: 86400,
    totalAmount: 566400,
    status: 'overdue',
    transactions: [
      { id: 't_18', date: getPastISOString(58), vehiclePlate: 'MH02BD1101', fuelType: 'petrol', liters: 4800, rate: 100, amount: 480000 },
    ],
    payments: [],
    emailHistory: [
      { id: 'e_10', sentAt: getPastISOString(45) + 'T10:15:00Z', recipient: 'finance.mumbai@bluedart.com', status: 'delivered' },
      { id: 'e_11', sentAt: getPastISOString(30) + 'T10:30:00Z', recipient: 'finance.mumbai@bluedart.com', status: 'opened' }, // overdue warning
    ],
  },
  {
    id: 'inv_10',
    invoiceNumber: 'FF/INV/1040',
    customerId: 'cust_5',
    customerName: 'Vikas Travels Agency',
    billingPeriodStart: getPastISOString(45),
    billingPeriodEnd: getPastISOString(30),
    dueDate: getPastISOString(15),
    createdAt: getPastISOString(30),
    amount: 72000,
    gstAmount: 12960,
    totalAmount: 84960,
    status: 'overdue',
    transactions: [
      { id: 't_19', date: getPastISOString(40), vehiclePlate: 'MH46V1001', fuelType: 'diesel', liters: 782.61, rate: 92, amount: 72000 },
    ],
    payments: [],
    emailHistory: [
      { id: 'e_12', sentAt: getPastISOString(30) + 'T09:00:00Z', recipient: 'vikas@vikastravels.co.in', status: 'delivered' },
    ],
  },
];
