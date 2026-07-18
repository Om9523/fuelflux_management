import { ComplianceDocument, DocumentTypeConfig, ComplianceContact } from '../types/compliance';

export const mockDocumentTypes: DocumentTypeConfig[] = [
  { id: 'dt_1', name: 'PESO Explosives License', reminderDays: 60, isMandatory: true, isActive: true },
  { id: 'dt_2', name: 'Fire Safety NOC', reminderDays: 30, isMandatory: true, isActive: true },
  { id: 'dt_3', name: 'Air & Water Pollution Certificate', reminderDays: 30, isMandatory: false, isActive: true },
  { id: 'dt_4', name: 'Weights & Measures Stamp', reminderDays: 15, isMandatory: true, isActive: true },
  { id: 'dt_5', name: 'GST Registration Certificate', reminderDays: 0, isMandatory: true, isActive: true },
  { id: 'dt_6', name: 'Retail Outlet License', reminderDays: 90, isMandatory: true, isActive: true },
  { id: 'dt_7', name: 'Storage Licence for Petroleum', reminderDays: 45, isMandatory: true, isActive: true },
];

export const mockContacts: ComplianceContact[] = [
  { id: 'c_1', name: 'Ramesh Sharma', phone: '9876543210', email: 'ramesh@fuelflux.com', notifyWhatsApp: true, notifyEmail: true },
  { id: 'c_2', name: 'Sanjay Verma', phone: '9123456789', email: 'sanjay@fuelflux.com', notifyWhatsApp: false, notifyEmail: true },
  { id: 'c_3', name: 'Ankita Patel', phone: '9988776655', email: 'ankita.p@fuelflux.com', notifyWhatsApp: true, notifyEmail: false },
];

const getFutureDate = (days: number): string => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
};

const getPastDate = (days: number): string => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().split('T')[0];
};

