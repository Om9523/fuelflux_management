export interface ComplianceContact {
  id: string;
  name: string;
  phone: string;
  email: string;
  notifyWhatsApp: boolean;
  notifyEmail: boolean;
}

export type DocumentStatus = 'active' | 'expiring_soon' | 'expired' | 'pending_upload' | 'pending_verification' | 'rejected';

export interface ComplianceDocument {
  id: string;
  name: string;
  type: string; // matches DocumentTypeConfig.name
  certificateNumber: string;
  issuingAuthority: string;
  issueDate: string; // ISO string
  expiryDate: string; // ISO string
  status: DocumentStatus;
  fileUrl: string | null;
  fileName: string | null;
  uploadedAt: string | null;
  notifyContacts: ComplianceContact[];
  isVerified?: boolean;
  rejectionReason?: string | null;
}

export interface DocumentTypeConfig {
  id: string;
  name: string;
  reminderDays: number;
  isMandatory: boolean;
  isActive: boolean;
}

export interface ComplianceStats {
  total: number;
  active: number;
  expiringSoon: number;
  expired: number;
}
