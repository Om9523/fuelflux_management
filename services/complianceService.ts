import { ComplianceDocument, ComplianceStats, DocumentTypeConfig } from '../types/compliance';
import { mockDocuments, mockDocumentTypes } from '../mock/compliance';

const DOCS_KEY = 'fuelflux_compliance_docs';
const TYPES_KEY = 'fuelflux_compliance_types';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const getStoredDocuments = (): ComplianceDocument[] => {
  if (typeof window === 'undefined') return mockDocuments;
  const stored = localStorage.getItem(DOCS_KEY);
  if (!stored) {
    localStorage.setItem(DOCS_KEY, JSON.stringify(mockDocuments));
    return mockDocuments;
  }
  return JSON.parse(stored);
};

const setStoredDocuments = (docs: ComplianceDocument[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(DOCS_KEY, JSON.stringify(docs));
  }
};

const getStoredTypes = (): DocumentTypeConfig[] => {
  if (typeof window === 'undefined') return mockDocumentTypes;
  const stored = localStorage.getItem(TYPES_KEY);
  if (!stored) {
    localStorage.setItem(TYPES_KEY, JSON.stringify(mockDocumentTypes));
    return mockDocumentTypes;
  }
  return JSON.parse(stored);
};

const setStoredTypes = (types: DocumentTypeConfig[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(TYPES_KEY, JSON.stringify(types));
  }
};

// Auto-updates statuses based on expiry dates relative to current date
const syncDocumentStatuses = (docs: ComplianceDocument[]): ComplianceDocument[] => {
  const now = new Date();
  const types = getStoredTypes();

  return docs.map(doc => {
    if (doc.status === 'pending_upload') return doc;
    
    const expiry = new Date(doc.expiryDate);
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // Find alert threshold days from configs
    const config = types.find(t => t.name === doc.type);
    const alertThreshold = config ? config.reminderDays : 30;

    let status: ComplianceDocument['status'] = 'active';
    if (diffDays <= 0) {
      status = 'expired';
    } else if (diffDays <= alertThreshold) {
      status = 'expiring_soon';
    }

    return { ...doc, status };
  });
};

export const complianceService = {
  fetchComplianceStats: async (pumpId: string): Promise<ComplianceStats> => {
    await sleep(400);
    const docs = syncDocumentStatuses(getStoredDocuments());
    
    return {
      total: docs.length,
      active: docs.filter(d => d.status === 'active').length,
      expiringSoon: docs.filter(d => d.status === 'expiring_soon').length,
      expired: docs.filter(d => d.status === 'expired').length,
    };
  },

  fetchDocuments: async (
    pumpId: string,
    filters?: { search?: string; status?: string; type?: string }
  ): Promise<ComplianceDocument[]> => {
    await sleep(500);
    let docs = syncDocumentStatuses(getStoredDocuments());

    if (filters) {
      if (filters.search) {
        const query = filters.search.toLowerCase();
        docs = docs.filter(
          d =>
            d.name.toLowerCase().includes(query) ||
            d.certificateNumber.toLowerCase().includes(query) ||
            d.issuingAuthority.toLowerCase().includes(query)
        );
      }
      if (filters.status && filters.status !== 'all') {
        docs = docs.filter(d => d.status === filters.status);
      }
      if (filters.type && filters.type !== 'all') {
        docs = docs.filter(d => d.type === filters.type);
      }
    }

    return docs;
  },

  uploadDocument: async (
    pumpId: string,
    payload: Omit<ComplianceDocument, 'id' | 'status' | 'fileUrl' | 'uploadedAt' | 'fileName'> & { file: File | null }
  ): Promise<ComplianceDocument> => {
    await sleep(800);
    const docs = getStoredDocuments();
    
    const newDoc: ComplianceDocument = {
      ...payload,
      id: 'doc_' + Math.random().toString(36).substr(2, 9),
      status: payload.file ? 'active' : 'pending_upload',
      fileUrl: payload.file ? `/uploads/documents/${payload.file.name}` : null,
      fileName: payload.file ? payload.file.name : null,
      uploadedAt: payload.file ? new Date().toISOString() : null,
    };

    const updated = [newDoc, ...docs];
    setStoredDocuments(updated);
    return syncDocumentStatuses([newDoc])[0];
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
    await sleep(800);
    const docs = getStoredDocuments();
    const docIdx = docs.findIndex(d => d.id === documentId);
    
    if (docIdx === -1) throw new Error('Document not found');
    
    const original = docs[docIdx];
    const updatedDoc: ComplianceDocument = {
      ...original,
      certificateNumber: payload.certificateNumber,
      issueDate: payload.issueDate,
      expiryDate: payload.expiryDate,
      status: 'active',
      fileUrl: payload.file ? `/uploads/documents/${payload.file.name}` : original.fileUrl,
      fileName: payload.file ? payload.file.name : original.fileName,
      uploadedAt: payload.file ? new Date().toISOString() : original.uploadedAt,
    };

    docs[docIdx] = updatedDoc;
    setStoredDocuments(docs);
    return syncDocumentStatuses([updatedDoc])[0];
  },

  deleteDocument: async (pumpId: string, documentId: string): Promise<void> => {
    await sleep(400);
    const docs = getStoredDocuments();
    const filtered = docs.filter(d => d.id !== documentId);
    setStoredDocuments(filtered);
  },

  fetchSettings: async (pumpId: string): Promise<DocumentTypeConfig[]> => {
    await sleep(300);
    return getStoredTypes();
  },

  saveSettings: async (pumpId: string, configs: DocumentTypeConfig[]): Promise<DocumentTypeConfig[]> => {
    await sleep(600);
    setStoredTypes(configs);
    return configs;
  },
};