export const mockDocuments: ComplianceDocument[] = [
  {
    id: 'doc_1',
    name: 'PESO Explosives License 2026',
    type: 'PESO Explosives License',
    certificateNumber: 'EXP/MH/2021/9921',
    issuingAuthority: 'Petroleum and Explosives Safety Organisation (PESO)',
    issueDate: getPastDate(300),
    expiryDate: getFutureDate(180), // active
    status: 'active',
    fileUrl: '/uploads/documents/peso_license.pdf',
    fileName: 'peso_license_2026.pdf',
    uploadedAt: getPastDate(300),
    notifyContacts: [mockContacts[0], mockContacts[1]],
  },
  {
    id: 'doc_2',
    name: 'Fire Safety NOC Phase 1',
    type: 'Fire Safety NOC',
    certificateNumber: 'FS/NOC/2025/112',
    issuingAuthority: 'Maharashtra State Fire Services',
    issueDate: getPastDate(340),
    expiryDate: getFutureDate(12), // expiring_soon
    status: 'expiring_soon',
    fileUrl: '/uploads/documents/fire_noc_2025.pdf',
    fileName: 'fire_noc_2025.pdf',
    uploadedAt: getPastDate(340),
    notifyContacts: [mockContacts[0], mockContacts[2]],
  },
  {
    id: 'doc_3',
    name: 'Air & Water Consent to Operate',
    type: 'Air & Water Pollution Certificate',
    certificateNumber: 'MPCB/CTO/99238',
    issuingAuthority: 'Maharashtra Pollution Control Board',
    issueDate: getPastDate(700),
    expiryDate: getPastDate(15), // expired
    status: 'expired',
    fileUrl: '/uploads/documents/pollution_consent.pdf',
    fileName: 'pollution_consent_old.pdf',
    uploadedAt: getPastDate(700),
    notifyContacts: [mockContacts[1]],
  },
  {
    id: 'doc_4',
    name: 'Weights & Measures Stamp (Dispenser A)',
    type: 'Weights & Measures Stamp',
    certificateNumber: 'WM/VER/2026/088',
    issuingAuthority: 'Department of Legal Metrology',
    issueDate: getPastDate(100),
    expiryDate: getFutureDate(250), // active
    status: 'active',
    fileUrl: '/uploads/documents/wm_dispenser_a.pdf',
    fileName: 'wm_dispenser_a.pdf',
    uploadedAt: getPastDate(100),
    notifyContacts: [mockContacts[0]],
  },
  {
    id: 'doc_5',
    name: 'Weights & Measures Stamp (Dispenser B)',
    type: 'Weights & Measures Stamp',
    certificateNumber: 'WM/VER/2026/089',
    issuingAuthority: 'Department of Legal Metrology',
    issueDate: getPastDate(350),
    expiryDate: getFutureDate(8), // expiring_soon
    status: 'expiring_soon',
    fileUrl: '/uploads/documents/wm_dispenser_b.pdf',
    fileName: 'wm_dispenser_b.pdf',
    uploadedAt: getPastDate(350),
    notifyContacts: [mockContacts[0], mockContacts[1], mockContacts[2]],
  },
  {
    id: 'doc_6',
    name: 'GST Registration Certificate',
    type: 'GST Registration Certificate',
    certificateNumber: '27AADCF1204R1Z5',
    issuingAuthority: 'GSTIN Authority India',
    issueDate: getPastDate(1500),
    expiryDate: getFutureDate(3000), // active
    status: 'active',
    fileUrl: '/uploads/documents/gst_cert.pdf',
    fileName: 'gst_certificate.pdf',
    uploadedAt: getPastDate(1500),
    notifyContacts: [],
  },
  {
    id: 'doc_7',
    name: 'Retail Outlet Dealership Licence',
    type: 'Retail Outlet License',
    certificateNumber: 'RO/DEALER/IOCL/984',
    issuingAuthority: 'Indian Oil Corporation Ltd.',
    issueDate: getPastDate(600),
    expiryDate: getFutureDate(1200), // active
    status: 'active',
    fileUrl: '/uploads/documents/dealership_licence.pdf',
    fileName: 'dealership_licence.pdf',
    uploadedAt: getPastDate(600),
    notifyContacts: [mockContacts[1]],
  },
  {
    id: 'doc_8',
    name: 'Petroleum Storage License A',
    type: 'Storage Licence for Petroleum',
    certificateNumber: 'PET/STR/8834',
    issuingAuthority: 'Petroleum and Explosives Safety Organisation (PESO)',
    issueDate: getPastDate(320),
    expiryDate: getPastDate(5), // expired
    status: 'expired',
    fileUrl: '/uploads/documents/storage_license_a.pdf',
    fileName: 'storage_license_a.pdf',
    uploadedAt: getPastDate(320),
    notifyContacts: [mockContacts[0], mockContacts[1]],
  },
  {
    id: 'doc_9',
    name: 'Weights & Measures Stamp (Dispenser C)',
    type: 'Weights & Measures Stamp',
    certificateNumber: 'WM/VER/2026/090',
    issuingAuthority: 'Department of Legal Metrology',
    issueDate: getPastDate(50),
    expiryDate: getFutureDate(300), // active
    status: 'active',
    fileUrl: '/uploads/documents/wm_dispenser_c.pdf',
    fileName: 'wm_dispenser_c.pdf',
    uploadedAt: getPastDate(50),
    notifyContacts: [],
  },
  {
    id: 'doc_10',
    name: 'Hydrotest Verification Certificate',
    type: 'Storage Licence for Petroleum',
    certificateNumber: 'HYD/VER/2024/991',
    issuingAuthority: 'PESO Authorized Hydrotesting agency',
    issueDate: getPastDate(720),
    expiryDate: getFutureDate(370), // active
    status: 'active',
    fileUrl: '/uploads/documents/hydrotest_cert.pdf',
    fileName: 'hydrotest_cert.pdf',
    uploadedAt: getPastDate(718),
    notifyContacts: [mockContacts[2]],
  },
  {
    id: 'doc_11',
    name: 'Air Pollution NOC 2026',
    type: 'Air & Water Pollution Certificate',
    certificateNumber: 'MPCB/AP/092834',
    issuingAuthority: 'Maharashtra Pollution Control Board',
    issueDate: getPastDate(350),
    expiryDate: getFutureDate(15), // expiring_soon
    status: 'expiring_soon',
    fileUrl: '/uploads/documents/air_noc_2026.pdf',
    fileName: 'air_noc_2026.pdf',
    uploadedAt: getPastDate(350),
    notifyContacts: [mockContacts[0]],
  },
  {
    id: 'doc_12',
    name: 'Weights & Measures Stamp (Dispenser D)',
    type: 'Weights & Measures Stamp',
    certificateNumber: 'WM/VER/2026/091',
    issuingAuthority: 'Department of Legal Metrology',
    issueDate: getPastDate(360),
    expiryDate: getPastDate(5), // expired
    status: 'expired',
    fileUrl: '/uploads/documents/wm_dispenser_d.pdf',
    fileName: 'wm_dispenser_d.pdf',
    uploadedAt: getPastDate(360),
    notifyContacts: [mockContacts[1], mockContacts[2]],
  },
  {
    id: 'doc_13',
    name: 'Water Quality Inspection NOC',
    type: 'Air & Water Pollution Certificate',
    certificateNumber: 'WQI/NOC/2723',
    issuingAuthority: 'Municipal Drinking Water Authority',
    issueDate: getPastDate(80),
    expiryDate: getFutureDate(285), // active
    status: 'active',
    fileUrl: '/uploads/documents/water_noc.pdf',
    fileName: 'water_noc.pdf',
    uploadedAt: getPastDate(80),
    notifyContacts: [],
  },
  {
    id: 'doc_14',
    name: 'Calibration Chart Verification',
    type: 'Weights & Measures Stamp',
    certificateNumber: 'CAL/VER/271A',
    issuingAuthority: 'Department of Legal Metrology',
    issueDate: getPastDate(30),
    expiryDate: getFutureDate(335),
    fileUrl: null,
    fileName: null,
    uploadedAt: null,
    status: 'pending_upload', // pending upload
    notifyContacts: [mockContacts[0]],
  },
  {
    id: 'doc_15',
    name: 'Structural Stability Certificate NOC',
    type: 'Fire Safety NOC',
    certificateNumber: 'STR/STAB/881',
    issuingAuthority: 'PWD Civil Engineering Department',
    issueDate: getPastDate(90),
    expiryDate: getFutureDate(275), // active
    status: 'active',
    fileUrl: '/uploads/documents/struct_stability.pdf',
    fileName: 'struct_stability.pdf',
    uploadedAt: getPastDate(90),
    notifyContacts: [mockContacts[1]],
  },
];
