import { ComplianceDocument, ComplianceStats, DocumentTypeConfig } from '../types/compliance';
import { authService } from '@/services/auth.service';

const getApi = () => authService.getApi();

// Get the base API url to format static file paths
const getStaticUrl = () => {
  const base = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api/v1';
  return base.replace('/api/v1', '');
};

const mapDocument = (doc: any): ComplianceDocument => ({
  id: doc.id,
  name: doc.doc_type_name,
  type: doc.doc_type_name,
  certificateNumber: doc.certificate_number,
  issuingAuthority: doc.issuing_authority || '',
  issueDate: doc.issue_date,
  expiryDate: doc.expiry_date,
  status: doc.status,
  fileUrl: doc.file_url ? `${getStaticUrl()}${doc.file_url}` : null,
  fileName: doc.file_name || null,
  uploadedAt: doc.created_at || null,
  isVerified: doc.is_verified || false,
  rejectionReason: doc.rejection_reason || null,
  notifyContacts: (doc.notify_contacts || []).map((nc: any, idx: number) => ({
    id: `nc_${idx}`,
    name: nc.name,
    phone: nc.phone,
    email: nc.email,
    notifyWhatsApp: nc.via?.includes('whatsapp') || false,
    notifyEmail: nc.via?.includes('email') || false,
  }))
});

export const complianceService = {
  fetchComplianceStats: async (pumpId: string): Promise<ComplianceStats> => {
    const r = await getApi().get(`/compliance/dashboard?pump_id=${pumpId}`);
    const data = r.data;
    return {
      total: data.total || 0,
      active: data.active || 0,
      expiringSoon: data.expiring_soon || 0,
      expired: data.expired || 0,
    };
  },

  fetchDocuments: async (
    pumpId: string,
    filters?: { search?: string; status?: string; type?: string }
  ): Promise<ComplianceDocument[]> => {
    const r = await getApi().get(`/compliance/documents?pump_id=${pumpId}`);
    let docs = (r.data || []).map(mapDocument);

    if (filters) {
      if (filters.search) {
        const query = filters.search.toLowerCase();
        docs = docs.filter(
          (d: ComplianceDocument) =>
            d.name.toLowerCase().includes(query) ||
            d.certificateNumber.toLowerCase().includes(query) ||
            d.issuingAuthority.toLowerCase().includes(query)
        );
      }
      if (filters.status && filters.status !== 'all') {
        docs = docs.filter((d: ComplianceDocument) => d.status === filters.status);
      }
      if (filters.type && filters.type !== 'all') {
        docs = docs.filter((d: ComplianceDocument) => d.type === filters.type);
      }
    }

    return docs;
  },

  uploadDocument: async (
    pumpId: string,
    payload: Omit<ComplianceDocument, 'id' | 'status' | 'fileUrl' | 'uploadedAt' | 'fileName'> & { file: File | null }
  ): Promise<ComplianceDocument> => {
    // 1. Fetch types to match payload.type (which is name) to doc_type_id
    const types = await complianceService.fetchSettings(pumpId);
    const matchedType = types.find(t => t.name === payload.type);
    const docTypeId = matchedType ? matchedType.id : payload.type;

    // 2. Prepare FormData
    const formData = new FormData();
    formData.append('pump_id', pumpId);
    formData.append('doc_type_id', docTypeId);
    formData.append('certificate_number', payload.certificateNumber);
    formData.append('issuing_authority', payload.issuingAuthority);
    formData.append('issue_date', payload.issueDate);
    formData.append('expiry_date', payload.expiryDate);
    if (payload.file) {
      formData.append('file', payload.file);
    }

    const r = await getApi().post('/compliance/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    const createdDoc = mapDocument(r.data);

    // 3. Save notification contacts if present
    if (payload.notifyContacts && payload.notifyContacts.length > 0) {
      const contactsPayload = {
        contacts: payload.notifyContacts.map(c => ({
          name: c.name,
          phone: c.phone,
          email: c.email,
          via: [
            ...(c.notifyWhatsApp ? ['whatsapp'] : []),
            ...(c.notifyEmail ? ['email'] : []),
          ],
        })),
      };
      await getApi().patch(`/compliance/documents/${createdDoc.id}/contacts`, contactsPayload);
    }

    return createdDoc;
  },

  renewDocument: async (
    pumpId: string,
    documentId: string,
    payload: {
      certificateNumber: string;
      issueDate: string;
      expiryDate: string;
      file: File | null;
    }
  ): Promise<ComplianceDocument> => {
    const formData = new FormData();
    formData.append('certificate_number', payload.certificateNumber);
    formData.append('issue_date', payload.issueDate);
    formData.append('expiry_date', payload.expiryDate);
    if (payload.file) {
      formData.append('file', payload.file);
    }

    const r = await getApi().put(`/compliance/documents/${documentId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return mapDocument(r.data);
  },

  deleteDocument: async (pumpId: string, documentId: string): Promise<void> => {
    await getApi().delete(`/compliance/documents/${documentId}`);
  },

  fetchSettings: async (pumpId: string): Promise<DocumentTypeConfig[]> => {
    const r = await getApi().get(`/compliance/types?pump_id=${pumpId}`);
    return (r.data || []).map((t: any) => ({
      id: String(t.id || t._id),
      name: t.name,
      reminderDays: t.reminder_days && t.reminder_days.length > 0 ? t.reminder_days[0] : 30,
      isMandatory: t.is_mandatory || false,
      isActive: t.is_active !== false,
    }));
  },

  saveSettings: async (pumpId: string, configs: DocumentTypeConfig[]): Promise<DocumentTypeConfig[]> => {
    // Sync current list with backend
    const existingList = await complianceService.fetchSettings(pumpId);

    for (const config of configs) {
      const isNew = config.id.startsWith('dt_custom_');
      if (isNew) {
        // Create new type config
        await getApi().post('/compliance/types', {
          pump_id: pumpId,
          name: config.name,
          category: 'Custom',
          is_mandatory: config.isMandatory,
          reminder_days: [config.reminderDays],
        });
      } else {
        // Update existing type config
        await getApi().patch(`/compliance/types/${config.id}`, {
          name: config.name,
          is_mandatory: config.isMandatory,
          reminder_days: [config.reminderDays],
        });
      }
    }

    // Identify deleted configs (in existing list but missing in new configs)
    const activeIds = new Set(configs.map(c => c.id));
    for (const existing of existingList) {
      if (!activeIds.has(existing.id)) {
        await getApi().delete(`/compliance/types/${existing.id}`);
      }
    }

    return configs;
  },

  verifyDocument: async (
    pumpId: string,
    documentId: string,
    status: 'verified' | 'rejected',
    rejectionReason?: string
  ): Promise<any> => {
    const r = await getApi().patch(`/compliance/documents/${documentId}/verify`, {
      status,
      rejection_reason: rejectionReason,
    });
    return r.data;
  },
};
